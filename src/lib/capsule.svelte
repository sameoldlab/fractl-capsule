<!-- capsule.org custom ui example in vue: https://github.com/capsule-org/vue-example/blob/main/ethers-v6/src/components/CapsuleButton.vue by https://github.com/nsquare3 -->
<script lang="ts">
	export let capsule: Capsule
	export let config: Config

	let email = ''
	let verificationCode = ''
	let recoveryKey = ''
	let walletAddress: string | undefined = ''
	let message = ''
	let signature = ''

	let loadingCreate = false
	let loadingVerifyEmail = false
	let loadingSignMessage = false
	let loadingLogin = false
	let loadingLogout = false

	let createError = { code: undefined, message: '' }
	async function createUser() {
		loadingCreate = true

		try {
			await capsule.logout()
			console.log(`creating user with email"${email}"`)
			await capsule.createUser(email)
		} catch (e) {
			console.error(e as Error)
		} finally {
			loadingCreate = false
		}
	}

	async function verifyEmail() {
		loadingVerifyEmail = true

		try {
			const passkeyUrl = await capsule.verifyEmail(verificationCode)
			window.open(passkeyUrl, 'popup', 'width=575,height=820')

			recoveryKey = await capsule.waitForPasskeyAndCreateWallet()
			walletAddress = Object.values(capsule.getWallets())[0].address
		} catch (e) {
			console.error((e as Error).message)
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
			console.log('signed message', signature)
		} catch (e) {
			console.error((e as Error).message)
		} finally {
			loadingSignMessage = false
		}
	}

	async function loginUser() {
		loadingLogin = true

		try {
			await capsule.logout()
			const passkeyUrl = await capsule.initiateUserLogin(email)
			window.open(passkeyUrl, 'popup', 'width=575,height=820')

			await capsule.waitForLoginAndSetup()
			walletAddress = Object.values(capsule.getWallets())[0].address
		} catch (e) {
			console.error((e as Error).message)
		} finally {
			loadingLogin = false
		}
	}

	async function logout() {
		loadingLogout = true

		try {
			await capsule.logout()
		} catch (e) {
			console.error((e as Error).message)
		} finally {
			loadingLogout = false
		}
	}
</script>

<div class="container">
	<div class="row">
		<div class="grid col-12">
			<div class="card">
				<h2>Create User</h2>
				<div class="card-text">
					<form on:submit|preventDefault={createUser}>
						<input
							type="input text-input"
							autocomplete="email webauthn"
							placeholder="Email"
							required
							bind:value={email}
						/>
						<button disabled={loadingCreate} type="submit" color="primary">
							Create User
						</button>
					</form>
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
				<h2>Login User</h2>
				<div class="card-text">
					<form on:submit|preventDefault={loginUser}>
						<label>
							Email
							<input
								bind:value={email}
								type="email webauthn"
								id="email"
								name="email"
								required
							/>
						</label>
						<button disabled={loadingLogin} type="submit" color="primary"
							>Login</button
						>
					</form>
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
