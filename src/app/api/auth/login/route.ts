import { setAuthCookies } from '@/src/entities/user/server/auth-cookies'
import { loginUser } from '@/src/entities/user/server/repo'
import { createSession } from '@/src/entities/user/server/session'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
	try {
		const payload = await request.json()
		const rawLogin = payload.login ?? payload.username ?? payload.email ?? ''
		const login = typeof rawLogin === 'string' ? rawLogin : ''
		const password =
			typeof payload.password === 'string' ? payload.password : ''
		const user = await loginUser({
			login,
			password
		})
		const session = await createSession(user.id, {
			userAgent: request.headers.get('user-agent') ?? undefined,
			ip: request.headers.get('x-forwarded-for') ?? undefined
		})
		const response = NextResponse.json({ user })
		setAuthCookies(response, session)
		return response
	} catch (err) {
		return NextResponse.json(
			{ error: (err as Error).message || 'Login failed' },
			{ status: 400 }
		)
	}
}
