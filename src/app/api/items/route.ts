import { createItem } from '@/src/entities/item/server/repo'
import { extFromType } from '@/src/shared/lib/extFromType'
import { getSession } from '@/src/shared/lib/getSession'
import { prisma } from '@/src/shared/server/prisma'
import { r2 } from '@/src/shared/server/r2'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import crypto from 'crypto'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_FILES = 8
const MAX_FILE_SIZE = 10 * 1024 * 1024

export async function POST(request: Request) {
	try {
		const session = await getSession()
		if (!session?.userId) {
			return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 })
		}

		const form = await request.formData()

		const title = String(form.get('title'))
		const folderId = String(form.get('folderId'))
		const details = String(form.get('details'))

		if (!title) {
			return NextResponse.json({ error: 'Missing title.' }, { status: 400 })
		}
		if (!folderId) {
			return NextResponse.json({ error: 'Missing folderId.' }, { status: 400 })
		}

		const folder = await prisma.folder.findFirst({
			where: { id: folderId, ownerId: session.userId },
			select: { id: true }
		})

		if (!folder) {
			return NextResponse.json({ error: 'Folder not found.' }, { status: 404 })
		}

		const rawImages = form.getAll('images')
		if (rawImages.length > MAX_FILES) {
			return NextResponse.json(
				{ error: `Too many images. Max ${MAX_FILES}.` },
				{ status: 400 }
			)
		}

		const images = rawImages.filter(v => v instanceof File) as File[]

		for (const file of images) {
			if (!file.type.startsWith('image/')) {
				return NextResponse.json(
					{ error: 'All files must be images.' },
					{ status: 400 }
				)
			}
			if (file.size > MAX_FILE_SIZE) {
				return NextResponse.json(
					{
						error: `Image too large. Max ${(MAX_FILE_SIZE / (1024 * 1024)).toFixed(0)}MB.`
					},
					{ status: 400 }
				)
			}
		}

		const item = await createItem({ title, details }, folderId)

		const imagesKeys: string[] = []

		for (const file of images) {
			const bytes = await file.arrayBuffer()
			const body = Buffer.from(bytes)

			const ext = extFromType(file.type)
			const key = `image_${item.id}_${crypto.randomUUID()}.${ext}`

			await r2.send(
				new PutObjectCommand({
					Bucket: process.env.R2_BUCKET!,
					Key: key,
					Body: body,
					ContentType: file.type
				})
			)

			imagesKeys.push(key)
		}

		const freshItem = await prisma.item.update({
			where: { id: item.id },
			data: imagesKeys.length ? { imagesKeys } : {}
		})

		return NextResponse.json(freshItem)
	} catch (err) {
		return NextResponse.json(
			{ error: (err as Error).message || 'Creating item failed.' },
			{ status: 400 }
		)
	}
}
