'use client'

import api from '@/src/shared/api'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
	AuthContextValue,
	LoginPayload,
	RegisterPayload,
	UpdateProfilePayload,
	User
} from './types'

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null)
	const [isReady, setIsReady] = useState(false)

	useEffect(() => {
		const restore = async () => {
			try {
				const res = await api.get<{ user: User }>('/api/auth/me')
				setUser(res.data.user)
			} catch {
				setUser(null)
			} finally {
				setIsReady(true)
			}
		}

		restore()
	}, [])

	const register = async (payload: RegisterPayload) => {
		const res = await api.post<{ user: User }>('/api/auth/register', payload)
		setUser(res.data.user)
	}

	const login = async (payload: LoginPayload) => {
		const res = await api.post<{ user: User }>('/api/auth/login', payload)
		setUser(res.data.user)
	}

	const logout = async () =>
		await api.post('/api/auth/logout').finally(() => setUser(null))

	const updateProfile = async (payload: UpdateProfilePayload) => {
		if (!user) throw new Error('Not authenticated.')

		const res = await api.put<{ user: User }>(`/api/users/${user.id}`, {
			data: payload
		})

		setUser(res.data.user)
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
