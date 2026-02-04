'use client'

import { useAuth } from '@/src/entities/user/model/auth'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChangeEvent, FormEvent, useState } from 'react'

export default function Login() {
	const [form, setForm] = useState({
		login: '',
		password: ''
	})
	const [error, setError] = useState<string | null>(null)
	const [isSubmitting, setIsSubmitting] = useState(false)

	const { login } = useAuth()
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
			await login({
				login: form.login,
				password: form.password
			})
			router.push('/')
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
				<div className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-1/2 bg-[radial-gradient(320px_circle_at_20%_40%,var(--accent-soft),transparent_70%)] opacity-80" />
				<div className="relative z-10 grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr]">
					<div className="bg-(--surface) p-6 sm:p-8 lg:border-r lg:border-(--glass-border) lg:p-10">
						<div className="mb-6 sm:mb-8">
							<p className="text-xs font-semibold uppercase tracking-[0.4em] text-(--muted)">
								Welcome to
							</p>
							<h1 className="mt-2 text-2xl font-semibold text-foreground sm:text-3xl">
								Vaulta
							</h1>
							<p className="mt-2 text-sm text-(--muted)">
								Your space. Your collections.
							</p>
						</div>
						<div className="grid gap-4 sm:gap-5">
							<label className="grid gap-2 text-sm font-semibold text-(--muted-strong)">
								<span>Username or Email</span>
								<input
									type="text"
									name="login"
									id="login"
									placeholder="Username or Email"
									value={form.login}
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
									value={form.password}
									onChange={handleChange}
									className="w-full rounded-2xl border border-(--border) bg-(--input-bg) px-4 py-3 text-base text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] transition duration-200 placeholder:text-(--muted) focus:border-(--accent) focus:shadow-[0_0_0_4px_var(--ring)] focus:outline-none"
								/>
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
								Don&apos;t have an account?{' '}
								<Link
									href="/auth/register"
									className="font-semibold text-(--accent-strong) underline-offset-4 transition hover:underline"
								>
									Register
								</Link>
							</p>
						</div>
					</div>
					<div className="relative min-h-55 bg-(--surface-strong) sm:min-h-70">
						<img
							src="https://images.unsplash.com/photo-1519052537078-e6302a4968d4?auto=format&fit=crop&w=1200&q=80"
							alt="Cat resting on a blanket"
							className="absolute inset-0 h-full w-full object-cover"
						/>
						<div className="absolute inset-0 bg-linear-to-br from-black/30 via-black/10 to-emerald-400/25" />
						<div className="relative z-10 flex h-full flex-col justify-end gap-3 p-6 text-white sm:p-8 lg:p-10">
							<span className="text-xs font-semibold uppercase tracking-[0.4em] text-white/70">
								Vaulta
							</span>
						</div>
					</div>
				</div>
			</div>
		</form>
	)
}
