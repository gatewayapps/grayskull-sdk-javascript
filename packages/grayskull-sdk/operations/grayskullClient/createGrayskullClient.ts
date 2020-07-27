import { verify, decode } from 'jsonwebtoken'
import {
	ITokenStorage,
	IGrayskullClient,
	IAccessTokenResponse,
	IIDToken,
	IAccessToken,
	IAuthorizedUserFields,
	IAuthorizedUser
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

import { getCurrentUser } from '../authentication/getCurrentUser'
import { changePasswordWithOldPassword } from '../user/changePasswordWithOldPassword'

import debugFunc from 'debug'
import { createMemoryTokenStorage } from '../tokenStorage/createMemoryTokenStorage'
import { deleteUserMetadata } from '../metadata/deleteUserMetadata'
import { getUserMetadata } from '../metadata/getUserMetadata'
import { setUserMetadata } from '../metadata/setUserMetadata'
import { deleteUserAccount } from '../client/deleteUserAccount'

import { getSigningKeyForToken } from '../tokens/getSigningKeyForToken'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const JwksClient = require('jwks-rsa')

const debug = debugFunc('GRAYSKULL_SDK')

export function createGrayskullClient(
	clientId: string,
	clientSecret: string | undefined,
	serverUrl: string,
	tokenStorage?: ITokenStorage,
	tokenSignatureType?: 'HMAC256' | 'RSA256'
): IGrayskullClient {
	debug(`Creating client for ${clientId}, grayskull server at ${serverUrl}`)
	if (!tokenStorage) {
		if (typeof window === 'undefined') {
			tokenStorage = createMemoryTokenStorage()
		} else {
			tokenStorage = createCookieTokenStorage()
		}
	}

	let jwksClient: any
	if (tokenSignatureType === 'RSA256') {
		jwksClient = JwksClient({
			jwksUri: new URL(`/.well-known/jwks.json`, serverUrl).toString()
		})
	}

	const makeRequest = createRequestFunction(clientId, clientSecret, serverUrl)
	let refreshTimer: NodeJS.Timeout | undefined = undefined

	const handleTokenResponse = async (result: IAccessTokenResponse) => {
		debug(`Received token response: ${JSON.stringify(result, null, 2)}`)
		let minimumRefreshTime = 0

		if (result.challenge) {
			if (result.challenge.challenge_token) {
				await tokenStorage!.setToken('challenge', result.challenge.challenge_token, undefined)
			}
		}

		if (result.access_token) {
			let secret = clientSecret
			if (jwksClient) {
				secret = await getSigningKeyForToken(result.access_token, jwksClient)
			}

			const decoded = (await decodeToken(result.access_token, secret)) as IAccessToken
			if (decoded) {
				await tokenStorage!.setToken('access', result.access_token, new Date(decoded.exp * 1000))

				// Refresh the access token 2 minutes before it expires
				if (result.refresh_token) {
					const dateToRefresh = addSeconds(new Date(decoded.exp * 1000), -120)
					minimumRefreshTime = differenceInMilliseconds(dateToRefresh, new Date())
				}
			}
		}
		if (result.id_token) {
			let secret = clientSecret
			if (jwksClient) {
				secret = await getSigningKeyForToken(result.id_token, jwksClient)
			}

			const decoded = (await decodeToken(result.id_token, secret)) as IIDToken
			if (decoded) {
				await tokenStorage!.setToken('id', result.id_token, new Date(decoded.exp * 1000))
				// Refresh the access token 2 minutes before it expires
				if (result.refresh_token) {
					const dateToRefresh = addSeconds(new Date(decoded.exp * 1000), -120)
					const refreshInMilliseconds = differenceInMilliseconds(dateToRefresh, new Date())
					if (refreshInMilliseconds < minimumRefreshTime) {
						minimumRefreshTime = refreshInMilliseconds
					}
				}
			}
		}
		if (result.refresh_token && minimumRefreshTime) {
			await tokenStorage!.setToken('refresh', result.refresh_token, undefined)

			if (refreshTimer) {
				clearTimeout(refreshTimer)
			}

			const minutes = minimumRefreshTime / 60 / 1000
			debug(`Refreshing tokens in ${minutes} minutes`)

			refreshTimer = setTimeout(async () => {
				try {
					debug(`Refreshing tokens now`)
					const refreshResult = await refreshTokens(result.refresh_token!, makeRequest)
					handleTokenResponse(refreshResult)
				} catch (err) {
					debug(`Failed to refresh tokens`)
					debug(err)
				}
			}, minimumRefreshTime)
		}
	}

	tokenStorage
		.getToken('refresh')
		.then(async (currentRefreshToken) => {
			if (currentRefreshToken) {
				const tokenResponse = await refreshTokens(currentRefreshToken, makeRequest)
				handleTokenResponse(tokenResponse)
			}
		})
		.catch((err) => {
			debug(err)
		})

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
		getIDToken: async () => {
			const token = await tokenStorage!.getToken('id')
			let idToken: string | null = token
			if (token) {
				const decoded = decode(token) as IIDToken
				const now = new Date().getTime() / 1000
				if (decoded.exp < now) {
					const refreshToken = await tokenStorage!.getToken('refresh')
					if (refreshToken) {
						const result = await refreshTokens(refreshToken, makeRequest)
						handleTokenResponse(result)
						idToken = result.id_token || null
					}
				}
			}

			return idToken
		},
		logout: async () => {
			try {
				debug('Logging out')
				await tokenStorage!.deleteToken('access')
				await tokenStorage!.deleteToken('challenge')
				await tokenStorage!.deleteToken('refresh')
				await tokenStorage!.deleteToken('id')
				return { success: true }
			} catch (err) {
				debug(err)
				return { success: false, message: err.message }
			}
		},
		authenticateWithMultifactorToken: async (multifactorToken: string) => {
			const challengeToken = await tokenStorage!.getToken('challenge')
			if (!challengeToken) {
				throw new Error('Attempted to authenticate with multifactor token with no challenge token')
			}

			const result = await authenticateWithMultifactorToken(multifactorToken, challengeToken, makeRequest)
			await handleTokenResponse(result)
			return result
		},
		refreshTokens: async () => {
			debug('Refreshing tokens')
			const refreshToken = await tokenStorage?.getToken('refresh')
			if (!refreshToken) {
				throw new Error('No refresh token!')
			}
			const tokenResponse = await refreshTokens(refreshToken!, makeRequest)
			return tokenResponse
		},
		deleteUserMetadata: async (userId: string, key: string) => {
			const accessToken = await tokenStorage?.getToken('access')
			if (!accessToken) {
				throw new Error('You must have an access token to do that')
			}
			return await deleteUserMetadata(userId, key, clientId, accessToken, makeRequest)
		},
		getUserMetadata: async (userId: string) => {
			const accessToken = await tokenStorage?.getToken('access')
			if (!accessToken) {
				throw new Error('You must have an access token to do that')
			}
			return await getUserMetadata(userId, clientId, accessToken, makeRequest)
		},
		setUserMetadata: async (userId: string, key: string, value: string) => {
			const accessToken = await tokenStorage?.getToken('access')
			if (!accessToken) {
				throw new Error('You must have an access token to do that')
			}
			return await setUserMetadata(userId, key, value, clientId, accessToken, makeRequest)
		},
		createUserAccount: async (userData: IAuthorizedUserFields, password: string) => {
			const accessToken = await tokenStorage?.getToken('access')
			if (!accessToken) {
				throw new Error('You must have an access token to do that')
			}
			return await createUserAccount(userData, password, clientId, accessToken, makeRequest)
		},
		deleteUserAccount: async (userId) => {
			const accessToken = await tokenStorage?.getToken('access')
			if (!accessToken) {
				throw new Error('You must have an access token to do that')
			}
			return await deleteUserAccount(userId, accessToken, makeRequest)
		},
		listAuthorizedUsers: async (limit = 100, offset = 0) => {
			const accessToken = await tokenStorage?.getToken('access')
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
		changePasswordWithOldPassword: async (oldPassword: string, newPassword: string) => {
			const currentUser = await getCurrentUser(clientSecret, tokenStorage!, makeRequest, handleTokenResponse)
			if (currentUser === null) {
				return { success: false, message: 'You must be signed in to do that' }
			} else {
				const accessToken = await tokenStorage?.getToken('access')
				if (!accessToken) {
					return { success: false, message: 'You must have an access token to do that' }
				}

				return await changePasswordWithOldPassword(currentUser.sub, oldPassword, newPassword, accessToken, makeRequest)
			}
		},
		getCurrentUser: async () => {
			const tryReturnUser = async () => {
				try {
					const idToken = await tokenStorage?.getToken('id')

					if (idToken) {
						if (clientSecret) {
							return verify(idToken, clientSecret) as IAuthorizedUser & IIDToken
						} else {
							return decode(idToken) as IAuthorizedUser & IIDToken
						}
					}
				} catch {}
				return null
			}

			const currentUser = await tryReturnUser()
			if (currentUser) {
				return currentUser
			}

			const refreshToken = await tokenStorage?.getToken('refresh')

			if (refreshToken) {
				const result = await refreshTokens(refreshToken, makeRequest)
				await handleTokenResponse(result)
				return tryReturnUser()
			} else {
				return null
			}
		},
		updateUserProfile: async (sub: string, userData: Partial<IAuthorizedUserFields>) => {
			const accessToken = await tokenStorage?.getToken('access')
			if (!accessToken) {
				throw new Error('You must have an access token to do that')
			}
			return await updateUserProfile(sub, userData, accessToken, makeRequest)
		},
		getTokenStorage: () => tokenStorage!
	}
}
