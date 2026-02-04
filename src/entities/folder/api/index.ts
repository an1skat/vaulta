import api from '@/src/shared/api'
import { FolderPayload } from '../model/types'

export const getAllUserFolders = async () => {
	const res = await api.get('/api/folders')
	return res.data
}

export const getFolderById = async (id: string) =>
	await api.get(`/api/folders/${id}`)

export const createFolder = async (payload: FolderPayload) => {
	const res = await api.post('/api/folders', payload)
	return res.data
}

export const updateFolder = async (payload: FolderPayload, id: string) => {
	const res = await api.put(`/api/folders/${id}/update`, payload)
	return res.data
}

export const deleteFolder = async (id: string) => {
	const res = await api.delete(`/api/folders/${id}/delete`)
	return res.data
}

export const findFolders = async (query: string) => {
	const res = await api.get(
		`/api/folders/search?query=${encodeURIComponent(query)}`
	)
	return res.data
}
