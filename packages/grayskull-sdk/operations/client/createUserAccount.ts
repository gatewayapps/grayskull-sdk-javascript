import { RequestFunction, IAuthorizedUserFields, IAuthorizedUser } from '../../foundation/types'

export async function createUserAccount(
	userData: IAuthorizedUserFields,
	password: string,
	clientId: string,
	accessToken: string,
	makeRequest: RequestFunction
): Promise<IAuthorizedUser> {
	return await makeRequest(`/api/client/${clientId}/createUserAccount`, { password, ...userData }, 'POST', accessToken)
}
