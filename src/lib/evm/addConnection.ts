import type { AccountData, AccountDataResponse, Config } from '../types'
import {
	connect,
	reconnect,
	disconnect,
	getAccount,
	getBalance,
	getEnsName,
	getEnsAvatar,
	type Connector,
	type Config as wagmiConfig,
	type GetEnsNameReturnType,
	type GetEnsAvatarReturnType
} from '@wagmi/core'
import { formatUnits } from 'viem/utils'
import { map } from 'nanostores'

type WagmiConfig = Config<Connector>

/**
 * Provides connection details to fractl-modal passed into it's config parameter
 */
export const addEvmConnection = async (
	config: wagmiConfig,
	{ resolver } = { resolver: 'ENS' }
): Promise<WagmiConfig> => {
	const state = map({
		current: config.state.connections.get(config.state.current),
		status: config.state.status
	})

	const accountData = map<AccountData>({
		account: null,
		balance: null,
		nameService: {
			name: null,
			avatar: null
		}
	})

	config.subscribe(
		(state) => state.current,
		(current) => state.setKey('current', config.state.connections.get(current))
	)
	config.subscribe(
		(state) => state.status,
		(status) => {
			updateAccount(status)
			state.setKey('status', status)
		}
	)

	async function updateAccount(
		status: 'connected' | 'connecting' | 'disconnected' | 'reconnecting'
	) {
		if (status !== 'connected') {
			accountData.setKey('account', null)
			accountData.setKey('balance', null)
			accountData.setKey('nameService', { name: undefined, avatar: undefined })
			return
		}

		const account = getAccount(config)
		accountData.setKey('account', account)
		/* Not sure if this is possible */
		if (!account.isConnected) throw Error('account is not connected')
		const address = account.address!

		try {
			const _balance = await getBalance(config, { address })
			const balance: AccountDataResponse['balance'] = {
				symbol: _balance.symbol,
				value: formatUnits(_balance.value, _balance.decimals)
			}
			accountData.setKey('balance', balance)

			let name: GetEnsNameReturnType, avatar: GetEnsAvatarReturnType

			switch (resolver) {
				default:
					name = await getEnsName(config, {
						address,
						blockTag: 'finalized'
					})

					avatar =
						name &&
						(await getEnsAvatar(config, {
							name,
							blockTag: 'finalized'
						}))
			}

			// accountData.setKey('account', account)
			accountData.setKey('nameService', { name, avatar })
			console.log(accountData.get())
		} catch (error) {
			console.log(accountData.get())
			console.error('fetch error', error)
		}
	}

	return {
		state: { subscribe: state.subscribe },
		accountData: { subscribe: accountData.subscribe },
		get connectors() {
			return config.connectors
		},
		connect: async (connector: Connector) => {
			const { accounts, chainId } = await connect(config, { connector })
			accountData.setKey('account', {
				address: accounts?.[0],
				addresses: accounts
			})
			return { accounts, chainId }
		},
		reconnect: async (connectors: Connector[]) =>
			await reconnect(config, { connectors }),
		disconnect: async (connector?: Connector) =>
			disconnect(config, { connector: connector })
	}
}
