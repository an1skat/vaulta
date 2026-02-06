import { getUserById } from '@/src/entities/user/server/repo'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { FiHome, FiSettings } from 'react-icons/fi'
import ProfileEdit from '../../features/profile-edit/ui/ProfileEdit'
import ProfileHeader from './ProfileHeader'

export default async function ProfileSection({
	params,
	viewerId
}: {
	params: Promise<{ id: string }>
	viewerId?: string | null
}) {
	const { id } = await params
	const user = await getUserById(id)
	if (!user) return notFound()
	const canEdit = viewerId === user.id
	return (
		<section className="relative overflow-hidden rounded-3xl border border-(--glass-border) bg-(--glass) p-6 shadow-(--shadow) backdrop-blur-[18px] backdrop-saturate-150 sm:p-8">
			<div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(420px_circle_at_85%_45%,var(--accent-soft),transparent_70%)] opacity-70" />
			<div className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-1/2  opacity-80" />
			<div className="relative z-10 grid gap-6 lg:grid-cols-[1.35fr_auto] lg:items-center">
				<ProfileHeader user={user} />
				{canEdit ? (
					<div className="flex flex-col gap-3 rounded-2xl border border-(--glass-border) bg-(--surface) px-4 py-4 shadow-(--shadow-soft) sm:px-5">
						<div>
							<p className="text-xs font-semibold uppercase tracking-[0.35em] text-(--muted)">
								Quick actions
							</p>
							<p className="mt-1 text-sm text-(--muted)">
								Keep your profile and settings in sync.
							</p>
						</div>
						<div className="flex flex-wrap items-center gap-2">
							<Link
								href="/"
								className="inline-flex items-center gap-2 rounded-full border border-(--border) bg-(--surface) px-3 py-2 text-xs font-semibold text-(--muted-strong) shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] transition duration-200 hover:-translate-y-0.5 hover:border-(--accent) hover:text-(--accent-strong) focus-visible:outline-none focus-visible:shadow-[0_0_0_4px_var(--ring)]"
							>
								<FiHome className="text-base" />
								Home
							</Link>
							<ProfileEdit initialUser={user} />
							<Link
								href="/settings"
								className="inline-flex items-center gap-2 rounded-full border border-(--border) bg-transparent px-4 py-2 text-sm font-semibold text-(--muted-strong) shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] transition duration-200 hover:-translate-y-0.5 hover:border-(--accent) hover:text-(--accent-strong) focus-visible:outline-none focus-visible:shadow-[0_0_0_4px_var(--ring)]"
							>
								<FiSettings className="text-base" />
								Settings
							</Link>
						</div>
					</div>
				) : (
					<div className="flex items-center gap-3 text-sm text-(--muted)">
						<Link
							href="/"
							className="inline-flex items-center gap-2 rounded-full border border-(--border) bg-(--surface) px-3 py-1.5 text-xs font-semibold text-(--muted-strong) shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] transition duration-200 hover:-translate-y-0.5 hover:border-(--accent) hover:text-(--accent-strong) focus-visible:outline-none focus-visible:shadow-[0_0_0_4px_var(--ring)]"
						>
							<FiHome className="text-sm" />
							Home
						</Link>
						<span>Collection library</span>
					</div>
				)}
			</div>
		</section>
	)
}
