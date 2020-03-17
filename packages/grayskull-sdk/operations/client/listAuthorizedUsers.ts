import { RequestFunction } from '../../foundation/types'

export async function listAuthorizedUsers(
	clientId: string,
	accessToken: string,
	makeRequest: RequestFunction
): Promise<any[]> {
	return makeRequest<any[]>(`/api/client/${clientId}/listAuthorizedUsers`, {}, 'GET', accessToken)
}
