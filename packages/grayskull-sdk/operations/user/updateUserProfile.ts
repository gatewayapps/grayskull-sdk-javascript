import { IAuthorizedUserFields, RequestFunction, IAuthorizedUser } from '../../foundation/types'

/**
 *
 * @param sub - Client specific user identifier
 * @param userData - Partial of IAuthorizedUserFields
 * @param accessToken
 * @param makeRequest
 */
export async function updateUserProfile(
	sub: string,
	userData: Partial<IAuthorizedUserFields>,
	accessToken: string,
	makeRequest: RequestFunction
) {
	return await makeRequest<IAuthorizedUser>(`/api/user/${sub}/profile`, userData, 'POST', accessToken)
}
