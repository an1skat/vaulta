import { getAllUserFolders } from '@/src/entities/folder/server/repo'
import { getSessionsByAccessToken } from '@/src/entities/user/server/session'
import { getSession } from '@/src/shared/lib/getSession'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
	const session = await getSession()

	if (!session)
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

	const folders = await getAllUserFolders(session.userId)

	return NextResponse.json(folders)
}
