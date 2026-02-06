import { deleteItem, getItemById } from '@/src/entities/item/server/repo'
import { extFromType } from '@/src/shared/lib/extFromType'
import { getSession } from '@/src/shared/lib/getSession'
import { prisma } from '@/src/shared/server/prisma'
import { r2 } from '@/src/shared/server/r2'
import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_FILES = 8
const MAX_FILE_SIZE = 10 * 1024 * 1024

export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	let uploadedKeys: string[] = []

	try {
		const { id: itemId } = await params

		const session = await getSession()
		if (!session) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const item = await getItemById(itemId)
		if (!item) {
			return NextResponse.json({ error: 'Not found.' }, { status: 404 })
		}

		if (session.userId !== item.ownerId) {
			return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
		}

		const form = await request.formData()

		const titleRaw = form.get('title')
		const detailsRaw = form.get('details')
		const rawImages = form.getAll('images')

		const data: Record<string, unknown> = {}

		if (typeof titleRaw === 'string') {
			const title = titleRaw
			if (title.length > 0 && title.trim().length > 0) {
				data.title = title
			}
		}

		if (typeof detailsRaw === 'string') {
			const details = detailsRaw
			if (details.length > 0 && details.trim().length > 0) {
				data.details = details
			}
		}

		if (rawImages.length > MAX_FILES) {
			return NextResponse.json(
				{ error: `Too many images. Max 8 elements.` },
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
					{ error: `Image too large. Max 10MB.` },
					{ status: 400 }
				)
			}
		}

		const oldImagesKeys = Array.isArray(item.imagesKeys) ? item.imagesKeys : []

		if (images.length > 0) {
			const newImagesKeys: string[] = []

			for (const file of images) {
				const bytes = await file.arrayBuffer()
				const body = Buffer.from(bytes)

				const ext = extFromType(file.type)
				const key = `image_${itemId}_${crypto.randomUUID()}.${ext}`

				await r2.send(
					new PutObjectCommand({
						Bucket: process.env.R2_BUCKET!,
						Key: key,
						Body: body,
						ContentType: file.type
					})
				)

				newImagesKeys.push(key)
				uploadedKeys.push(key)
			}

			data.imagesKeys = newImagesKeys
		}

		if (Object.keys(data).length === 0) {
			return NextResponse.json(
				{ error: 'Send at least one field to update item.' },
				{ status: 400 }
			)
		}

		const updated = await prisma.item.update({
			where: { id: itemId },
			data
		})

		if (images.length > 0 && oldImagesKeys.length > 0) {
			for (const key of oldImagesKeys) {
				try {
					await r2.send(
						new DeleteObjectCommand({
							Bucket: process.env.R2_BUCKET!,
							Key: key
						})
					)
				} catch (e) {
					console.error('Failed to delete old item image:', key, e)
				}
			}
		}

		return NextResponse.json({ item: updated })
	} catch (err) {
		if (uploadedKeys.length > 0) {
			for (const key of uploadedKeys) {
				try {
					await r2.send(
						new DeleteObjectCommand({
							Bucket: process.env.R2_BUCKET!,
							Key: key
						})
					)
				} catch (e) {
					console.error('Failed to cleanup uploaded item image:', key, e)
				}
			}
		}

		return NextResponse.json(
			{ error: (err as Error).message || 'Update failed.' },
			{ status: 400 }
		)
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	const { id: itemId } = await params

	const item = await getItemById(itemId)
	if (!item) return NextResponse.json({ error: 'Not found.' }, { status: 404 })

	const session = await getSession()
	if (!session)
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

	if (session.userId !== item.ownerId)
		return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })

	const res = await deleteItem(itemId)

	return NextResponse.json({ res })
}
