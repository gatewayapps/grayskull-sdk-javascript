import { RequestFunction, IOperationResponse } from '../../foundation/types'

export async function changePasswordWithOldPassword(
	sub: string,
	oldPassword: string,
	newPassword: string,
	accessToken: string,
	makeRequest: RequestFunction
) {
	return makeRequest<IOperationResponse>(
		`/api/user/${sub}/changePassword`,
		{ oldPassword, newPassword },
		'POST',
		accessToken
	)
}
