'use client'

import { getPasswordStrength } from '../lib/getPasswordStrength'
import {
	isStrongPassword,
	isValidEmail,
	isValidName,
	NAME_MAX_LENGTH,
	NAME_MIN_LENGTH,
	PASSWORD_MIN_LENGTH
} from '@/src/entities/user/lib/validation'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChangeEvent, FormEvent, useState } from 'react'

export default function RegisterForm() {
	const [form, setForm] = useState({
		username: '',
		password: '',
		email: ''
	})
	const [error, setError] = useState<string | null>(null)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const { strengthPercent, strengthLabel, strengthColor } = getPasswordStrength(form.password)

	const router = useRouter()

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target
		setForm(prev => ({ ...prev, [name]: value }));
		setError(null);
	}

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault()

		try {
			if (!isValidName(form.username)) {
				setError(
					`Name must be between ${NAME_MIN_LENGTH} and ${NAME_MAX_LENGTH} characters.`
				)
				return
			}
			if (!isValidEmail(form.email)) {
				setError('Enter a valid email address.')
				return
			}
			if (!isStrongPassword(form.password)) {
				setError(
					`Password must be at least ${PASSWORD_MIN_LENGTH} characters and include at least three of: uppercase, lowercase, number, symbol.`
				)
				return
			}

			router.push('/auth/login')
		} catch (err) {
			setError((err as Error).message)
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<form onSubmit={handleSubmit}>
			<label htmlFor="username">
				Username
				<input
					type="text"
					name="username"
					id="username"
					placeholder="Username"
					onChange={handleChange}
				/>
			</label>
			<label htmlFor="Email">
				Email
				<input
					type="email"
					name="email"
					id="email"
					placeholder="E-mail"
					onChange={handleChange}
				/>
			</label>
			<label htmlFor="password">
				Password
				<input
					type="password"
					name="password"
					id="password"
					placeholder="Password"
					onChange={handleChange}
				/>
				<div className="space-y-2">
					<div className="h-2 w-full rounded-full bg-white/10">
						<div
							className={`h-2 rounded-full transition-all duration-300 ${strengthColor}`}
							style={{ width: `${strengthPercent}%` }}
						/>
					</div>
					<p className="text-xs text-white/60">
						Strength: {strengthLabel}. Use {PASSWORD_MIN_LENGTH}+ chars and at
						least three of uppercase, lowercase, number, symbol.
					</p>
				</div>
			</label>
			{error && <p className="text-sm text-red-400">{error}</p>}

			<button type="submit">Submit</button>
			<p>
				Already have an account? <Link href="/auth/login">Login</Link>
			</p>
		</form>
	)
}
