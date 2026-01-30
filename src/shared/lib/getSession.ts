import { getSessionsByAccessToken } from '@/src/entities/user/server/session'
import { cookies } from 'next/headers'

export const getSession = async () => {
	const cookieStore = await cookies()

	const accessToken = cookieStore.get('access-token')?.value
	if (!accessToken) return null

	const session = await getSessionsByAccessToken(accessToken)
	if (!session) return null

	return session
}
