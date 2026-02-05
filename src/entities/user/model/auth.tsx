'use client'

import api from '@/src/shared/api'
import { getSession } from '@/src/shared/lib/getSession'
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
		const fd = new FormData()
		fd.append('name', payload.name)
		fd.append('username', payload.username)
		fd.append('email', payload.email)
		fd.append('password', payload.password)

		if (payload.avatar) {
			fd.append('avatar', payload.avatar)
		}

		const res = await api.post<{ user: User }>('/api/auth/register', fd)
		setUser(res.data.user)
	}

	const login = async (payload: LoginPayload) => {
		const res = await api.post<{ user: User }>('/api/auth/login', payload)
		setUser(res.data.user)
	}

	const logout = async () =>
		await api.post('/api/auth/logout').finally(() => setUser(null))

	const updateProfile = async (payload: UpdateProfilePayload) => {
		const session = await getSession()

		if (!user) throw new Error('Not authenticated.')
		if (session?.userId !== user.id) throw new Error('Forbidden.')

		const fd = new FormData()

		const fields = {
			name: payload.name,
			username: payload.username,
			email: payload.email,
			password: payload.password,
			avatar: payload.avatar
		}

		for (const [key, value] of Object.entries(fields)) {
			if (value != null && value !== '') {
				fd.append(key, value)
			}
		}
		
		if (Array.from(fd.entries()).length === 0) {
			throw new Error('Send at least one field to update profile.')
		}

		const res = await api.put<{ user: User }>(`/api/users/${user.id}`, fd)
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
