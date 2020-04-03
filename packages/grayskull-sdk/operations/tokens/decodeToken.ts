import jwt, { TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken'
import { IAccessToken } from '../../foundation/types'

export async function decodeToken(token: string, clientSecret?: string) {
	if (clientSecret === undefined) {
		const decoded = jwt.decode(token) as IAccessToken
		if (!decoded.exp) {
			throw new JsonWebTokenError(`Invalid access token: ${decoded}`)
		}
		if (decoded.exp * 1000 < new Date().getTime()) {
			throw new TokenExpiredError('Token is expired', new Date(decoded.exp))
		}
		return decoded
	} else {
		return jwt.verify(token, clientSecret)
	}
}
