import { RequestFunction, IAccessTokenResponse } from '../../foundation/types'
import { GrantTypes } from '../../foundation/types/grantTypes'

export async function authenticateWithClientCredentials(
	client_id: string,
	client_secret: string,
	makeRequest: RequestFunction
) {
	return makeRequest<IAccessTokenResponse>(
		`/api/token`,
		{
			client_id,
			client_secret,
			grant_type: GrantTypes.ClientCredentials.id
		},
		'POST'
	)
}
