import { IAuthorizedUserFields, RequestFunction, IAuthorizedUser } from '../../foundation/types'

export async function updateUserProfile(
	userData: Partial<IAuthorizedUserFields>,
	accessToken: string,
	makeRequest: RequestFunction
) {
	return await makeRequest<IAuthorizedUser>(`/api/users/profile`, userData, 'POST', accessToken)
}
