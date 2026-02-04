import { r2 } from '@/src/shared/server/r2'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(
	_req: Request,
	{ params }: { params: Promise<{ key: string }> }
) {
	const { key } = await params
	const decodedKey = decodeURIComponent(key)

	const cmd = new GetObjectCommand({
		Bucket: process.env.R2_BUCKET!,
		Key: decodedKey
	})

	const signed = await getSignedUrl(r2, cmd, { expiresIn: 60 * 10 })
	return NextResponse.redirect(signed, 302)
}
