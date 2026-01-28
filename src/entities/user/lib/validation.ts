export const NAME_MIN_LENGTH = 3
export const NAME_MAX_LENGTH = 20
export const PASSWORD_MIN_LENGTH = 7

export const isValidName = (name: string) => {
	const trimmed = name.trim()
	return trimmed.length >= NAME_MIN_LENGTH && trimmed.length <= NAME_MAX_LENGTH
}
export const isValidUsername = (username: string) => {
	return username.length <= NAME_MAX_LENGTH
}

export const isValidEmail = (email: string) => {
	const trimmed = email.trim()
	if (!trimmed) return false
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)
}

const countPasswordClasses = (password: string) => {
	let count = 0
	if (/[a-z]/.test(password)) count += 1
	if (/[A-Z]/.test(password)) count += 1
	if (/\d/.test(password)) count += 1
	if (/[^A-Za-z0-9]/.test(password)) count += 1
	return count
}

export const getPasswordStrengthScore = (password: string) => {
	const trimmed = password.trim()
	if (!trimmed) return 0
	const classCount = countPasswordClasses(trimmed)
	if (trimmed.length < PASSWORD_MIN_LENGTH) return 1
	if (classCount <= 1) return 2
	if (classCount === 2) return 3
	return 4
}

export const isStrongPassword = (password: string) => {
	const trimmed = password.trim()
	return (
		trimmed.length >= PASSWORD_MIN_LENGTH && countPasswordClasses(trimmed) >= 3
	)
}
