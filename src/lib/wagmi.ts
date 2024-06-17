import { http, createConfig, createStorage } from '@wagmi/core'
import { mainnet, arbitrum } from '@wagmi/core/chains'
import Capsule, { Environment } from '@usecapsule/web-sdk'
import { capsuleConnector } from '@usecapsule/wagmi-v2-integration'

import { readable } from 'svelte/store'

const storage = createStorage({ storage: localStorage })
const capsule = new Capsule(
	Environment.BETA,
	import.meta.env.VITE_CAPSULE_API_KEY
)

export const wagmiConfig = createConfig({
	chains: [mainnet, arbitrum],
	storage,
	transports: {
		[mainnet.id]: http(),
		[arbitrum.id]: http(),
	},
	connectors: [
		capsuleConnector({
			capsule,
			chains: [mainnet, arbitrum],
			options: {},
			appName: 'Fractl UI',
			disableModal: true,
		}),
	],
})

export const wagmiStore = readable(wagmiConfig)
export const capsuleStore = readable(capsule)
