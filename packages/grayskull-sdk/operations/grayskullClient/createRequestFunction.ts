import fetch from 'isomorphic-fetch'
import { HttpMethod } from '../../foundation/types'

export function createRequestFunction(clientId, clientSecret, serverUrl) {
	return async <T>(endpoint: string, body: { [key: string]: any }, method: HttpMethod = 'POST') => {
		const finalUrl = new URL(endpoint, serverUrl)
		const headers = {}
		if (body) {
			body.client_id = clientId
			body.client_secret = clientSecret
			headers['content-type'] = 'application/json'
		}

		const response = await fetch(finalUrl.href, { body: body ? JSON.stringify(body) : undefined, method, headers })
		const result = (await response.json()) as T
		return result
	}
}
