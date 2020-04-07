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

export interface IOperationResponse {
	success: boolean
	message?: string
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
	authenticateWithCredentials: (
		emailAddress: string,
		password: string,
		scopes: string[]
	) => Promise<IAccessTokenResponse>
	authenticateWithMultifactorToken: (multifactorToken: string) => Promise<IAccessTokenResponse>
	authenticateWithClientCredentials: () => Promise<IAccessTokenResponse>
	refreshTokens: () => Promise<IAccessTokenResponse>
	logout: () => Promise<IOperationResponse>
	listAuthorizedUsers: (limit?: number, offset?: number) => Promise<any[]>
	createUserAccount: (userData: IAuthorizedUserFields, password: string) => Promise<IAuthorizedUser>
	updateUserProfile: (userId: string, userData: Partial<IAuthorizedUserFields>) => Promise<IAuthorizedUser>
	changePasswordWithOldPassword: (oldPassword: string, newPassword: string) => Promise<IOperationResponse>
	resetPassword: (emailAddress: string, redirectUri: string) => Promise<IOperationResponse>
	changePasswordWithToken: (emailAddress: string, token: string, newPassword: string) => Promise<IOperationResponse>
	getCurrentUser: () => Promise<IAuthorizedUser | null>
	getTokenStorage: () => ITokenStorage
}

export type TokenTypes = 'refresh' | 'access' | 'id' | 'challenge'

export interface ITokenStorage {
	setToken: (tokenType: TokenTypes, value: string, expires: Date | undefined) => Promise<void>
	getToken: (tokenType: TokenTypes) => Promise<string | null>
	deleteToken: (tokenType: TokenTypes) => Promise<void>
}

export type RequestFunction = <T>(
	endpoint: string,
	body: { [key: string]: any } | undefined,
	method: HttpMethod,
	accessToken?: string
) => Promise<T>

export interface IAuthorizedUser {
	sub: string
	given_name: string
	family_name: string
	birthday?: Date
	gender?: string
	active_at: Date
	updated_at: Date
	email: string
	email_verified: boolean
	nickname?: string
	picture?: string
}

export type IAuthorizedUserFields = Pick<
	IAuthorizedUser,
	'given_name' | 'family_name' | 'gender' | 'nickname' | 'picture' | 'email' | 'birthday'
>
