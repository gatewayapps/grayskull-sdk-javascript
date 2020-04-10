import { RequestFunction, IAuthorizedUser } from '../../foundation/types'

export async function listAuthorizedUsers(
	limit: number,
	offset: number,
	clientId: string,
	accessToken: string,
	makeRequest: RequestFunction
): Promise<IAuthorizedUser[]> {
	return makeRequest<IAuthorizedUser[]>(
		`/api/client/${clientId}/listAuthorizedUsers?limit=${limit}&offset=${offset}`,
		{},
		'GET',
		accessToken
	)
}
