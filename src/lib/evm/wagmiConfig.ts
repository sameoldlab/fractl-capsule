import { http, createConfig, createStorage } from '@wagmi/core'
import { mock } from './index'
import { mainnet, arbitrum } from '@wagmi/core/chains'
import { readable } from 'svelte/store'
import {capsuleConnector} from '@usecapsule/wagmi-v2-integration'
import Capsule, {Environment} from '@usecapsule/web-sdk'

const storage = createStorage({ storage: localStorage })
const capsule = new Capsule(Environment.BETA, import.meta.env.CAPSULE_API_KEY, {

})
export const config = createConfig({
	chains: [mainnet, arbitrum],
	storage,
	transports: {
		[mainnet.id]: http(),
		[arbitrum.id]: http(),
	},
	connectors: [
		mock({
			accounts: ['0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'],
		}),
		capsuleConnector({
			capsule,
			chains: [mainnet, arbitrum],
			options: {},
			appName: 'Fractl UI',
			disableModal: true
		})
	],
})

const wagmiStore = readable(config, set => {
	config.subscribe(
		state => state.status,
		() => set(config)
	)
})
console.log(config);

export default config

