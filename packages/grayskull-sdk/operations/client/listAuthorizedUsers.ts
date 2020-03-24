import { RequestFunction } from '../../foundation/types'

export async function listAuthorizedUsers(
	limit: number,
	offset: number,
	clientId: string,
	accessToken: string,
	makeRequest: RequestFunction
): Promise<any[]> {
	return makeRequest<any[]>(
		`/api/client/${clientId}/listAuthorizedUsers?limit=${limit}&offset=${offset}`,
		{},
		'GET',
		accessToken
	)
}
