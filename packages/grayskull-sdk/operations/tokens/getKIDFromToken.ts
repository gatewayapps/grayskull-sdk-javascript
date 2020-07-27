import jwt from 'jsonwebtoken'

export async function getKIDFromToken(token: string) {
	const decoded = (await jwt.decode(token, { complete: true })) as any
	return decoded.header['kid']
}
