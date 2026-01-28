'use client'

import axios, { AxiosError, AxiosRequestConfig } from 'axios'
import { useRouter } from 'next/router'
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState
} from 'react'
import {
	AuthContextValue,
	LoginPayload,
	RegisterPayload,
	UpdateProfilePayload,
	User
} from './types'

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const api = axios.create({
	headers: {
		'Content-Type': 'application/json'
	},
	withCredentials: true
})

const router = useRouter()

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null)
	const [isReady, setIsReady] = useState(false)

	const refreshSession = useCallback(async () => {
		try {
			const res = await api.post('/api/auth/refresh')

			if (res.status === 401) {
				router.push('/login')
				return false
			}

			const data = res.data as { user?: User }
			if (data.user) {
				setUser(data.user)
			}

			return true
		} catch (err) {
			console.error(err)
			setUser(null)
			setIsReady(false)
			router.push('/login')
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

	useEffect(() => {
		const restore = async () => {
			try {
				const res = await requestJson<{ user: User }>('/api/auth/me', {})

				setUser(res.user)
			} catch {
				setUser(null)
			} finally {
				setIsReady(true)
			}
		}

		restore()
	}, [])

	const register = async (payload: RegisterPayload) => {
		const data = await requestJson<{ user: User }>(
			'/api/auth/register',
			{
				method: 'POST',
				data: payload
			},
			false
		)
		setUser(data.user)
	}

	const login = async (payload: LoginPayload) => {
		const data = await requestJson<{ user: User }>(
			'/api/auth/login',
			{
				method: 'POST',
				data: payload
			},
			false
		)
		setUser(data.user)
	}

	const logout = async () =>
		await api.post('/api/auth/logout').finally(() => setUser(null))

	const updateProfile = async (payload: UpdateProfilePayload) => {
		if (!user) throw new Error('Not authenticated.')

		const data = await requestJson<{ user: User }>(`/api/users/${user.id}`, {
			method: 'PUT',
			data: payload
		})

		setUser(data.user)
	}

	const value = useMemo(
		() => ({
			user,
			isReady,
			register,
			login,
			logout,
			updateProfile
		}),
		[user, isReady]
	)

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
	const context = useContext(AuthContext)
	if (!context) {
		throw new Error('useAuth must be used within AuthProvider')
	}
	return context
}
