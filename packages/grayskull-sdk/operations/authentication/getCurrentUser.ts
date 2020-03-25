import { ITokenStorage, RequestFunction, IAuthorizedUser, IAccessTokenResponse, IIDToken } from '../../foundation/types'
import { verify, JsonWebTokenError, TokenExpiredError, decode } from 'jsonwebtoken'
import { refreshTokens } from './refreshTokens'

export async function getCurrentUser(
	clientSecret: string | undefined,
	tokenStorage: ITokenStorage,
	makeRequest: RequestFunction,
	handleTokenResponse: (result: IAccessTokenResponse) => Promise<void>
): Promise<(IAuthorizedUser & IIDToken) | null> {
	try {
		const idToken = await tokenStorage?.getToken('id')
		if (idToken) {
			if (clientSecret) {
				return verify(idToken, clientSecret) as IAuthorizedUser & IIDToken
			} else {
				const result = decode(idToken, { complete: true }) as IAuthorizedUser & IIDToken
				if (result.exp < new Date().getTime()) {
					throw new TokenExpiredError('Token expired', new Date(result.exp))
				} else {
					return result
				}
			}
		} else {
			const refreshToken = await tokenStorage?.getToken('refresh')
			if (!refreshToken) {
				return null
			}

			const result = await refreshTokens(refreshToken, makeRequest)
			await handleTokenResponse(result)
			return getCurrentUser(clientSecret, tokenStorage, makeRequest, handleTokenResponse)
		}
	} catch (err) {
		console.error(err)
		if (err instanceof JsonWebTokenError) {
			if (err.name === TokenExpiredError.name) {
				const refreshToken = await tokenStorage?.getToken('refresh')
				if (!refreshToken) {
					return null
				}

				const result = await refreshTokens(refreshToken, makeRequest)
				await handleTokenResponse(result)
				return getCurrentUser(clientSecret, tokenStorage, makeRequest, handleTokenResponse)
			}
		}
	}

	return null
}
