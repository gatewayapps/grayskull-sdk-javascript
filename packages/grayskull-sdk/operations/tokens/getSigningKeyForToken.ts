import { getKIDFromToken } from './getKIDFromToken'

export async function getSigningKeyForToken(token: string, jwksClient: any): Promise<string> {
	return new Promise<string>(async (resolve, reject) => {
		try {
			const kid = await getKIDFromToken(token)
			jwksClient.getSigningKey(kid, (err, key: any) => {
				if (err) {
					reject(err)
				} else {
					resolve(key.rsaPublicKey)
				}
			})
		} catch (err) {
			reject(err)
		}
	})
}
