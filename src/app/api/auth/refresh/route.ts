import {
	clearAuthCookies,
	setAuthCookies
} from '@/src/entities/user/server/auth-cookies'
import { getUserById } from '@/src/entities/user/server/repo'
import { rotateSession } from '@/src/entities/user/server/session'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
	const cookieStore = await cookies()
	const refreshToken = cookieStore.get('refresh_token')?.value

	if (!refreshToken) {
		return NextResponse.json(
			{ error: 'Missing refresh token.' },
			{ status: 401 }
		)
	}

	const session = await rotateSession(refreshToken, {
		userAgent: request.headers.get('user-agent') ?? undefined,
		ip: request.headers.get('x-forwarded-for') ?? undefined
	})

	if (!session) {
		const response = NextResponse.json(
			{ error: 'Session expired.' },
			{ status: 401 }
		)
		clearAuthCookies(response)
		return response
	}

	const user = await getUserById(session.userId)
	if (!user) {
		const response = NextResponse.json(
			{ error: 'User not found.' },
			{ status: 401 }
		)
		clearAuthCookies(response)
		return response
	}

	const response = NextResponse.json({ user })
	setAuthCookies(response, session)
	return response
}
