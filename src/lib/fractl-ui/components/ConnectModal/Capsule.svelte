<script lang="ts">
	import type CapsuleWeb from '@usecapsule/web-sdk'
	import type { Connector } from '@wagmi/core'
	import { wagmiStore } from './../../../wagmi'
	import { signMessage } from '@wagmi/core'
	import config from '../../../evm/wagmiConfig'

	export let connector: Connector
	export let fractl
	console.log('capsule connector: ', connector)
	let capsule: CapsuleWeb

	connector.getProvider().then(async provider => {
		console.log('provider returned: ', provider)
		if (!provider) return
		capsule = provider.capsule

		// provider.connect()
	})

	let email = ''
	let verificationCode = ''
	let recoveryKey = ''
	let walletAddress: string | undefined = ''
	let message = ''
	let signature

	let loadingLogin = false
	let loadingSignMessage = false
	let newUser = true
	let passkeyUrl: string

	async function createOrLoginEmail() {
		loadingLogin = true
		try {
			await capsule.logout()
			newUser = !(await capsule.checkIfUserExists(email))

			if (newUser) {
				await capsule.createUser(email)
			} else {
				passkeyUrl = await capsule.initiateUserLogin(email)
				console.log('waiting for login and setup')
				await capsule.waitForLoginAndSetup()
				walletAddress = (await capsule.fetchWallets())[0]?.address
				console.log('fully logged in:', await capsule.isFullyLoggedIn())
			}
		} catch (e) {
			console.error(e as Error)
		} finally {
			loadingLogin = false
		}
	}

	async function handleSign() {
		loadingSignMessage = true

		try {
			// const ethersSigner = new CapsuleEthersSigner(capsule)
			// signature = await ethersSigner.signMessage(message)
			signature = await signMessage($wagmiStore, {
				// account: '0xd',
				message,
				connector,
			})
			console.log('signed message', signature)
		} catch (e) {
			console.error((e as Error).message)
		} finally {
			loadingSignMessage = false
		}
	}
	async function isConnected() {
		await fractl.connect(connector)
		console.log(fractl.state)
	}
</script>

<div class="container">
	{#if capsule}
		<button on:click={isConnected}>is connected?</button>
		<form on:submit|preventDefault={createOrLoginEmail}>
			<label>
				Email
				<input
					placeholder="Email"
					bind:value={email}
					type="email webauthn"
					name="email"
				/>
			</label>
			<button
				on:click={createOrLoginEmail}
				disabled={loadingLogin}
				type="submit"
				color="primary">Login</button
			>
		</form>
		{#if passkeyUrl}
			<a href={passkeyUrl} target="_blank">Complete Sign-in</a>
		{/if}

		<form on:submit|preventDefault={handleSign}>
			<label>
				Message
				<input
					bind:value={message}
					type="text"
					id="message"
					name="message"
					required
				/>
			</label>
			<button disabled={loadingSignMessage} type="submit" color="primary"
				>Sign Message</button
			>
		</form>
	{:else}
		Capsule Connector is not available
	{/if}
</div>
