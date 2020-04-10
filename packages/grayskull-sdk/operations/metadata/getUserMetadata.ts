import { RequestFunction } from '../../foundation/types'

export async function getUserMetadata(
	userId: string,
	clientId: string,
	accessToken: string,
	makeRequest: RequestFunction
) {
	return makeRequest<any[]>(`/api/meta/${clientId}/${userId}`, undefined, 'GET', accessToken)
}
