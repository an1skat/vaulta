import { prisma } from '@/src/shared/server/prisma'
import {
	DETAILS_MAX_LENGTH,
	isValidDetails,
	isValidTitle,
	TITLE_MAX_LENGTH,
	TITLE_MIN_LENGTH
} from '../lib/validation'
import { FolderPayload } from '../model/types'

export const getFolderById = async (id: string) => {
	return prisma.folder.findUnique({
		where: { id }
	})
}

export const getAllUserFolders = async (userId: string) => {
	return prisma.folder.findMany({
		where: { ownerId: userId }
	})
}

export const createFolder = async (payload: FolderPayload, ownerId: string) => {
	const title = payload.title
	const details = payload.details ?? ''

	if (!title) throw new Error('Title is required')
	if (!ownerId) throw new Error('Owner is required')

	if (!isValidTitle(title))
		throw new Error(
			`Title should be between ${TITLE_MIN_LENGTH} and ${TITLE_MAX_LENGTH}`
		)

	if (!isValidDetails(details))
		throw new Error(`Details should be less than ${DETAILS_MAX_LENGTH}`)

	const exisitng = await prisma.folder.findFirst({
		where: { ownerId, title }
	})

	if (exisitng) throw new Error('Folder already created')

	const created = await prisma.folder.create({
		data: {
			title,
			details,
			ownerId
		}
	})

	return created
}

export const updateFolder = async (
	payload: FolderPayload,
	folderId: string
) => {
	const title = payload.title
	const details = payload.details ?? ''

	if (!title) throw new Error('Title is required')
	if (!folderId) throw new Error('Folder is required')

	if (!isValidTitle(title))
		throw new Error(
			`Title should be between ${TITLE_MIN_LENGTH} and ${TITLE_MAX_LENGTH}`
		)

	if (!isValidDetails(details))
		throw new Error(`Details should be less than ${DETAILS_MAX_LENGTH}`)

	const updateFolder = await prisma.folder.update({
		where: { id: folderId },
		data: {
			title,
			details
		}
	})

	return updateFolder
}

export const deleteFolder = async (folderId: string) => {
	if (!folderId) throw new Error('Folder is required')

	await prisma.folder.delete({
		where: { id: folderId }
	})

	return {
		message: 'Delete success'
	}
}
