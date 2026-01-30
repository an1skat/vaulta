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
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChangeEvent, FormEvent, useState } from 'react'
import { getPasswordStrength } from '../lib/getPasswordStrength'

export default function RegisterForm() {
	const { register, login } = useAuth()
	const [form, setForm] = useState({
		name: '',
		username: '',
		password: '',
		email: ''
	})
	const [error, setError] = useState<string | null>(null)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const { strengthPercent, strengthLabel, strengthColor } = getPasswordStrength(
		form.password
	)

	const router = useRouter()

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target
		setForm(prev => ({ ...prev, [name]: value }))
		setError(null)
	}

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		setIsSubmitting(true)

		try {
			const username = form.username.trim()
			const email = form.email
			const password = form.password
			const name = form.name
			if (!isValidName(name)) {
				setError(
					`Name must be between ${NAME_MIN_LENGTH} and ${NAME_MAX_LENGTH} characters.`
				)
				return
			}
			if (!isValidUsername(username)) {
				setError(
					`Username must be between less than ${NAME_MAX_LENGTH} characters.`
				)
				return
			}
			if (!isValidEmail(email)) {
				setError('Enter a valid email address.')
				return
			}
			if (!isStrongPassword(password)) {
				setError(
					`Password must be at least ${PASSWORD_MIN_LENGTH} characters and include at least three of: uppercase, lowercase, number, symbol.`
				)
				return
			}

			await register({
				name,
				username,
				email,
				password
			})

			await login({
				login: username,
				password
			})

			// router.push('/')
		} catch (err) {
			setError((err as Error).message)
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<form
			onSubmit={handleSubmit}
			className="flex min-h-screen w-full items-center justify-center px-4 py-10 sm:px-6 sm:py-12 lg:px-4 lg:py-12"
		>
			<div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-(--glass-border) bg-(--glass) shadow-(--shadow) backdrop-blur-[18px] backdrop-saturate-150 sm:max-w-3xl sm:rounded-3xl lg:max-w-5xl lg:rounded-[28px]">
				<div className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(130deg,rgba(255,255,255,0.45),rgba(255,255,255,0.08)_45%,transparent_75%)] opacity-80" />
				<div className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-1/2 bg-[radial-gradient(320px_circle_at_80%_40%,var(--accent-soft),transparent_70%)] opacity-80" />
				<div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr]">
					<div className="order-2 relative min-h-55 bg-(--surface-strong) sm:min-h-70 lg:order-1">
						<img
							src="https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=1200&q=80"
							alt="Cats lounging together"
							className="absolute inset-0 h-full w-full object-cover"
						/>
						<div className="absolute inset-0 bg-linear-to-br from-black/35 via-black/10 to-emerald-400/25" />
						<div className="relative z-10 flex h-full flex-col justify-end gap-3 p-6 text-white sm:p-8 lg:p-10">
							<span className="text-xs font-semibold uppercase tracking-[0.4em] text-white/70">
								Vaulta
							</span>
						</div>
					</div>
					<div className="order-1 bg-(--surface) p-6 sm:p-8 lg:order-2 lg:border-l lg:border-(--glass-border) lg:p-10">
						<div className="mb-6 sm:mb-8">
							<p className="text-xs font-semibold uppercase tracking-[0.4em] text-(--muted)">
								Welcome to
							</p>
							<h1 className="mt-2 text-2xl font-semibold text-foreground sm:text-3xl">
								Vaulta
							</h1>
							<p className="mt-2 text-sm text-(--muted)">
								Organize your world, your way.
							</p>
						</div>
						<div className="grid gap-4 sm:gap-5">
							<label className="grid gap-2 text-sm font-semibold text-(--muted-strong)">
								<span>Name</span>
								<input
									type="text"
									name="name"
									id="name"
									placeholder="Display name"
									onChange={handleChange}
									className="w-full rounded-2xl border border-(--border) bg-[color:
									var(--input-bg)] px-4 py-3 text-base text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] transition duration-200 placeholder:text-(--muted) focus:border-(--accent) focus:shadow-[0_0_0_4px_var(--ring)] focus:outline-none"
								/>
							</label>
							<label className="grid gap-2 text-sm font-semibold text-(--muted-strong)">
								<span>Username</span>

								<div className="relative">
									<span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-(--muted)">
										@
									</span>

									<input
										type="text"
										name="username"
										id="username"
										placeholder="username"
										value={form.username}
										onChange={handleChange}
										className="w-full rounded-2xl border border-(--border) bg-(--input-bg) pl-7 pr-4 py-3 text-base text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] transition duration-200 placeholder:text-(--muted) focus:border-(--accent) focus:shadow-[0_0_0_4px_var(--ring)] focus:outline-none"
									/>
								</div>
							</label>

							<label className="grid gap-2 text-sm font-semibold text-(--muted-strong)">
								<span>Email</span>
								<input
									type="email"
									name="email"
									id="email"
									placeholder="E-mail"
									onChange={handleChange}
									className="w-full rounded-2xl border border-(--border) bg-(--input-bg) px-4 py-3 text-base text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] transition duration-200 placeholder:text-(--muted) focus:border-(--accent) focus:shadow-[0_0_0_4px_var(--ring)] focus:outline-none"
								/>
							</label>
							<label className="grid gap-2 text-sm font-semibold text-(--muted-strong)">
								<span>Password</span>
								<input
									type="password"
									name="password"
									id="password"
									placeholder="Password"
									onChange={handleChange}
									className="w-full rounded-2xl border border-(--border) bg-(--input-bg) px-4 py-3 text-base text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] transition duration-200 placeholder:text-(--muted) focus:border-(--accent) focus:shadow-[0_0_0_4px_var(--ring)] focus:outline-none"
								/>
								<div className="mt-2 grid gap-2">
									<div className="h-2 w-full overflow-hidden rounded-full border border-white/15 bg-white/15">
										<div
											className={`h-full rounded-full transition-all duration-300 ${strengthColor}`}
											style={{ width: `${strengthPercent}%` }}
										/>
									</div>
									<p className="text-xs text-(--muted)">
										Strength: {strengthLabel}. Use {PASSWORD_MIN_LENGTH}+ chars
										and at least three of uppercase, lowercase, number, symbol.
									</p>
								</div>
							</label>
							{error && <p className="text-sm text-(--error)">{error}</p>}

							<button
								type="submit"
								className="mt-2 w-full rounded-full bg-linear-to-br from-(--accent) to-(--accent-strong) px-4 py-3 text-sm font-semibold text-[#061c12] shadow-[0_18px_40px_-22px_rgba(16,158,86,0.85)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_24px_50px_-26px_rgba(16,158,86,0.95)] focus-visible:outline-none focus-visible:shadow-[0_0_0_4px_var(--ring)] disabled:cursor-not-allowed disabled:opacity-70 sm:text-base"
								disabled={isSubmitting}
							>
								Submit
							</button>
							<p className="text-center text-sm text-(--muted)">
								Already have an account?{' '}
								<Link
									href="/auth/login"
									className="font-semibold text-(--accent-strong) underline-offset-4 transition hover:underline"
								>
									Login
								</Link>
							</p>
						</div>
					</div>
				</div>
			</div>
		</form>
	)
}
