import { RequestFunction, IOperationResponse } from '../../foundation/types'

export async function changePasswordWithToken(
	emailAddress: string,
	token: string,
	newPassword: string,
	makeRequest: RequestFunction
) {
	return await makeRequest<IOperationResponse>(
		`/api/users/changePasswordWithToken?emailAddress=${emailAddress}&token=${token}&newPassword=${newPassword}`,
		undefined,
		'POST'
	)
}
