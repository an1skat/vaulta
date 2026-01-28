import { prisma } from '@/src/shared/server/prisma'
import { randomBytes, scrypt, timingSafeEqual } from 'crypto'
import 'server-only'
import { promisify } from 'util'
import { isStrongPassword, isValidEmail, isValidName } from '../lib/validation'
import { RegisterPayload } from '../model/types'

const scryptAsync = promisify(scrypt)
const hashPassword = async (password: string) => {
	const salt = randomBytes(16).toString('hex')
	const derived = (await scryptAsync(password, salt, 64)) as Buffer
	return `scrypt$${salt}$${derived.toString('hex')}`
}
const verifyPassword = async (password: string, stored: string) => {
	const parts = stored.split('$')
	if (parts.length !== 3) return false

	const [algo, salt, hash] = parts
	if (algo !== 'scrypt') return false

	const derived = (await scryptAsync(password, salt, 64)) as Buffer
	const storedBuf = Buffer.from(hash, 'hex')

	if (storedBuf.length !== derived.length) return false
	return timingSafeEqual(storedBuf, derived)
}

export const findUserById = async (id: string) => {
	return prisma.user.findUnique({ where: { id } })
}

export const createUser = async (payload: RegisterPayload) => {
	const username = payload.username?.trim()
	const email = payload.email?.trim()
	const password = payload.password?.trim()

	if (!username || !email || !password) {
		throw new Error('Username, email and password are required')
	}

	if (!isValidName(username)) {
		throw new Error('Name must be between 3 and 20 characters.')
	}

	if (!isValidEmail(email)) {
		throw new Error('Email address is invalid.')
	}

	if (!isStrongPassword(password)) {
		throw new Error(
			'Password must be at least 7 characters and include at least three of: uppercase, lowercase, number, and symbol.'
		)
	}

	const existing = await prisma.user.findFirst({
		where: {
			OR: [{ username }, { email }]
		},
		select: { id: true, username: true, email: true }
	})

	if (existing) throw new Error('Username or email is already taken')

	const hashedPassword = await hashPassword(password)

	const user = {
		username,
		email,
		password: hashedPassword
	}

	const created = await prisma.user.create({
		data: {
			username,
			email,
			password: hashedPassword
		},
		select: {
			id: true,
			username: true,
			email: true
		}
	})

	return created
}
