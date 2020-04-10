import { RequestFunction, IOperationResponse } from '../../foundation/types'

export async function setUserMetadata(
	userId: string,
	key: string,
	value: string,
	clientId: string,
	accessToken: string,
	makeRequest: RequestFunction
) {
	return makeRequest<IOperationResponse>(`/api/meta/${clientId}/${userId}`, { key, value }, 'POST', accessToken)
}
