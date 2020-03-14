import { createGrayskullClient, ITokenStorage } from 'grayskull-sdk'

const TEST_CLIENT_ID = '27cdc20a-fcec-40c2-afb3-c288eea64608'
const TEST_CLIENT_SECRET = '664d8d274d2b33521f70c013dfd7b1496a5c91297b3d0ba58e3fb83e1319b8d9'

const TEST_USER_EMAIL_ADDRESS = 'test@test.com'
const TEST_USER_PASSWORD = 'password'

const GRAYSKULL_SERVER_URL = 'http://localhost:3000'

// Sample in-memory token storage
let tokens: any = {}
const tokenStorage: ITokenStorage = {
	getToken: (tokenType) => tokens[tokenType],
	setToken: (tokenType, value, expires) => {
		tokens[tokenType] = value
	}
}

async function main() {
	const client = createGrayskullClient(TEST_CLIENT_ID, TEST_CLIENT_SECRET, GRAYSKULL_SERVER_URL, tokenStorage)
	const result = await client.authenticateWithCredentials(TEST_USER_EMAIL_ADDRESS, TEST_USER_PASSWORD, [
		'profile',
		'openid',
		'offline_access'
	])
	console.log(result)
}

main()
