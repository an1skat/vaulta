export type ThemeMode = 'light' | 'dark'

export const THEME_STORAGE_KEY = 'vaulta-theme'

export const normalizeTheme = (value: unknown): ThemeMode | null => {
	if (value === 'light' || value === 'dark') return value
	return null
}

export const getStoredTheme = (): ThemeMode | null => {
	if (typeof window === 'undefined') return null
	return normalizeTheme(localStorage.getItem(THEME_STORAGE_KEY))
}

export const getPreferredTheme = (): ThemeMode => {
	if (typeof window === 'undefined') return 'light'
	const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches
	return prefersDark ? 'dark' : 'light'
}

export const resolveTheme = (): ThemeMode =>
	getStoredTheme() ?? getPreferredTheme()

export const applyTheme = (theme: ThemeMode) => {
	if (typeof document === 'undefined') return
	document.documentElement.setAttribute('data-theme', theme)
}
