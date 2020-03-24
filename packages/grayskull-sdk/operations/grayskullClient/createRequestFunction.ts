import fetch from 'isomorphic-fetch'
import { HttpMethod } from '../../foundation/types'

export function createRequestFunction(clientId: string, clientSecret: string | undefined, serverUrl: string) {
	return async <T>(
		endpoint: string,
		body: { [key: string]: any } = {},
		method: HttpMethod = 'POST',
		accessToken?: string
	) => {
		const finalUrl = new URL(endpoint, serverUrl)
		const headers = {}

		if (accessToken) {
			headers['authorization'] = `Bearer ${accessToken}`
		} else {
			body.client_id = clientId
			body.client_secret = clientSecret
		}
		headers['content-type'] = 'application/json'
		headers['accept'] = 'application/json'
		try {
			const finalBody = method === 'GET' ? undefined : JSON.stringify(body)
			const response = await fetch(finalUrl.href, { body: finalBody, method, headers })
			const result = (await response.json()) as T
			return result
		} catch (err) {
			console.error(err)
			throw err
		}
	}
}
