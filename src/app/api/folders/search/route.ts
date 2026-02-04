import { findFolders, findUserFolders } from '@/src/entities/folder/server/repo'
import { getSession } from '@/src/shared/lib/getSession'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
	const searchParams = request.nextUrl.searchParams
	const query = searchParams.get('query')

	const session = await getSession()
	const viewerId = session?.userId

	console.log('Session: ', session)

	const q = query ?? ''
	const isUserQuery = q.startsWith('@') || q.startsWith('%40')

	const folders = isUserQuery
		? await findUserFolders(q, viewerId)
		: await findFolders(q, viewerId)

	return NextResponse.json({ folders })
}
