import { ITokenStorage } from '../../foundation/types'

export const createMemoryTokenStorage: () => ITokenStorage = () => {
	const tokens: any = {}
	const tokenStorage: ITokenStorage = {
		getToken: async (tokenType) => tokens[tokenType],
		setToken: async (tokenType, value) => {
			tokens[tokenType] = value
		},
		deleteToken: async (tokenType) => {
			delete tokens[tokenType]
		}
	}
	return tokenStorage
}
