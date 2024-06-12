import {
	type Address,
	type EIP1193RequestFn,
	type Hex,
	RpcRequestError,
	SwitchChainError,
	type Transport,
	UserRejectedRequestError,
	type WalletRpcSchema,
	custom,
	fromHex,
	getAddress,
	numberToHex
} from 'viem'
import { rpc } from 'viem/utils'

import {
	ChainNotConfiguredError,
	ConnectorNotConnectedError,
	createConnector,
	normalizeChainId
} from '@wagmi/core'

export type MockParameters = {
	accounts: readonly [Address, ...Address[]]
	features?:
		| {
				connectError?: boolean | Error | undefined
				switchChainError?: boolean | Error | undefined
				signMessageError?: boolean | Error | undefined
				signTypedDataError?: boolean | Error | undefined
				reconnect?: boolean | undefined
		  }
		| undefined
}

mock.type = 'mock' as const
export function mock(parameters: MockParameters) {
	const features = parameters.features ?? {}

	type Provider = ReturnType<
		Transport<'custom', object, EIP1193RequestFn<WalletRpcSchema>>
	>
	let connected = false
	let connectedChainId: number

	return createConnector<Provider>((config) => ({
		id: 'mock',
		name: 'Demo Wallet',
		type: mock.type,
		async setup() {
			connectedChainId = config.chains[0].id
		},
		async connect({ chainId } = {}) {
			if (features.connectError) {
				if (typeof features.connectError === 'boolean')
					throw new UserRejectedRequestError(new Error('Failed to connect.'))
				throw features.connectError
			}

			const provider = await this.getProvider()
			const accounts = await provider.request({
				method: 'eth_requestAccounts'
			})

			let currentChainId = await this.getChainId()
			if (chainId && currentChainId !== chainId) {
				const chain = await this.switchChain!({ chainId })
				currentChainId = chain.id
			}

			connected = true

			return { accounts, chainId: currentChainId }
		},
		async disconnect() {
			connected = false
		},
		async getAccounts() {
			if (!connected) throw new ConnectorNotConnectedError()
			const provider = await this.getProvider()
			const accounts = await provider.request({ method: 'eth_accounts' })
			return accounts.map(getAddress)
		},
		async getChainId() {
			const provider = await this.getProvider()
			const hexChainId = await provider.request({ method: 'eth_chainId' })
			return fromHex(hexChainId, 'number')
		},
		async isAuthorized() {
			if (!features.reconnect) return false
			if (!connected) return false
			const accounts = await this.getAccounts()
			return !!accounts.length
		},
		async switchChain({ chainId }) {
			const provider = await this.getProvider()
			const chain = config.chains.find((x) => x.id === chainId)
			if (!chain) throw new SwitchChainError(new ChainNotConfiguredError())

			await provider.request({
				method: 'wallet_switchEthereumChain',
				params: [{ chainId: numberToHex(chainId) }]
			})
			return chain
		},
		onAccountsChanged(accounts) {
			if (accounts.length === 0) this.onDisconnect()
			else config.emitter.emit('change', { accounts: accounts.map(getAddress) })
		},
		onChainChanged(chain) {
			const chainId = normalizeChainId(chain)
			config.emitter.emit('change', { chainId })
		},
		async onDisconnect(/* _error */) {
			config.emitter.emit('disconnect')
			connected = false
		},
		async getProvider({ chainId } = {}) {
			const chain =
				config.chains.find((x) => x.id === chainId) ?? config.chains[0]
			const url = chain.rpcUrls.default.http[0]!

			const request: EIP1193RequestFn = async ({ method, params }) => {
				// eth methods
				if (method === 'eth_chainId') return numberToHex(connectedChainId)
				if (method === 'eth_requestAccounts') return parameters.accounts
				if (method === 'eth_signTypedData_v4')
					if (features.signTypedDataError) {
						if (typeof features.signTypedDataError === 'boolean')
							throw new UserRejectedRequestError(
								new Error('Failed to sign typed data.')
							)
						throw features.signTypedDataError
					}

				// wallet methods
				if (method === 'wallet_switchEthereumChain') {
					if (features.switchChainError) {
						if (typeof features.switchChainError === 'boolean')
							throw new UserRejectedRequestError(
								new Error('Failed to switch chain.')
							)
						throw features.switchChainError
					}
					type Params = [{ chainId: Hex }]
					connectedChainId = fromHex((params as Params)[0].chainId, 'number')
					this.onChainChanged(connectedChainId.toString())
					return
				}

				// other methods
				if (method === 'personal_sign') {
					if (features.signMessageError) {
						if (typeof features.signMessageError === 'boolean')
							throw new UserRejectedRequestError(
								new Error('Failed to sign message.')
							)
						throw features.signMessageError
					}
					// Change `personal_sign` to `eth_sign` and swap params
					method = 'eth_sign'
					type Params = [data: Hex, address: Address]
					params = [(params as Params)[1], (params as Params)[0]]
				}

				const body = { method, params }
				const { error, result } = await rpc.http(url, { body })
				if (error) throw new RpcRequestError({ body, error, url })

				return result
			}
			return custom({ request })({ retryCount: 0 })
		}
	}))
}
