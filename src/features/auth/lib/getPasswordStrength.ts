import { getPasswordStrengthScore } from '@/src/entities/user/lib/validation'

export function getPasswordStrength(password: string) {
	const passwordScore = getPasswordStrengthScore(password)
	const strengthPercent = Math.min(100, (passwordScore / 4) * 100)
	const strengthLabel =
		passwordScore === 0
			? 'Too short'
			: passwordScore === 1
				? 'Too short'
				: passwordScore === 2
					? 'Weak'
					: passwordScore === 3
						? 'Okay'
						: 'Strong'
	const strengthColor =
		passwordScore <= 1
			? 'bg-red-500'
			: passwordScore === 2
				? 'bg-orange-400'
				: passwordScore === 3
					? 'bg-yellow-400'
					: 'bg-emerald-400'

		return {
			strengthPercent,
			strengthLabel,
			strengthColor
		}
}
