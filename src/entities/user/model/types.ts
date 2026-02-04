export type User = {
	id: string
	username: string
	email: string
	password?: string
	avatar?: string
}

export type LoginPayload = {
	login: string
	password: string
}

export type RegisterPayload = {
	name: string
	username: string
	email: string
	password: string
	avatar?: File | null
}

export type UpdateProfilePayload = {
	username?: string
	email?: string
	avatar?: string
	password?: string
}

export type AuthContextValue = {
	user: User | null
	login: (payload: LoginPayload) => Promise<void>
	register: (payload: RegisterPayload) => Promise<void>
	logout: () => void
	updateProfile: (payload: UpdateProfilePayload) => Promise<void>
}
