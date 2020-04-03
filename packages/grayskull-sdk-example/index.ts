/* eslint-disable no-console */
import readLine from 'readline'
import { createGrayskullClient, ITokenStorage } from 'grayskull-sdk'

const TEST_CLIENT_ID = '94623896-a8f5-4e55-b955-9f12b53d0b32'
const TEST_CLIENT_SECRET = '0b2ced047f55fc2e080904b44b704e64114a7605cbf0423fb6ae0a73f4e528c1'

const GRAYSKULL_SERVER_URL = 'http://localhost:3000'

// Sample in-memory token storage
const tokens: any = {}
const tokenStorage: ITokenStorage = {
	getToken: async (tokenType) => tokens[tokenType],
	setToken: async (tokenType, value) => {
		tokens[tokenType] = value
	},
	deleteToken: async (tokenType) => {
		delete tokens[tokenType]
	}
}
const client = createGrayskullClient(TEST_CLIENT_ID, TEST_CLIENT_SECRET, GRAYSKULL_SERVER_URL, tokenStorage)

async function main() {
	const rl = readLine.createInterface({ input: process.stdin, output: process.stdout })
	rl.question('email? ', async (emailAddress) => {
		rl.question('password? ', async (password) => {
			await client.authenticateWithCredentials(emailAddress, password, [
				'profile', // Gives you access to a users profile information
				'email', // Gives you access to a user's email address
				'profile:write', // Required for updating profile and changing password
				'offline_access', // Required for refresh token
				'openid' // Gives you a client specific user identifier
			])
			const userDetails = await client.getCurrentUser()
			console.log('USER DETAILS', userDetails)
			console.log(`Hello ${userDetails?.given_name} ${userDetails?.family_name}`)
			rl.question('New password? ', async (newPassword) => {
				const result = await client.changePasswordWithOldPassword(password, newPassword)
				console.log(result)
				rl.close()
				process.exit(0)
			})
		})
	})
}

main()
