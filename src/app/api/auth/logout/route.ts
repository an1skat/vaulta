import { clearAuthCookies } from '@/src/entities/user/server/auth-cookies'
import {
	revokeSessionByAccessToken,
	revokeSessionByRefreshToken
} from '@/src/entities/user/server/session'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST() {
	const cookieStore = await cookies()
	const accessToken = cookieStore.get('access_token')?.value
	const refreshToken = cookieStore.get('refresh_token')?.value

	if (accessToken) {
		await revokeSessionByAccessToken(accessToken)
	} else if (refreshToken) {
		await revokeSessionByRefreshToken(refreshToken)
	}

	const response = NextResponse.json({ ok: true })
	clearAuthCookies(response)
	return response
}
