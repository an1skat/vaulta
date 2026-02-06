'use client'

import { useAuth } from '@/src/entities/user/model/auth'
import { useMemo } from 'react'
import { FiUser } from 'react-icons/fi'

type ProfileHeaderProps = {
	user: {
		id: string
		name: string
		username: string
		description?: string | null
		avatarKey?: string | null
	}
}

export default function ProfileHeader({ user }: ProfileHeaderProps) {
	const { user: authUser } = useAuth()
	const displayUser = useMemo(() => {
		if (!authUser || authUser.id !== user.id) return user
		return { ...user, ...authUser }
	}, [authUser, user])

	return (
		<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
			<span className="flex h-14 w-14 overflow-hidden items-center justify-center rounded-2xl border border-(--glass-border) bg-(--accent-soft) text-(--accent-strong) shadow-[0_12px_30px_-22px_rgba(12,23,17,0.65)]">
				{displayUser.avatarKey ? (
					<img
						src={`/api/files/${encodeURIComponent(displayUser.avatarKey)}`}
						alt={`${displayUser.username} avatar`}
						className="h-full w-full object-cover"
					/>
				) : (
					<FiUser className="text-xl" />
				)}
			</span>

			<div>
				<p className="text-xs font-semibold uppercase tracking-[0.35em] text-(--muted)">
					Profile
				</p>
				<h1 className="mt-2 text-2xl font-semibold text-foreground sm:text-3xl">
					{displayUser.name}
				</h1>
				<p className="mt-1 text-sm text-(--muted)">
					@{displayUser.username}
				</p>
				{displayUser.description ? (
					<p className="mt-3 max-w-xl text-sm text-(--muted-strong)">
						{displayUser.description}
					</p>
				) : null}
			</div>
		</div>
	)
}
