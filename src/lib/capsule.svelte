<script lang="ts">
	import type { CapsuleWeb } from "@usecapsule/web-sdk"
	import type { Config } from "@wagmi/core"

	export let capsule: CapsuleWeb
	export let config: Config
	let logs = ''
	const log = (...args) => {
		args.forEach(v => {
			if (typeof v === 'string') logs += v
			else logs += JSON.stringify(v)
			console.log(v)
		})
	}
	let errors = ''
	const error = (...args) => {
		args.forEach(v => {
			if (typeof v === 'string') errors += v
			else errors += JSON.stringify(v)
			console.error(v)
		})
	}
	let email = ''
	let verificationCode = ''
	let recoveryKey = ''
	let walletAddress: string | undefined = ''
	let message = ''
	let signature = ''

	let loadingVerifyEmail = false
	let loadingSignMessage = false
	let loadingLogin = false
	let loadingLogout = false
	let newUser = true
	let passkeyUrl: string

	async function getWallets() {
		log(capsule.userId)
		globalThis.capsule = capsule
		log(capsule)
	}

	async function createOrLoginEmail() {
		loadingLogin = true
		try {
			await capsule.logout()
			newUser = !(await capsule.checkIfUserExists(email))

			if (newUser) {
				await capsule.createUser(email)
			} else {
				passkeyUrl = await capsule.initiateUserLogin(email)
				log('waiting for login and setup')
				await capsule.waitForLoginAndSetup()
				walletAddress = (await capsule.fetchWallets())[0]?.address
			}
		} catch (e) {
			console.error(e as Error)
		} finally {
			loadingLogin = false
		}
	}

	async function verifyEmail() {
		loadingVerifyEmail = true

		try {
			passkeyUrl = await capsule.verifyEmail(verificationCode)
			recoveryKey = await capsule.waitForPasskeyAndCreateWallet()
			walletAddress = capsule.getWallets()[0]?.address
		} catch (e) {
			error((e as Error).message)
		} finally {
			loadingVerifyEmail = false
		}
	}

	async function signMessage() {
		loadingSignMessage = true

		try {
			// const ethersSigner = new CapsuleEthersSigner(capsule)
			// signature = await ethersSigner.signMessage(message)
			signature = await signMessage(config, { message })
			log('signed message', signature)
		} catch (e) {
			error((e as Error).message)
		} finally {
			loadingSignMessage = false
		}
	}

	async function logout() {
		loadingLogout = true

		try {
			await capsule.logout()
		} catch (e) {
			error((e as Error).message)
		} finally {
			loadingLogout = false
		}
	}
</script>

<h3>Errors:</h3>
<p>{errors}</p>

<h3>Logs:</h3>
<p>{logs}</p>
<button on:click={getWallets}>Get Wallets</button>
<div class="container">
	<div class="row">
		<div class="grid col-12">
			<div class="card">
				<h2>Login User</h2>
				<div class="card-text">
					<form on:submit|preventDefault={createOrLoginEmail}>
						<label>
							Email
							<input bind:value={email} type="email webauthn" name="email" />
						</label>
						<button
							on:click={createOrLoginEmail}
							disabled={loadingLogin}
							type="submit"
							color="primary">Login</button
						>
					</form>
					{#if passkeyUrl}
						<button on:click={() => testOpen(passkeyUrl)}>Complete Login</button
						>
						<a href={passkeyUrl} target="_blank">Complete Sign-in</a>
					{/if}
				</div>
			</div>
		</div>
	</div>
	<div class="row">
		<div class="grid col-12">
			<div class="card">
				<h2>Verify Email</h2>
				<div class="card-text">
					<form on:submit|preventDefault={verifyEmail}>
						<label>
							Verifiaction Code
							<input bind:value={verificationCode} type="tel" required />
						</label>

						<button disabled={loadingVerifyEmail} type="submit" color="primary"
							>Verify Email</button
						>
					</form>
				</div>
			</div>
		</div>
	</div>
	<div class="row">
		<div class="grid col-12">
			<div class="card">
				<h2>Wallet Address</h2>
				<div class="card-text">
					<code>{JSON.stringify(walletAddress)}</code>
				</div>
			</div>
			<div class="card">
				<h2>Recovery Key</h2>
				<div class="card-text">
					<code>{JSON.stringify(recoveryKey)}</code>
				</div>
			</div>
		</div>
		<div class="grid col-12">
			<div class="card">
				<h2>Sign Message</h2>
				<div class="card-text">
					<form on:submit|preventDefault={signMessage}>
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
				</div>
			</div>
		</div>
		<div class="grid col-12">
			<div class="card">
				<h2>Message Signature</h2>
				<div class="card-text">
					<code>{JSON.stringify(signature)}</code>
				</div>
			</div>
		</div>
		<div class="grid col-12">
			<div class="card">
				<h2>Logout User</h2>
				<div class="card-text">
					<form on:submit|preventDefault={logout}>
						<button disabled={loadingLogout} type="submit" color="primary"
							>Logout</button
						>
					</form>
				</div>
			</div>
		</div>
	</div>
</div>
