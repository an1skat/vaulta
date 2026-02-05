import api from '@/src/shared/api'
import { ItemPayload } from '../model/types'

export const getAllFolderItems = async (folderId: string) => {
	const res = await api.post('/api/items/search', folderId)
	return res.data
}

export const getItemById = async (id: string) => {
	await api.get(`/api/items/${id}`)
}

export const createItem = async (payload: ItemPayload, folderId: string) => {
	const fd = new FormData()
	fd.append('title', payload.title)
	fd.append('folderId', folderId)

	if (payload.details?.trim()) fd.append('details', payload.details.trim())

	if (payload.images?.length) {
		for (const file of payload.images) {
			fd.append('images', file)
		}
	}

	const res = await api.post('/api/items', fd)
	return res.data
}
