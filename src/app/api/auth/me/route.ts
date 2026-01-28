import { clearAuthCookies } from '@/src/entities/user/server/auth-cookies'
import { getUserById } from '@/src/entities/user/server/repo'
import { getSessionsByAccessToken } from '@/src/entities/user/server/session'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
	const cookieStore = await cookies()
	const accessToken = cookieStore.get('access-token')?.value

	if (!accessToken) {
		return NextResponse.json(
			{ error: 'Missing access token.' },
			{ status: 401 }
		)
	}

	const session = await getSessionsByAccessToken(accessToken)
	if (!session) {
		return NextResponse.json({ error: 'Session expired.' }, { status: 401 })
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

	return NextResponse.json({ user })
}
