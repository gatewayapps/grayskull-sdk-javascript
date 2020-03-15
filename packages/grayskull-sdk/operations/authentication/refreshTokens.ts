import { RequestFunction, IAccessTokenResponse } from '../../foundation/types'
import { GrantTypes } from '../../foundation/types/grantTypes'

export async function refreshTokens(refreshToken: string, makeRequest: RequestFunction): Promise<IAccessTokenResponse> {
	return await makeRequest(
		'/api/token',
		{ refresh_token: refreshToken, grant_type: GrantTypes.RefreshToken.id },
		'POST'
	)
}
