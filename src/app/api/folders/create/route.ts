import { createFolder } from '@/src/entities/folder/server/repo'
import { getSessionsByAccessToken } from '@/src/entities/user/server/session'
import { getSession } from '@/src/shared/lib/getSession'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
	try {
		const payload = await request.json()
		
		const session = await getSession()
		if (!session)
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

		const folder = await createFolder(payload, session.userId)
		return NextResponse.json({ folder })
	} catch (err) {
		return NextResponse.json({
			error: (err as Error).message || 'Creating folder failed',
			status: 400
		})
	}
}
