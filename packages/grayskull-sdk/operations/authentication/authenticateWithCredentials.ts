import { IAccessTokenResponse } from '../../foundation/types'

export async function authenticateWithCredentials(
	emailAddress: string,
	password: string,
	scopes: string[],
	makeRequest: <T>(endpoint, body) => Promise<T>
) {
	return makeRequest<IAccessTokenResponse>(`/api/token`, {})
}
