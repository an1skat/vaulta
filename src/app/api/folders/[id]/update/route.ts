import { getFolderById, updateFolder } from '@/src/entities/folder/server/repo'
import { getSession } from '@/src/shared/lib/getSession'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function PUT(
	request: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	const payload = await request.json()
	const { id: folderId } = await params

	const folder = await getFolderById(folderId)
	if (!folder) return NextResponse.json({ error: 'Not found' }, { status: 404 })

	const session = await getSession()
	if (!session)
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

	if (session.userId !== folder.ownerId)
		return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

	const update = await updateFolder(payload, folderId)

	return NextResponse.json({ update })
}
