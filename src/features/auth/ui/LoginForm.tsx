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
		<form onSubmit={handleSubmit}>
			<label htmlFor="login">
				Username or Email
				<input
					type="text"
					name="login"
					id="login"
					placeholder="Username or Email"
				/>
			</label>
			<label htmlFor="password">
				Password
				<input
					type="password"
					name="password"
					id="password"
					placeholder="Password"
				/>
			</label>
			{error && <p className="text-sm text-red-400">{error}</p>}

			<button type="submit">Submit</button>
			<p>
				Dont have an account? <Link href="/auth/register">Register</Link>
			</p>
		</form>
	)
}
