import { getAllUserFolders } from '@/src/entities/folder/server/repo'
import { getSession } from '@/src/shared/lib/getSession'
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
