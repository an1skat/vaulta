import { setAuthCookies } from '@/src/entities/user/server/auth-cookies'
import { createUser } from '@/src/entities/user/server/repo'
import { createSession } from '@/src/entities/user/server/session'
import { prisma } from '@/src/shared/server/prisma'
import { r2 } from '@/src/shared/server/r2'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import crypto from 'crypto'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function extFromType(type: string) {
	if (type === 'image/png') return 'png'
	if (type === 'image/jpeg') return 'jpg'
	if (type === 'image/webp') return 'webp'
	if (type === 'image/gif') return 'gif'
	return 'bin'
}

export async function POST(request: Request) {
	try {
		const form = await request.formData()

		const name = String(form.get('name') ?? '').trim()
		const username = String(form.get('username') ?? '').trim()
		const email = String(form.get('email') ?? '').trim()
		const password = String(form.get('password') ?? '').trim()

		if (!name || !username || !email || !password) {
			return NextResponse.json({ error: 'Missing fields.' }, { status: 400 })
		}

		const user = await createUser({ name, username, email, password })

		const avatar = form.get('avatar')
		if (avatar && avatar instanceof File && avatar.size > 0) {
			if (!avatar.type.startsWith('image/')) {
				return NextResponse.json(
					{ error: 'Avatar must be an image.' },
					{ status: 400 }
				)
			}
			if (avatar.size > 5 * 1024 * 1024) {
				return NextResponse.json(
					{ error: 'Avatar too large. Max 5MB.' },
					{ status: 400 }
				)
			}

			const bytes = await avatar.arrayBuffer()
			const body = Buffer.from(bytes)

			const ext = extFromType(avatar.type)
			const key = `avatar_${user.id}_${crypto.randomUUID()}.${ext}`

			await r2.send(
				new PutObjectCommand({
					Bucket: process.env.R2_BUCKET!,
					Key: key,
					Body: body,
					ContentType: avatar.type
				})
			)

			await prisma.user.update({
				where: { id: user.id },
				data: { avatarKey: key }
			})
		}

		const session = await createSession(user.id, {
			userAgent: request.headers.get('user-agent') || undefined,
			ip: request.headers.get('x-forwarded-for') || undefined
		})

		const freshUser = await prisma.user.findUnique({
			where: { id: user.id },
			select: {
				id: true,
				name: true,
				username: true,
				email: true,
				avatarKey: true
			}
		})

		const response = NextResponse.json({ user: freshUser })
		setAuthCookies(response, session)
		return response
	} catch (err) {
		return NextResponse.json(
			{ error: (err as Error).message || 'Registration failed.' },
			{ status: 400 }
		)
	}
}
