export interface IAccessToken {
	id?: string
	sub: string
	scopes: string[]
	exp: number
}

export interface ISubject {
	sub: string
}

export interface IIDToken extends ISubject {
	iss: string
	at_hash: string | undefined
	aud: string
	exp: number
	iat: number
	nonce?: string
}

export interface IProfileClaim {
	name?: string
	given_name?: string
	family_name?: string
	nickname?: string | null
	profile?: string
	picture?: string | null
	updated_at?: number
}

export interface IEmailClaim {
	email?: string
	email_verified?: boolean
}

export interface IChallenge {
	challenge_type: string
	challenge_token: string
}

export interface IChallengeToken {
	emailAddress: string
	userClientId: string
	scopes: string[]
	iat: number //Issued At
}

export interface IAccessTokenResponse {
	challenge?: IChallenge
	token_type?: string
	id_token?: string
	expires_in?: number
	access_token?: string
	refresh_token?: string
	session_id?: string
}
export type HttpMethod = 'POST' | 'GET' | 'PUT' | 'DELETE'

export interface IGrayskullClient {
	authenticateWithCredentials: (emailAddress: string, password: string, scopes: string[]) => Promise<IAccessTokenResponse>

	getTokenStorage: () => ITokenStorage
}

export interface ITokenStorage {
	setToken: (tokenType: 'refresh' | 'access' | 'id', value: string, expires: Date | undefined) => void
	getToken: (tokenType: 'refresh' | 'access' | 'id') => string | null
}

export type RequestFunction = <T>(endpoint: string, body: { [key: string]: any }, method: HttpMethod) => Promise<T>
