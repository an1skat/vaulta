import axios, { AxiosError, AxiosRequestConfig } from 'axios'

const api = axios.create({
	headers: {
		'Content-Type': 'application/json'
	},
	withCredentials: true
})

let isRefreshing = false
let refreshPromise: Promise<void> | null = null

async function ensureRefresh() {
	if (isRefreshing && refreshPromise) {
		await refreshPromise
		return
	}

	isRefreshing = true
	refreshPromise = api
		.post('/api/auth/refresh')
		.then(() => undefined)
		.finally(() => {
			isRefreshing = false
			refreshPromise = null
		})

	await refreshPromise
}

api.interceptors.response.use(
	response => response,
	async (error: AxiosError) => {
		const status = error.response?.status
		const config = (error.config || {}) as AxiosRequestConfig & {
			_retry?: boolean
		}
		const url = config.url || ''

		if (
			status !== 401 ||
			config._retry ||
			url.includes('/api/auth/refresh') ||
			url.includes('/api/auth/login') ||
			url.includes('/api/auth/register')
		)
			throw error

		config._retry = true

		try {
			await ensureRefresh()
		} catch (error) {
			throw error
		}

		return axios.request(config)
	}
)

export default api
