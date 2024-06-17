<script lang="ts">
	import FractlScaffold from './lib/fractl-ui/components/FractlScaffold.svelte'
	import { addEvmConnection } from './lib/evm/index'
	/*--------------------------------------------------------------------------------------------------------------------------------*/
	import { wagmiStore, capsuleStore } from './lib/wagmi'
	import CapsuleComp from './lib/capsule.svelte'

	let config = addEvmConnection($wagmiStore)
</script>

<main>
	<h1>Fractl + Capsule</h1>
	{#await config then config}
		<FractlScaffold {config} />
	{/await}
	<br /><br /><br />
	<hr />
	<hr />
	<hr />
	<CapsuleComp capsule={$capsuleStore} config={$wagmiStore} />
</main>

<style>
</style>
