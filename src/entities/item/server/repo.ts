import { prisma } from '@/src/shared/server/prisma'
import {
	DETAILS_MAX_LENGTH,
	isValidDetails,
	isValidTitle,
	TITLE_MAX_LENGTH,
	TITLE_MIN_LENGTH
} from '../lib/validation'
import { ItemPayload } from '../model/types'

const norm = (s: string) => s.trim()
const lower = (s: string) => norm(s).toLowerCase()

export const getItemById = async (id: string) => {
	return prisma.item.findUnique({ where: { id } })
}

export const getAllFolderItems = async (folderId: string | undefined) => {
	if (!folderId) return []
	return prisma.item.findMany({
		where: { folderId },
		orderBy: { updatedAt: 'desc' },
		select: {
			id: true,
			folderId: true,
			title: true,
			details: true,
			createdAt: true,
			updatedAt: true
		}
	})
}

export const createItem = async (
	payload: ItemPayload,
	folderId: string,
	ownerId: string
) => {
	const title = payload.title || ''
	const details = payload.details || ''
	const titleLower = lower(title)

	if (!title) throw new Error('Title is required')
	if (!ownerId) throw new Error('Owner is required')
	if (!folderId) throw new Error('Folder is required')

	if (!isValidTitle(title))
		throw new Error(
			`Title should be between ${TITLE_MIN_LENGTH} and ${TITLE_MAX_LENGTH}`
		)

	if (!isValidDetails(details))
		throw new Error(`Details should be less than ${DETAILS_MAX_LENGTH}`)

	const existing = await prisma.item.findFirst({
		where: { folderId, titleLower }
	})

	if (existing) throw new Error('Item already created')

	return prisma.item.create({
		data: {
			folderId,
			ownerId,
			title,
			titleLower,
			details
		}
	})
}

export const updateItem = async (payload: ItemPayload, itemId: string) => {
	const title = payload.title || ''
	const details = payload.details || ''
	const titleLower = lower(title)

	if (!title) throw new Error('Title is required')
	if (!itemId) throw new Error('Item is required')

	if (!isValidTitle(title))
		throw new Error(
			`Title should be between ${TITLE_MIN_LENGTH} and ${TITLE_MAX_LENGTH}`
		)

	if (!isValidDetails(details))
		throw new Error(`Details should be less than ${DETAILS_MAX_LENGTH}`)

	return prisma.item.update({
		where: { id: itemId },
		data: {
			title,
			titleLower,
			details
		}
	})
}

export const deleteItem = async (itemId: string) => {
	if (!itemId) throw new Error('Item is required')

	await prisma.item.delete({ where: { id: itemId } })

	return { message: 'Delete success' }
}
