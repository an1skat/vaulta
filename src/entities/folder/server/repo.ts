import { prisma } from '@/src/shared/server/prisma'
import {
	DETAILS_MAX_LENGTH,
	isValidDetails,
	isValidTitle,
	TITLE_MAX_LENGTH,
	TITLE_MIN_LENGTH
} from '../lib/validation'
import { FolderPayload } from '../model/types'

const norm = (s: string) => s.trim()
const lower = (s: string) => norm(s).toLowerCase()

export const getFolderById = async (id: string) => {
	return prisma.folder.findUnique({ where: { id } })
}

export const getAllUserFolders = async (userId: string) => {
  return prisma.folder.findMany({
    where: { ownerId: userId },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      ownerId: true,
      title: true,
      titleLower: true,
      details: true,
      createdAt: true,
      updatedAt: true,
      isPublic: true,
      owner: {
        select: { username: true }
      }
    }
  })
}


export const createFolder = async (payload: FolderPayload, ownerId: string) => {
	const title = norm(payload.title || '')
	const details = payload.details ? norm(payload.details) : ''
	const isPublic = payload.isPublic
	const titleLower = lower(title)

	if (!title) throw new Error('Title is required')
	if (!ownerId) throw new Error('Owner is required')
	if (typeof isPublic !== 'boolean') throw new Error('Visibility is required')

	if (!isValidTitle(title))
		throw new Error(
			`Title should be between ${TITLE_MIN_LENGTH} and ${TITLE_MAX_LENGTH}`
		)

	if (!isValidDetails(details))
		throw new Error(`Details should be less than ${DETAILS_MAX_LENGTH}`)

	const existing = await prisma.folder.findFirst({
		where: { ownerId, titleLower }
	})

	if (existing) throw new Error('Folder already created')

	return prisma.folder.create({
		data: {
			ownerId,
			title,
			titleLower,
			details,
			isPublic
		}
	})
}

export const updateFolder = async (
	payload: FolderPayload,
	folderId: string
) => {
	const title = norm(payload.title || '')
	const details = payload.details ? norm(payload.details) : ''
	const isPublic = payload.isPublic

	if (!title) throw new Error('Title is required')
	if (!folderId) throw new Error('Folder is required')

	if (!isValidTitle(title))
		throw new Error(
			`Title should be between ${TITLE_MIN_LENGTH} and ${TITLE_MAX_LENGTH}`
		)

	if (!isValidDetails(details))
		throw new Error(`Details should be less than ${DETAILS_MAX_LENGTH}`)

	return prisma.folder.update({
		where: { id: folderId },
		data: {
			title,
			titleLower: lower(title),
			details,
			...(typeof isPublic === 'boolean' ? { isPublic } : {})
		}
	})
}

export const deleteFolder = async (folderId: string) => {
	if (!folderId) throw new Error('Folder is required')

	await prisma.folder.delete({ where: { id: folderId } })

	return { message: 'Delete success' }
}

export const findFolders = async (query: string | null, viewerId?: string) => {
	const q = query ? lower(query) : ''
	if (!q) return []

	const where = viewerId
		? {
				titleLower: { contains: q },
				OR: [{ isPublic: true }, { ownerId: viewerId }]
			}
		: { titleLower: { contains: q }, isPublic: true }

	return prisma.folder.findMany({
		where,
		orderBy: { updatedAt: 'desc' },
		take: 50,
		select: {
			id: true,
			ownerId: true,
			title: true,
			titleLower: true,
			details: true,
			createdAt: true,
			updatedAt: true,
			isPublic: true,
			owner: {
				select: {
					username: true
				}
			}
		}
	})
}

export const findUserFolders = async (
	query: string | null,
	viewerId?: string
) => {
	const q = query ? lower(query) : ''
	if (!q) return []

	const raw = q.startsWith('%40')
		? q.slice(3)
		: q.startsWith('@')
			? q.slice(1)
			: q
	const username = norm(raw)

	if (!username) return []

	const owner = await prisma.user.findUnique({
		where: { username },
		select: { id: true }
	})

	if (!owner) return []

	const where =
		viewerId && viewerId === owner.id
			? { ownerId: owner.id }
			: { ownerId: owner.id, isPublic: true }

	return prisma.folder.findMany({
		where,
		orderBy: { updatedAt: 'desc' },
		take: 50,
		select: {
			id: true,
			ownerId: true,
			title: true,
			titleLower: true,
			details: true,
			createdAt: true,
			updatedAt: true,
			isPublic: true,
			owner: {
				select: {
					username: true
				}
			}
		}
	})
}
