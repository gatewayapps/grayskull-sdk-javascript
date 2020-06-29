/* eslint-disable no-console */

import { createGrayskullClient, ITokenStorage } from 'grayskull-sdk'

const TEST_CLIENT_ID = '69b5d655-d6c7-4321-8e38-5e1f240c0cbb'
const TEST_CLIENT_SECRET = 'ddeb551aef4304c8beb3843cdfc66b24941994e5fa2c9861a33d771d1b09db82'

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
	await client.authenticateWithCredentials('danielgary@gmail.com', 'password', ['profile'])

	const tokenResponse = await client.authenticateWithClientCredentials()
	console.log(tokenResponse)
	//await client.setUserMetadata('205cae88-a7bb-4af9-8a0e-32cd5552ad3c', 'role', 'admin')
	await client.updateUserProfile('e6dd4a9a-0e30-4e64-981c-4281a403e672', { given_name: 'Test Daniel' })
}

main()
