/* eslint-disable no-console */

import { createGrayskullClient, ITokenStorage } from 'grayskull-sdk'

const TEST_CLIENT_ID = 'b3d6af4d-e171-4865-9943-953c51e9e12b'
const TEST_CLIENT_SECRET = 'ddeb551aef4304c8beb3843cdfc66b24941994e5fa2c9861a33d771d1b09db82'

const GRAYSKULL_SERVER_URL = 'https://authenticate.gatewayapps.net'

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
const client = createGrayskullClient(TEST_CLIENT_ID, TEST_CLIENT_SECRET, GRAYSKULL_SERVER_URL, tokenStorage, 'RSA256')

async function main() {
	const tokenResponse = await client.authenticateWithCredentials('danielgary@gmail.com', 'password', [
		'profile',
		'openid'
	])

	console.log(tokenResponse)
	//await client.setUserMetadata('205cae88-a7bb-4af9-8a0e-32cd5552ad3c', 'role', 'admin')
}

main()
