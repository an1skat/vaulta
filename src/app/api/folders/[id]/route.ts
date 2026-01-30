import { getFolderById } from '@/src/entities/folder/server/repo'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET({ params }: { params: { id: string } }) {
	const id = params.id

	if (!id) return NextResponse.json({ error: 'Invalid url' }, { status: 400 })

	const folder = await getFolderById(id)

	return NextResponse.json({ folder })
}
