'use client'

import {
	applyTheme,
	getPreferredTheme,
	getStoredTheme,
	normalizeTheme,
	resolveTheme,
	THEME_STORAGE_KEY
} from '@/src/shared/lib/theme'
import { useEffect } from 'react'

export default function ThemeSync() {
	useEffect(() => {
		applyTheme(resolveTheme())

		const handleStorage = (event: StorageEvent) => {
			if (event.key !== THEME_STORAGE_KEY) return
			const next = normalizeTheme(event.newValue)
			applyTheme(next ?? getPreferredTheme())
		}

		const media = window.matchMedia?.('(prefers-color-scheme: dark)')
		const handleMedia = () => {
			if (getStoredTheme()) return
			applyTheme(getPreferredTheme())
		}

		window.addEventListener('storage', handleStorage)
		media?.addEventListener?.('change', handleMedia)

		return () => {
			window.removeEventListener('storage', handleStorage)
			media?.removeEventListener?.('change', handleMedia)
		}
	}, [])

	return null
}
