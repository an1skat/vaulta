import axios, { AxiosError, AxiosRequestConfig } from 'axios'
import { createContext, useCallback, useState } from 'react'
import { AuthContextValue, User } from './types'

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const api = axios.create({
	headers: {
		'Content-Type': 'application/json'
	},
	withCredentials: true
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null)

	const refreshSession = useCallback(async () => {
		try {
			const res = await api.post('/api/auth/refresh')

			const data = res.data as { user?: User }
			if (data.user) {
				setUser(data.user)
			}

			return true
		} catch (err) {
			console.error(err)
			return false
		}
	}, [])

	const requestJson = async <T,>(
		url: string,
		options: AxiosRequestConfig,
		allowRefresh = true
	) => {
		try {
			const res = await api.request<T>({
				url,
				...options
			})

			return res.data
		} catch (err) {
			if ((err as AxiosError).response?.status == 401 && allowRefresh) {
				const refreshed = await refreshSession()
				if (refreshed) {
					return requestJson<T>(url, options, false)
				}
			}
			throw err
		}
	}
}
