import { deleteFolder, getFolderById } from '@/src/entities/folder/server/repo'
import { getSession } from '@/src/shared/lib/getSession'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	const { id: folderId } = await params

	const folder = await getFolderById(folderId)
	if (!folder) return NextResponse.json({ error: 'Not found' }, { status: 404 })

	const session = await getSession()
	if (!session)
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

	if (session.userId !== folder.ownerId)
		return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

	const res = await deleteFolder(folderId)

	return NextResponse.json({ res })
}
