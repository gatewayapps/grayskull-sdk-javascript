import {
	ITokenStorage,
	IGrayskullClient,
	IAccessTokenResponse,
	IIDToken,
	IAccessToken,
	IAuthorizedUserFields
} from '../../foundation/types'
import { addSeconds, differenceInMilliseconds } from 'date-fns'
import { authenticateWithCredentials } from '../authentication/authenticateWithCredentials'

import { refreshTokens } from '../authentication/refreshTokens'
import { createCookieTokenStorage } from '../tokenStorage/createCookieTokenStorage'
import { createRequestFunction } from './createRequestFunction'
import { authenticateWithMultifactorToken } from '../authentication/authenticateWithMultifactorToken'
import { decodeToken } from '../tokens/decodeToken'
import { authenticateWithClientCredentials } from '../authentication/authenticateWithClientCredentials'
import { listAuthorizedUsers } from '../client/listAuthorizedUsers'
import { createUserAccount } from '../client/createUserAccount'
import { updateUserProfile } from '../user/updateUserProfile'
import { resetPassword } from '../authentication/resetPassword'
import { changePasswordWithToken } from '../authentication/changePasswordWithToken'

export function createGrayskullClient(
	clientId: string,
	clientSecret: string | undefined,
	serverUrl: string,
	tokenStorage?: ITokenStorage
): IGrayskullClient {
	if (!tokenStorage) {
		tokenStorage = createCookieTokenStorage()
	}

	const makeRequest = createRequestFunction(clientId, clientSecret, serverUrl)

	const handleTokenResponse = async (result: IAccessTokenResponse) => {
		let minimumRefreshTime = 0

		if (result.challenge) {
			if (result.challenge.challenge_token) {
				tokenStorage!.setToken('challenge', result.challenge.challenge_token, undefined)
			}
		}
		if (result.access_token) {
			const decoded = (await decodeToken(result.access_token, clientSecret)) as IAccessToken
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
			const decoded = (await decodeToken(result.id_token, clientSecret)) as IIDToken
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
		authenticateWithClientCredentials: async () => {
			if (!clientSecret) {
				throw new Error(`To use the client_credentials grant type, you must provide the client_secret`)
			}
			const result = await authenticateWithClientCredentials(clientId, clientSecret, makeRequest)
			await handleTokenResponse(result)
			return result
		},
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
		createUserAccount: async (userData: IAuthorizedUserFields, password: string) => {
			const accessToken = tokenStorage?.getToken('access')
			if (!accessToken) {
				throw new Error('You must have an access token to do that')
			}
			return await createUserAccount(userData, password, clientId, accessToken, makeRequest)
		},
		listAuthorizedUsers: async (limit = 100, offset = 0) => {
			const accessToken = tokenStorage?.getToken('access')
			if (!accessToken) {
				throw new Error('You must have an access token to do that')
			}
			const result: any = await listAuthorizedUsers(limit, offset, clientId, accessToken, makeRequest)

			return result
		},
		resetPassword: async (emailAddress: string, redirectUri: string) => {
			return await resetPassword(emailAddress, redirectUri, clientId, makeRequest)
		},
		changePasswordWithToken: async (emailAddress: string, token: string, newPassword: string) => {
			return await changePasswordWithToken(emailAddress, token, newPassword, makeRequest)
		},
		updateUserProfile: async (userData: Partial<IAuthorizedUserFields>) => {
			const accessToken = tokenStorage?.getToken('access')
			if (!accessToken) {
				throw new Error('You must have an access token to do that')
			}
			return await updateUserProfile(userData, accessToken, makeRequest)
		},
		getTokenStorage: () => tokenStorage!
	}
}
