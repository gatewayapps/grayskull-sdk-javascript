import { RequestFunction, IOperationResponse } from '../../foundation/types'

export async function deleteUserAccount(
	clientId: string,
	accessToken: string,
	makeRequest: RequestFunction
): Promise<IOperationResponse> {
	return await makeRequest(`/api/client/${clientId}/delete`, {}, 'POST', accessToken)
}
