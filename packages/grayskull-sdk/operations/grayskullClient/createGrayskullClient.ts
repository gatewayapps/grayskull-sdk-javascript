import { ITokenStorage, IGrayskullClient, IAccessTokenResponse, IIDToken, IAccessToken } from '../../foundation/types'
import { addSeconds, differenceInMilliseconds } from 'date-fns'
import { authenticateWithCredentials } from '../authentication/authenticateWithCredentials'
import jwt from 'jsonwebtoken'
import { refreshTokens } from '../authentication/refreshTokens'
import { createCookieTokenStorage } from '../tokenStorage/createCookieTokenStorage'
import { createRequestFunction } from './createRequestFunction'
import { authenticateWithMultifactorToken } from '../authentication/authenticateWithMultifactorToken'

export function createGrayskullClient(
	clientId: string,
	clientSecret: string,
	serverUrl: string,
	tokenStorage?: ITokenStorage
): IGrayskullClient {
	if (!tokenStorage) {
		tokenStorage = createCookieTokenStorage()
	}

	const makeRequest = createRequestFunction(clientId, clientSecret, serverUrl)

	const handleTokenResponse = async (result: IAccessTokenResponse) => {
		console.log('Got tokens', result)
		let minimumRefreshTime = 0

		if (result.challenge) {
			if (result.challenge.challenge_token) {
				tokenStorage!.setToken('challenge', result.challenge.challenge_token, undefined)
			}
		}
		if (result.access_token) {
			const decoded = (await jwt.verify(result.access_token, clientSecret)) as IAccessToken
			if (decoded) {
				tokenStorage!.setToken('access', result.access_token, new Date(decoded.exp))

				// Refresh the access token 2 minutes before it expires
				if (result.refresh_token) {
					const dateToRefresh = addSeconds(new Date(decoded.exp), -120)
					minimumRefreshTime = differenceInMilliseconds(dateToRefresh, new Date())
				}
			}
		}
		if (result.id_token) {
			const decoded = (await jwt.verify(result.id_token, clientSecret)) as IIDToken
			if (decoded) {
				tokenStorage!.setToken('id', result.id_token, new Date(decoded.exp))
				// Refresh the access token 2 minutes before it expires
				if (result.refresh_token) {
					const dateToRefresh = addSeconds(new Date(decoded.exp), -120)
					const refreshInMilliseconds = differenceInMilliseconds(dateToRefresh, new Date())
					if (refreshInMilliseconds < minimumRefreshTime) {
						minimumRefreshTime = refreshInMilliseconds
					}
				}
			}
		}
		if (result.refresh_token && minimumRefreshTime) {
			tokenStorage!.setToken('refresh', result.refresh_token, undefined)

			setTimeout(async () => {
				const refreshResult = await refreshTokens(result.refresh_token!, makeRequest)
				handleTokenResponse(refreshResult)
			}, minimumRefreshTime)
		}
	}

	return {
		authenticateWithCredentials: async (emailAddress: string, password: string, scopes: string[]) => {
			const result = await authenticateWithCredentials(emailAddress, password, scopes, makeRequest)
			await handleTokenResponse(result)
			return result
		},
		authenticateWithMultifactorToken: async (multifactorToken: string) => {
			const challengeToken = tokenStorage!.getToken('challenge')
			if (!challengeToken) {
				throw new Error('Attempted to authenticate with multifactor token with no challenge token')
			}

			const result = await authenticateWithMultifactorToken(multifactorToken, challengeToken, makeRequest)
			await handleTokenResponse(result)
			return result
		},
		getTokenStorage: () => tokenStorage!
	}
}
