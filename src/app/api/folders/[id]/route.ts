import { getFolderById } from '@/src/entities/folder/server/repo'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	const { id } = await params

	if (!id) return NextResponse.json({ error: 'Invalid url' }, { status: 400 })

	const folder = await getFolderById(id)

	return NextResponse.json({ folder })
}
