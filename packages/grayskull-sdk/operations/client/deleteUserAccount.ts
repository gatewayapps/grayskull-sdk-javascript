import { RequestFunction, IOperationResponse } from '../../foundation/types'

export async function deleteUserAccount(
	userClientId: string,
	accessToken: string,
	makeRequest: RequestFunction
): Promise<IOperationResponse> {
	return await makeRequest(`/api/user/${userClientId}/delete`, {}, 'POST', accessToken)
}
