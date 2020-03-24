/* eslint-disable no-console */
import jwt from 'jsonwebtoken'
import readLine from 'readline'
import { createGrayskullClient, ITokenStorage } from 'grayskull-sdk'
import { IAccessTokenResponse, IIDToken, IProfileClaim } from 'grayskull-sdk/dist/foundation/types'

const TEST_CLIENT_ID = '94623896-a8f5-4e55-b955-9f12b53d0b32'
const TEST_CLIENT_SECRET = '0b2ced047f55fc2e080904b44b704e64114a7605cbf0423fb6ae0a73f4e528c1'

const GRAYSKULL_SERVER_URL = 'http://localhost:3000'

// Sample in-memory token storage
const tokens: any = {}
const tokenStorage: ITokenStorage = {
	getToken: (tokenType) => tokens[tokenType],
	setToken: (tokenType, value, expires) => {
		tokens[tokenType] = value
	}
}
const client = createGrayskullClient(TEST_CLIENT_ID, TEST_CLIENT_SECRET, GRAYSKULL_SERVER_URL, tokenStorage)

async function handleChallenge() {
	const rl = readLine.createInterface({ input: process.stdin, output: process.stdout })
	rl.question('Multifactor Token? ', async (multifactorToken) => {
		rl.close()
		const multifactorResult = await client.authenticateWithMultifactorToken(multifactorToken)
		if (multifactorResult.challenge) {
			await handleChallenge()
		} else {
			await handleTokenResponse(multifactorResult)
		}
	})
}

async function handleTokenResponse(tokenResponse: IAccessTokenResponse) {
	if (tokenResponse.id_token) {
		const decoded = jwt.verify(tokenResponse.id_token, TEST_CLIENT_SECRET) as IIDToken & IProfileClaim
		if (decoded) {
			console.log(`Hello ${decoded.given_name} ${decoded.family_name}`)
		}

		const updated = await client.updateUserProfile({ given_name: 'Updated' })
		console.log(JSON.stringify(updated))
	} else if (tokenResponse.access_token) {
		const users = await client.listAuthorizedUsers(2, 0)
		console.log(users)
		const createdUser = await client.createUserAccount(
			{ email: 'test3@test.com', family_name: 'User', given_name: 'Test' },
			'Password1'
		)
		console.log(createdUser)
	}
}

async function main() {
	const rl = readLine.createInterface({ input: process.stdin, output: process.stdout })
	rl.question('Email Address? ', async (emailAddress) => {
		await client.resetPassword(emailAddress, `https://www.google.com`)
		rl.question('Token? ', (token) => {
			rl.question('New Password? ', async (newPassword) => {
				const result = await client.changePasswordWithToken(emailAddress, token, newPassword)
				console.log(result)
				rl.close()
			})
		})
	})
}

main()
