import { RequestFunction, IOperationResponse } from '../../foundation/types'

export async function resetPassword(
	emailAddress: string,
	redirectUri: string,
	clientId: string,
	makeRequest: RequestFunction
) {
	return makeRequest<IOperationResponse>(
		`/api/client/${clientId}/resetPassword?emailAddress=${emailAddress}&redirectUri=${redirectUri}`,
		undefined,
		'POST'
	)
}
