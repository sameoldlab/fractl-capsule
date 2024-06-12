<script lang="ts">
	import FractlModal from './lib/fractl-ui/components/FractlModal.svelte'
	import { addEvmConnection } from './lib/evm/index'
	/*--------------------------------------------------------------------------------------------------------------------------------*/

	import { http, createConfig, createStorage } from '@wagmi/core'
	import { mainnet, arbitrum } from '@wagmi/core/chains'
	import Capsule, { Environment } from '@usecapsule/web-sdk'
	import { capsuleConnector } from '@usecapsule/wagmi-v2-integration'

	const storage = createStorage({ storage: localStorage })
	const capsule = new Capsule(
		Environment.BETA,
		import.meta.env.CAPSULE_API_KEY,
		{}
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
			}),
		],
	})

	let config = addEvmConnection(wagmiConfig)
</script>

<main>
	<h1>Fractl + Capsule</h1>
	<FractlModal {config} />

</main>

<style>
</style>
