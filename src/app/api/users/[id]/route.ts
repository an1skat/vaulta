import {
	deleteUser,
	getUserById,
	hashPassword,
	verifyPassword
} from '@/src/entities/user/server/repo'
import {
	isStrongPassword,
	isValidDescription,
	isValidEmail,
	isValidName,
	isValidUsername,
	DESCRIPTION_MAX_LENGTH,
	NAME_MAX_LENGTH,
	NAME_MIN_LENGTH,
	PASSWORD_MIN_LENGTH
} from '@/src/entities/user/lib/validation'
import { extFromType } from '@/src/shared/lib/extFromType'
import { getSession } from '@/src/shared/lib/getSession'
import { prisma } from '@/src/shared/server/prisma'
import { r2 } from '@/src/shared/server/r2'
import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id: userId } = await params

		const session = await getSession()
		if (!session) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		if (session.userId !== userId) {
			return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
		}

		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: {
				id: true,
				name: true,
				username: true,
				email: true,
				description: true,
				avatarKey: true,
				password: true
			}
		})
		if (!user) {
			return NextResponse.json({ error: 'Not found.' }, { status: 404 })
		}

		const form = await request.formData()

		const nameRaw = form.get('name')
		const usernameRaw = form.get('username')
		const emailRaw = form.get('email')
		const descriptionRaw = form.get('description')
		const passwordRaw = form.get('password')
		const currentPasswordRaw = form.get('currentPassword')
		const avatarRaw = form.get('avatar')

		const data: Record<string, unknown> = {}
		const nextIdentity: { username?: string; email?: string } = {}

		if (typeof nameRaw === 'string') {
			const name = nameRaw.trim()
			if (name) {
				if (!isValidName(name)) {
					return NextResponse.json(
						{
							error: `Name must be between ${NAME_MIN_LENGTH} and ${NAME_MAX_LENGTH} characters.`
						},
						{ status: 400 }
					)
				}
				data.name = name
			}
		}

		if (typeof usernameRaw === 'string') {
			const username = usernameRaw.trim().toLowerCase()
			if (username) {
				if (!isValidUsername(username)) {
					return NextResponse.json(
						{ error: `Username must be less than ${NAME_MAX_LENGTH} characters.` },
						{ status: 400 }
					)
				}
				if (username !== user.username) {
					data.username = username
					nextIdentity.username = username
				}
			}
		}

		if (typeof emailRaw === 'string') {
			const email = emailRaw.trim().toLowerCase()
			if (email) {
				if (!isValidEmail(email)) {
					return NextResponse.json(
						{ error: 'Email address is invalid.' },
						{ status: 400 }
					)
				}
				if (email !== user.email) {
					data.email = email
					nextIdentity.email = email
				}
			}
		}

		if (typeof descriptionRaw === 'string') {
			const description = descriptionRaw.trim()
			if (description) {
				if (!isValidDescription(description)) {
					return NextResponse.json(
						{
							error: `Description must be ${DESCRIPTION_MAX_LENGTH} characters or less.`
						},
						{ status: 400 }
					)
				}
				data.description = description
			} else {
				data.description = null
			}
		}

		const password =
			typeof passwordRaw === 'string' ? passwordRaw.trim() : ''
		const currentPassword =
			typeof currentPasswordRaw === 'string' ? currentPasswordRaw.trim() : ''

		if (password) {
			if (!isStrongPassword(password)) {
				return NextResponse.json(
					{
						error: `Password must be at least ${PASSWORD_MIN_LENGTH} characters and include at least three of: uppercase, lowercase, number, and symbol.`
					},
					{ status: 400 }
				)
			}
		}

		const needsPasswordCheck = Boolean(password) || Boolean(nextIdentity.email)

		if (needsPasswordCheck) {
			if (!currentPassword) {
				return NextResponse.json(
					{ error: 'Current password is required for this change.' },
					{ status: 400 }
				)
			}
			const matches = await verifyPassword(currentPassword, user.password)
			if (!matches) {
				return NextResponse.json(
					{ error: 'Current password is incorrect.' },
					{ status: 403 }
				)
			}
		}

		if (password) {
			data.password = await hashPassword(password)
		}

		if (Object.keys(nextIdentity).length > 0) {
			const existing = await prisma.user.findFirst({
				where: {
					OR: [
						nextIdentity.username
							? { username: nextIdentity.username }
							: undefined,
						nextIdentity.email ? { email: nextIdentity.email } : undefined
					].filter(Boolean) as Array<
						{ username: string } | { email: string }
					>,
					NOT: { id: userId }
				},
				select: { id: true }
			})

			if (existing) {
				return NextResponse.json(
					{ error: 'Username or email is already taken.' },
					{ status: 409 }
				)
			}
		}

		const oldAvatarKey =
			typeof user.avatarKey === 'string' && user.avatarKey.length > 0
				? user.avatarKey
				: null

		let newAvatarKey: string | null = null

		if (avatarRaw instanceof File && avatarRaw.size > 0) {
			if (!avatarRaw.type.startsWith('image/')) {
				return NextResponse.json(
					{ error: 'Avatar must be an image.' },
					{ status: 400 }
				)
			}

			if (avatarRaw.size > 5 * 1024 * 1024) {
				return NextResponse.json(
					{ error: 'Avatar too large. Max 5MB.' },
					{ status: 400 }
				)
			}

			const bytes = await avatarRaw.arrayBuffer()
			const body = Buffer.from(bytes)

			const ext = extFromType(avatarRaw.type)
			const key = `avatar_${userId}_${crypto.randomUUID()}.${ext}`

			await r2.send(
				new PutObjectCommand({
					Bucket: process.env.R2_BUCKET!,
					Key: key,
					Body: body,
					ContentType: avatarRaw.type
				})
			)

			newAvatarKey = key
			data.avatarKey = key
		}

		if (Object.keys(data).length === 0) {
			return NextResponse.json(
				{ error: 'Send at least one field to update profile.' },
				{ status: 400 }
			)
		}

		const updated = await prisma.user.update({
			where: { id: userId },
			data,
			select: {
				id: true,
				name: true,
				username: true,
				email: true,
				description: true,
				avatarKey: true
			}
		})

		if (newAvatarKey && oldAvatarKey && oldAvatarKey !== newAvatarKey) {
			try {
				await r2.send(
					new DeleteObjectCommand({
						Bucket: process.env.R2_BUCKET!,
						Key: oldAvatarKey
					})
				)
			} catch {}
		}

		return NextResponse.json({ user: updated })
	} catch (err) {
		return NextResponse.json(
			{ error: (err as Error).message || 'Update failed.' },
			{ status: 400 }
		)
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	const { id: userId } = await params

	const session = await getSession()
	if (!session)
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

	if (session.userId !== userId)
		return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

	const user = await getUserById(userId)
	if (!user) return NextResponse.json({ error: 'Not found.' }, { status: 404 })

	const res = await deleteUser(userId)

	if (user.avatarKey) {
		try {
			await r2.send(
				new DeleteObjectCommand({
					Bucket: process.env.R2_BUCKET!,
					Key: user.avatarKey
				})
			)
		} catch {}
	}

	return NextResponse.json({ res })
}
