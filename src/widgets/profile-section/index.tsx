import { getUserById } from '@/src/entities/user/server/repo'
import { notFound } from 'next/navigation'
import { FiUser } from 'react-icons/fi'

export default async function ProfileSection({
	params
}: {
	params: Promise<{ id: string }>
}) {
	const { id } = await params
	const user = await getUserById(id)
	if (!user) return notFound()
	return (
		<section className="relative overflow-hidden rounded-3xl border border-(--glass-border) bg-(--glass) p-6 shadow-(--shadow) backdrop-blur-[18px] backdrop-saturate-150 sm:p-8">
			<div className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(130deg,rgba(255,255,255,0.45),rgba(255,255,255,0.08)_45%,transparent_75%)] opacity-70" />
			<div className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-1/2 opacity-80" />
			<div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-center gap-4">
					<span className="flex h-12 w-12 overflow-hidden items-center justify-center rounded-full border border-(--glass-border) bg-(--accent-soft) text-(--accent-strong)">
						{user.avatarKey ? (
							<img
								src={`/api/files/${encodeURIComponent(user.avatarKey)}`}
								alt={`${user.username} avatar`}
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
						<h1 className="mt-2 text-2xl font-semibold text-foreground">
							{user.name}
						</h1>
						<p className="mt-1 text-sm text-(--muted)">@{user.username}</p>
					</div>
				</div>
				<div className="text-sm text-(--muted)">Collection library</div>
			</div>
		</section>
	)
}
