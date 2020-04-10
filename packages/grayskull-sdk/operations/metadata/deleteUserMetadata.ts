import { RequestFunction, IOperationResponse } from '../../foundation/types'

export async function deleteUserMetadata(
	userId: string,
	key: string,
	clientId: string,
	accessToken: string,
	makeRequest: RequestFunction
) {
	return makeRequest<IOperationResponse>(`/api/meta/${clientId}/${userId}`, { key }, 'DELETE', accessToken)
}
