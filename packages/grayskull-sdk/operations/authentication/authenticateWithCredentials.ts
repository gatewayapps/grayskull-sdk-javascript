import { IAccessTokenResponse, RequestFunction } from '../../foundation/types'
import { GrantTypes } from '../../foundation/types/grantTypes'

export async function authenticateWithCredentials(
	emailAddress: string,
	password: string,
	scopes: string[],
	makeRequest: RequestFunction
) {
	return makeRequest<IAccessTokenResponse>(
		`/api/token`,
		{ username: emailAddress, password, scopes, grant_type: GrantTypes.Password.id },
		'POST'
	)
}
