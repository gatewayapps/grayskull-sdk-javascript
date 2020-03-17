import jwt from 'jsonwebtoken'
import readLine from 'readline'
import { createGrayskullClient, ITokenStorage } from 'grayskull-sdk'
import { IAccessTokenResponse, IIDToken, IProfileClaim, IAccessToken } from 'grayskull-sdk/dist/foundation/types'

const TEST_CLIENT_ID = '27cdc20a-fcec-40c2-afb3-c288eea64608'
const TEST_CLIENT_SECRET = '664d8d274d2b33521f70c013dfd7b1496a5c91297b3d0ba58e3fb83e1319b8d9'

const GRAYSKULL_SERVER_URL = 'http://localhost:3000'

// Sample in-memory token storage
let tokens: any = {}
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
			handleTokenResponse(multifactorResult)
		}
	})
}

async function handleTokenResponse(tokenResponse: IAccessTokenResponse) {
	if (tokenResponse.id_token) {
		const decoded = jwt.verify(tokenResponse.id_token, TEST_CLIENT_SECRET) as IIDToken & IProfileClaim
		if (decoded) {
			console.log(`Hello ${decoded.given_name} ${decoded.family_name}`)
		}
	} else if (tokenResponse.access_token) {
		const users = await client.listAuthorizedUsers()
		console.log(users)
	}
}

async function main() {
	const result = await client.authenticateWithClientCredentials()
	if (result.challenge) {
		handleChallenge()
	} else {
		handleTokenResponse(result)
	}
}

main()
