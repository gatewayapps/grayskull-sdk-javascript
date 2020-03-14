import fetch from 'isomorphic-fetch'
import { ITokenStorage, IGrayskullClient, IAccessTokenResponse, HttpMethod } from '../../foundation/types'
import { addSeconds, differenceInMilliseconds } from 'date-fns'
import { authenticateWithCredentials } from '../authentication/authenticateWithCredentials'
import jwt from 'jsonwebtoken'
import { refreshTokens } from '../authentication/refreshTokens'
import { createCookieTokenStorage } from '../tokenStorage/createCookieTokenStorage'


export function createGrayskullClient(clientId: string, clientSecret: string, serverUrl: string, tokenStorage?: ITokenStorage): IGrayskullClient {

    if (!tokenStorage) {
        tokenStorage = createCookieTokenStorage()
    }

    const makeRequest = async <T>(endpoint: string, body: { [key: string]: any }, method: HttpMethod = 'POST') => {
        const finalUrl = new URL(endpoint, serverUrl)
        const headers = {}
        if (body) {
            body.client_id = clientId
            body.client_secret = clientSecret
            headers['content-type'] = 'application/json'

        }

        const response = await fetch(finalUrl.href, { body: body ? JSON.stringify(body) : undefined, method, headers })
        const result = await response.json() as T
        return result
    }

    const handleTokenResponse = async (result: IAccessTokenResponse) => {
        if (result.access_token) {
            const decoded = await jwt.verify(result.access_token, clientSecret)
            if (decoded) {
                tokenStorage!.setToken('access', result.access_token, decoded.exp)

                // Refresh the access token 2 minutes before it expires
                if (result.refresh_token) {
                    const dateToRefresh = addSeconds(new Date(decoded.exp), -120)
                    const refreshInMilliseconds = differenceInMilliseconds(dateToRefresh, new Date())
                    setTimeout(async () => {
                        const refreshResult = await refreshTokens(result.refresh_token!, makeRequest)
                        handleTokenResponse(refreshResult)
                    }, refreshInMilliseconds)
                }

            }
        }
        if (result.id_token) {
            const decoded = await jwt.verify(result.id_token, clientSecret)
            if (decoded) {
                tokenStorage!.setToken('id', result.id_token, decoded.exp)
                // Refresh the access token 2 minutes before it expires
                if (result.refresh_token) {
                    const dateToRefresh = addSeconds(new Date(decoded.exp), -120)
                    const refreshInMilliseconds = differenceInMilliseconds(dateToRefresh, new Date())
                    setTimeout(async () => {
                        const refreshResult = await refreshTokens(result.refresh_token!, makeRequest)
                        handleTokenResponse(refreshResult)
                    }, refreshInMilliseconds)
                }
            }
        }
        if (result.refresh_token) {
            tokenStorage!.setToken('refresh', result.refresh_token, undefined)
        }
    }

    return {
        authenticateWithCredentials: async (emailAddress: string, password: string, scopes: string[]) => {
            const result = await authenticateWithCredentials(emailAddress, password, scopes, makeRequest)
            await handleTokenResponse(result)
            return result
        },
        getTokenStorage: () => (tokenStorage!)
    }


}