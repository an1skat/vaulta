import { prisma } from '@/src/shared/server/prisma'
import { randomBytes, scrypt, timingSafeEqual } from 'crypto'
import 'server-only'
import { promisify } from 'util'
import {
	isStrongPassword,
	isValidEmail,
	isValidName,
	isValidUsername
} from '../lib/validation'
import { LoginPayload, RegisterPayload, User } from '../model/types'

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

export const getUserById = async (id: string) => {
	return prisma.user.findUnique({
		where: { id },
		select: {
			id: true,
			name: true,
			username: true,
			email: true
		}
	})
}

export const createUser = async (payload: RegisterPayload) => {
	const name = payload.name
	const username = payload.username?.trim().toLowerCase()
	const email = payload.email?.trim().toLowerCase()
	const password = payload.password?.trim()

	if (!name || !username || !email || !password) {
		throw new Error('Username, email and password are required')
	}

	if (!isValidName(name)) {
		throw new Error('Name must be between 3 and 20 characters.')
	}

	if (!isValidUsername(username)) { 
		throw new Error('Username must be less than 20 characters.')
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

	const created = await prisma.user.create({
		data: {
			name,
			username,
			email,
			password: hashedPassword
		},
		select: {
			id: true,
			name: true,
			username: true,
			email: true
		}
	})

	return created
}

export const loginUser = async (payload: LoginPayload): Promise<User> => {
	const login = payload.login?.trim().toLowerCase()
	const payloadPassword = payload.password?.trim()

	if (!login || !payloadPassword)
		throw new Error('Login and password are required.')

	const user = await prisma.user.findFirst({
		where: {
			OR: [{ username: login }, { email: login }]
		}
	})

	if (!user) throw new Error('Invalid login or password.')

	const matches = await verifyPassword(payloadPassword, user.password)

	if (!matches) throw new Error('Invalid login or password.')

	const { password, ...data } = user

	return { ...data }
}
