import { clearAuthCookies } from '@/src/entities/user/server/auth-cookies'
import { getUserById } from '@/src/entities/user/server/repo'
import { getSessionsByAccessToken } from '@/src/entities/user/server/session'
import { getSession } from '@/src/shared/lib/getSession'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
	const session = await getSession();
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
