'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'

export default function Login() {
	const [form, setForm] = useState({
		login: '',
		password: ''
	})
	const [error, setError] = useState<string | null>(null)
	const [isSubmitting, setIsSubmitting] = useState(false)

	const router = useRouter()

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault()

		try {
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
			className="flex min-h-screen w-full items-center justify-center px-4 py-12"
		>
			<div className="relative w-full max-w-5xl overflow-hidden rounded-[28px] border border-(--glass-border) bg-(--glass) shadow-(--shadow) backdrop-blur-[18px] backdrop-saturate-150 before:pointer-events-none before:absolute before:inset-0 before:z-0 before:bg-[linear-gradient(130deg,rgba(255,255,255,0.45),rgba(255,255,255,0.08)_45%,transparent_75%)] before:opacity-80 before:content-[''] after:pointer-events-none after:absolute after:bottom-0 after:left-0 after:right-0 after:top-auto after:z-0 after:h-1/2 after:bg-[radial-gradient(320px_circle_at_20%_40%,var(--accent-soft),transparent_70%)] after:opacity-80 after:content-['']">
				<div className="relative z-10 grid lg:grid-cols-[0.95fr_1.05fr]">
					<div className="bg-(--surface) p-8 lg:border-r lg:border-(--glass-border) lg:p-10">
						<div className="mb-6">
							<p className="text-xs font-semibold uppercase tracking-[0.4em] text-(--muted)">
								Welcome to
							</p>
							<h1 className="mt-2 text-3xl font-semibold text-foreground">
								Vaulta
							</h1>
							<p className="mt-2 text-sm text-(--muted)">
								Sign in to your vault and continue where you left off.
							</p>
						</div>
						<div className="grid gap-5">
							<label className="grid gap-2 text-sm font-semibold text-(--muted-strong)">
								<span>Username or Email</span>
								<input
									type="text"
									name="login"
									id="login"
									placeholder="Username or Email"
									className="rounded-2xl border border-(--border) bg-(--input-bg) px-4 py-3 text-base text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] transition duration-200 placeholder:text-(--muted) focus:border-(--accent) focus:shadow-[0_0_0_4px_var(--ring)] focus:outline-none"
								/>
							</label>
							<label className="grid gap-2 text-sm font-semibold text-(--muted-strong)">
								<span>Password</span>
								<input
									type="password"
									name="password"
									id="password"
									placeholder="Password"
									className="rounded-2xl border border-(--border) bg-(--input-bg) px-4 py-3 text-base text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] transition duration-200 placeholder:tex
									`t-[color:var(--muted)] focus:border-(--accent) focus:shadow-[0_0_0_4px_var(--ring)] focus:outline-none"
								/>
							</label>
							{error && <p className="text-sm text-(--error)">{error}</p>}

							<button
								type="submit"
								className="mt-2 w-full rounded-full bg-linear-to-br from-(--accent) to-(--accent-strong) px-4 py-3 text-sm font-semibold text-[#061c12] shadow-[0_18px_40px_-22px_rgba(16,158,86,0.85)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_24px_50px_-26px_rgba(16,158,86,0.95)] focus-visible:outline-none focus-visible:shadow-[0_0_0_4px_var(--ring)] disabled:cursor-not-allowed disabled:opacity-70"
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
					<div className="relative min-h-70 bg-(--surface-strong)">
						<img
							src="https://images.unsplash.com/photo-1519052537078-e6302a4968d4?auto=format&fit=crop&w=1200&q=80"
							alt="Cat resting on a blanket"
							className="absolute inset-0 h-full w-full object-cover"
						/>
						<div className="absolute inset-0 bg-linear-to-br from-black/30 via-black/10 to-emerald-400/25" />
						<div className="relative z-10 flex h-full flex-col justify-end gap-3 p-8 text-white lg:p-10">
							<span className="text-xs font-semibold uppercase tracking-[0.4em] text-white/70">
								Vaulta
							</span>
							<h2 className="text-3xl font-semibold leading-tight">
								Welcome back
							</h2>
							<p className="max-w-xs text-sm text-white/70">
								Your vault is waiting. Let&apos;s unlock it.
							</p>
						</div>
					</div>
				</div>
			</div>
		</form>
	)
}
