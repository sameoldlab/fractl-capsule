<!-- capsule.org custom ui example in vue: https://github.com/capsule-org/vue-example/blob/main/ethers-v6/src/components/CapsuleButton.vue by https://github.com/nsquare3 -->

<script lang="ts" setup>
	import Capsule, { Environment } from '@usecapsule/web-sdk'
	import { CapsuleEthersSigner } from '@usecapsule/ethers-v6-integration'
	import { ref } from 'vue'

	const capsule = new Capsule(
		Environment.DEVELOPMENT,
		'd0b61c2c8865aaa2fb12886651627271' // this is not sensitive so passing inline for simplicity
	)

	const email = ref('')
	const verificationCode = ref('')
	const recoveryKey = ref('')
	const walletAddress = ref<string | undefined>('')
	const message = ref('')
	const signature = ref('')

	const loadingCreate = ref(false)
	const loadingVerifyEmail = ref(false)
	const loadingSignMessage = ref(false)
	const loadingLogin = ref(false)
	const loadingLogout = ref(false)

	async function createUser() {
		loadingCreate.value = true

		try {
			await capsule.logout()
			await capsule.createUser(email.value)
		} catch (e) {
			console.error((e as Error).message)
		} finally {
			loadingCreate.value = false
		}
	}

	async function verifyEmail() {
		loadingVerifyEmail.value = true

		try {
			const passkeyUrl = await capsule.verifyEmail(verificationCode.value)
			window.open(passkeyUrl, 'popup', 'width=575,height=820')

			recoveryKey.value = await capsule.waitForPasskeyAndCreateWallet()
			walletAddress.value = Object.values(capsule.getWallets())[0].address
		} catch (e) {
			console.error((e as Error).message)
		} finally {
			loadingVerifyEmail.value = false
		}
	}

	async function signMessage() {
		loadingSignMessage.value = true

		try {
			const ethersSigner = new CapsuleEthersSigner(capsule)
			signature.value = await ethersSigner.signMessage(message.value)
		} catch (e) {
			console.error((e as Error).message)
		} finally {
			loadingSignMessage.value = false
		}
	}

	async function loginUser() {
		loadingLogin.value = true

		try {
			await capsule.logout()
			const passkeyUrl = await capsule.initiateUserLogin(email.value)
			window.open(passkeyUrl, 'popup', 'width=575,height=820')

			await capsule.waitForLoginAndSetup()
			walletAddress.value = Object.values(capsule.getWallets())[0].address
		} catch (e) {
			console.error((e as Error).message)
		} finally {
			loadingLogin.value = false
		}
	}

	async function logout() {
		loadingLogout.value = true

		try {
			await capsule.logout()
		} catch (e) {
			console.error((e as Error).message)
		} finally {
			loadingLogout.value = false
		}
	}
</script>

<template>
	<v-container>
		<v-row>
			<v-col cols="12" md="12">
				<v-card>
					<v-card-title>Create User</v-card-title>
					<v-card-text>
						<v-form @submit.prevent="createUser">
							<v-text-field
								v-model="email"
								label="Email"
								required
							></v-text-field>
							<v-btn :loading="loadingCreate" type="submit" color="primary"
								>Create User</v-btn
							>
						</v-form>
					</v-card-text>
				</v-card>
			</v-col>
		</v-row>
		<v-row>
			<v-col cols="12" md="12">
				<v-card>
					<v-card-title>Verify Email</v-card-title>
					<v-card-text>
						<v-form @submit.prevent="verifyEmail">
							<v-text-field
								v-model="verificationCode"
								label="Verification Code"
								required
							></v-text-field>
							<v-btn :loading="loadingVerifyEmail" type="submit" color="primary"
								>Verify Email</v-btn
							>
						</v-form>
					</v-card-text>
				</v-card>
			</v-col>
		</v-row>
		<v-row>
			<v-col cols="12" md="12">
				<v-card>
					<v-card-title>Wallet Address</v-card-title>
					<v-card-text>
						<code>{{ walletAddress }}</code>
					</v-card-text>
				</v-card>
				<v-card>
					<v-card-title>Recovery Key</v-card-title>
					<v-card-text>
						<code>{{ recoveryKey }}</code>
					</v-card-text>
				</v-card>
			</v-col>
			<v-col cols="12" md="12">
				<v-card>
					<v-card-title>Sign Message</v-card-title>
					<v-card-text>
						<v-form @submit.prevent="signMessage">
							<v-text-field
								v-model="message"
								label="Message"
								required
							></v-text-field>
							<v-btn :loading="loadingSignMessage" type="submit" color="primary"
								>Sign Message</v-btn
							>
						</v-form>
					</v-card-text>
				</v-card>
			</v-col>
			<v-col cols="12" md="12">
				<v-card>
					<v-card-title>Message Signature</v-card-title>
					<v-card-text>
						<code>{{ signature }}</code>
					</v-card-text>
				</v-card>
			</v-col>
			<v-col cols="12" md="12">
				<v-card>
					<v-card-title>Login User</v-card-title>
					<v-card-text>
						<v-form @submit.prevent="loginUser">
							<v-text-field
								v-model="email"
								label="Email"
								required
							></v-text-field>
							<v-btn :loading="loadingLogin" type="submit" color="primary"
								>Login</v-btn
							>
						</v-form>
					</v-card-text>
				</v-card>
			</v-col>
			<v-col cols="12" md="12">
				<v-card>
					<v-card-title>Logout User</v-card-title>
					<v-card-text>
						<v-form @submit.prevent="logout">
							<v-btn :loading="loadingLogout" type="submit" color="primary"
								>Logout</v-btn
							>
						</v-form>
					</v-card-text>
				</v-card>
			</v-col>
		</v-row>
	</v-container>
</template>
