'use client'

import {
	isStrongPassword,
	isValidEmail,
	isValidName,
	isValidUsername,
	NAME_MAX_LENGTH,
	NAME_MIN_LENGTH,
	PASSWORD_MIN_LENGTH
} from '@/src/entities/user/lib/validation'
import { useAuth } from '@/src/entities/user/model/auth'
import type {
	UpdateProfilePayload,
	User
} from '@/src/entities/user/model/types'
import { getPasswordStrength } from '@/src/features/auth/lib/getPasswordStrength'
import {
	useEffect,
	useMemo,
	useState,
	type ChangeEvent,
	type FormEvent
} from 'react'

export type ProfileEditInitialUser = {
	id: string
	name: string
	username: string
	email: string
	description?: string | null
	avatarKey?: string | null
}

const buildBase = (user: ProfileEditInitialUser) => ({
	name: user.name ?? '',
	username: user.username ?? '',
	email: user.email ?? ''
})

export const useProfileEdit = (initialUser: ProfileEditInitialUser) => {
	const { updateProfile, user: authUser } = useAuth()

	const baseUser = useMemo(() => {
		const merged =
			authUser && authUser.id === initialUser.id
				? ({ ...initialUser, ...authUser } as ProfileEditInitialUser & User)
				: initialUser
		return merged
	}, [authUser, initialUser])

	const [open, setOpen] = useState(false)
	const [form, setForm] = useState(() => ({
		...buildBase(baseUser),
		currentPassword: '',
		password: '',
		confirmPassword: ''
	}))
	const [avatarFile, setAvatarFile] = useState<File | null>(null)
	const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [isSubmitting, setIsSubmitting] = useState(false)

	const { strengthPercent, strengthLabel, strengthColor } = getPasswordStrength(
		form.password
	)

	const existingAvatar =
		baseUser.avatarKey != null
			? `/api/files/${encodeURIComponent(baseUser.avatarKey)}`
			: null

	const displayAvatar = avatarPreview ?? existingAvatar

	useEffect(() => {
		if (!avatarFile) {
			setAvatarPreview(null)
			return
		}
		const url = URL.createObjectURL(avatarFile)
		setAvatarPreview(url)
		return () => URL.revokeObjectURL(url)
	}, [avatarFile])

	useEffect(() => {
		if (!open) return

		const handleKey = (event: KeyboardEvent) => {
			if (event.key === 'Escape') setOpen(false)
		}

		const previousOverflow = document.body.style.overflow
		document.body.style.overflow = 'hidden'
		document.addEventListener('keydown', handleKey)

		setForm({
			...buildBase(baseUser),
			currentPassword: '',
			password: '',
			confirmPassword: ''
		})
		setAvatarFile(null)
		setError(null)

		return () => {
			document.body.style.overflow = previousOverflow
			document.removeEventListener('keydown', handleKey)
		}
	}, [open, baseUser])

	const openModal = () => setOpen(true)
	const closeModal = () => setOpen(false)

	const handleOverlayClick = () => closeModal()
	const stopPropagation = (event: React.MouseEvent) => event.stopPropagation()

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target
		setForm(prev => ({ ...prev, [name]: value }))
		setError(null)
	}

	const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0] ?? null
		setError(null)

		if (!file) {
			setAvatarFile(null)
			return
		}

		if (!file.type.startsWith('image/')) {
			setError('Avatar must be an image file.')
			e.target.value = ''
			return
		}

		if (file.size > 5 * 1024 * 1024) {
			setError('Avatar is too large. Max 5MB.')
			e.target.value = ''
			return
		}

		setAvatarFile(file)
	}

	const clearAvatar = () => {
		setAvatarFile(null)
		const input = document.getElementById(
			'profile-avatar'
		) as HTMLInputElement | null
		if (input) input.value = ''
	}

	const submit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		setIsSubmitting(true)
		setError(null)

		const stop = (message: string) => {
			setError(message)
			setIsSubmitting(false)
		}

		try {
			const base = buildBase(baseUser)

			const name = form.name.trim()
			const username = form.username.trim()
			const email = form.email.trim()
			const password = form.password.trim()
			const confirmPassword = form.confirmPassword.trim()
			const currentPassword = form.currentPassword.trim()

			const payload: UpdateProfilePayload = {}

			if (name && name !== base.name) {
				if (!isValidName(name)) {
					return stop(
						`Name must be between ${NAME_MIN_LENGTH} and ${NAME_MAX_LENGTH} characters.`
					)
				}
				payload.name = name
			}

			if (username && username !== base.username) {
				if (!isValidUsername(username)) {
					return stop(
						`Username must be less than ${NAME_MAX_LENGTH} characters.`
					)
				}
				payload.username = username
			}

			if (email && email !== base.email) {
				if (!isValidEmail(email)) {
					return stop('Enter a valid email address.')
				}
				payload.email = email
			}

			if (password) {
				if (password !== confirmPassword) {
					return stop('Passwords do not match.')
				}
				if (!isStrongPassword(password)) {
					return stop(
						`Password must be at least ${PASSWORD_MIN_LENGTH} characters and include at least three of: uppercase, lowercase, number, symbol.`
					)
				}
				payload.password = password
			}

			if (avatarFile) payload.avatar = avatarFile

			const needsPassword = Boolean(payload.password) || Boolean(payload.email)
			if (needsPassword) {
				if (!currentPassword) {
					return stop(
						'Current password is required to change email or password.'
					)
				}
				payload.currentPassword = currentPassword
			}

			if (Object.keys(payload).length === 0) {
				return stop('No changes to save.')
			}

			await updateProfile(payload)
			setOpen(false)
		} catch (err) {
			setError((err as Error).message)
		} finally {
			setIsSubmitting(false)
		}
	}

	return {
		open,
		openModal,
		closeModal,
		handleOverlayClick,
		stopPropagation,

		form,
		handleChange,

		avatarFile,
		displayAvatar,
		handleAvatarChange,
		clearAvatar,

		error,
		isSubmitting,

		strengthPercent,
		strengthLabel,
		strengthColor,

		submit
	}
}
