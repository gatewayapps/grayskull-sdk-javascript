import cookies from 'browser-cookies'
import { ITokenStorage } from '../../foundation/types'

export const createCookieTokenStorage: () => ITokenStorage = () => {
    return {
        getToken: (tokenType) => {
            return cookies.get(`grayskull_${tokenType}_token`)
        },
        setToken: (tokenType, value, expires: Date | undefined) => {
            cookies.set(`grayskull_${tokenType}_token`, value, { expires })
        }
    }
}