import { prisma } from '@/src/shared/server/prisma'
import { createHash, randomBytes } from 'crypto'

export const ACCESS_TOKEN_TTL_MS = 1000 * 60 * 15
export const REFRESH_TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 30

export type SessionTokens = {
	userId: string
	accessToken: string
	refreshToken: string
	accessExpiresAt: Date
	refreshExpiresAt: Date
}

const hashToken = (token: string) =>
	createHash('sha256').update(token).digest('hex')

const buildToken = () => randomBytes(32).toString('hex')

const buildExpiration = () => {
	const now = Date.now()
	return {
		accessExpiresAt: new Date(now + ACCESS_TOKEN_TTL_MS),
		refreshExpiresAt: new Date(now + REFRESH_TOKEN_TTL_MS)
	}
}

const isExpired = (expiresAt: Date) => expiresAt.getTime() <= Date.now()

export const createSession = async (
	userId: string,
	meta?: { userAgent?: string; ip?: string }
): Promise<SessionTokens> => {
	const accessToken = buildToken()
	const refreshToken = buildToken()
	const { accessExpiresAt, refreshExpiresAt } = buildExpiration()

	await prisma.session.create({
		data: {
			userId,
			accessTokenHash: hashToken(accessToken),
			refreshTokenHash: hashToken(refreshToken),
			accessExpiresAt,
			refreshExpiresAt,
			userAgent: meta?.userAgent,
			ip: meta?.ip
		}
	})

	return {
		userId,
		accessToken,
		refreshToken,
		accessExpiresAt,
		refreshExpiresAt
	}
}

export const getSessionsByAccessToken = async (accessToken: string) => {
	const session = await prisma.session.findUnique({
		where: { accessTokenHash: hashToken(accessToken) }
	})

	if (!session) return null
	if (isExpired(session.accessExpiresAt)) return null

	return session
}

export const rotateSession = async (
	refreshToken: string,
	meta?: { userAgent?: string; ip?: string }
): Promise<SessionTokens | null> => {
	const refreshTokenHash = hashToken(refreshToken)

	const session = await prisma.session.findUnique({
		where: { refreshTokenHash }
	})

	if (!session) return null
	if (isExpired(session.refreshExpiresAt)) {
		await prisma.session.delete({ where: { id: session.id } })
		return null
	}

	const accessToken = buildToken()
	const newRefreshToken = buildToken()
	const { accessExpiresAt, refreshExpiresAt } = buildExpiration()

	await prisma.session.update({
		where: { id: session.id },
		data: {
			accessTokenHash: hashToken(accessToken),
			refreshTokenHash: hashToken(newRefreshToken),
			accessExpiresAt,
			refreshExpiresAt,
			userAgent: meta?.userAgent,
			ip: meta?.ip
		}
	})

	return {
		userId: session.userId,
		accessToken,
		refreshToken: newRefreshToken,
		accessExpiresAt,
		refreshExpiresAt
	}
}

export const revokeSessionByAccessToken = async (accessToken: string) => {
	const accessTokenHash = hashToken(accessToken)

	await prisma.session.deleteMany({
		where: { accessTokenHash }
	})
}

export const revokeSessionByRefreshToken = async (refreshToken: string) => {
	const refreshTokenHash = hashToken(refreshToken)

	await prisma.session.deleteMany({
		where: { refreshTokenHash }
	})
}
