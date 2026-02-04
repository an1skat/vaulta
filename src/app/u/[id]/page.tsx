import { findUserFolders } from '@/src/entities/folder/server/repo'
import { FolderList } from '@/src/entities/folder/ui/FolderList'
import { getUserById } from '@/src/entities/user/server/repo'
import { getSession } from '@/src/shared/lib/getSession'
import { FiUser } from 'react-icons/fi'
import { notFound } from 'next/navigation'

type ProfilePageProps = {
	params: { id: string }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
	const user = await getUserById(params.id)
	if (!user) return notFound()

	const session = await getSession()
	const viewerId = session?.userId

	// Load public collections (or private too if the viewer is the owner).
	const folders = await findUserFolders(user.username, viewerId)

	return (
		<main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
			<section className="relative overflow-hidden rounded-3xl border border-(--glass-border) bg-(--glass) p-6 shadow-(--shadow) backdrop-blur-[18px] backdrop-saturate-150 sm:p-8">
				<div className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(130deg,rgba(255,255,255,0.45),rgba(255,255,255,0.08)_45%,transparent_75%)] opacity-70" />
				<div className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-1/2 bg-[radial-gradient(320px_circle_at_80%_40%,var(--accent-soft),transparent_70%)] opacity-80" />
				<div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex items-center gap-4">
						<span className="flex h-12 w-12 items-center justify-center rounded-full border border-(--glass-border) bg-(--accent-soft) text-(--accent-strong)">
							<FiUser className="text-xl" />
						</span>
						<div>
							<p className="text-xs font-semibold uppercase tracking-[0.35em] text-(--muted)">
								Profile
							</p>
							<h1 className="mt-2 text-2xl font-semibold text-foreground">
								{user.name}
							</h1>
							<p className="mt-1 text-sm text-(--muted)">
								@{user.username}
							</p>
						</div>
					</div>
					<div className="text-sm text-(--muted)">
						Collection library
					</div>
				</div>
			</section>

			<FolderList folders={folders} query={`@${user.username}`} />
		</main>
	)
}
