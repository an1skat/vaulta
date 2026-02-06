export type User = {
	id: string
	name: string
	username: string
	email: string
	description?: string | null
	password?: string
	avatar?: string
	avatarKey?: string | null
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
	name?: string
	username?: string
	email?: string
	description?: string | null
	avatar?: File | null
	password?: string
	currentPassword?: string
}

export type AuthContextValue = {
	user: User | null
	login: (payload: LoginPayload) => Promise<void>
	register: (payload: RegisterPayload) => Promise<void>
	logout: () => Promise<void>
	updateProfile: (payload: UpdateProfilePayload) => Promise<void>
	deleteProfile: (id: string) => Promise<void>
}
