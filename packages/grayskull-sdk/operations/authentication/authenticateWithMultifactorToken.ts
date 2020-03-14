import { IAccessTokenResponse, RequestFunction } from '../../foundation/types'
import { GrantTypes } from '../../foundation/types/grantTypes'

export async function authenticateWithMultifactorToken(
	multifactorToken: string,
	challengeToken: string,
	makeRequest: RequestFunction
) {
	return makeRequest<IAccessTokenResponse>(
		`/api/token`,
		{ grant_type: GrantTypes.MultifactorToken.id, otp_token: multifactorToken, challenge_token: challengeToken },
		'POST'
	)
}
