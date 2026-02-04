import { Folder } from '@prisma/client'
import Link from 'next/link'
import { FiArrowUpRight, FiFolder } from 'react-icons/fi'

type FolderCardProps = {
	folder: Folder
	username: string
}

export default function FolderCard({ folder, username }: FolderCardProps) {
	const details = folder.details?.trim()
	const summary =
		details && details.length > 120 ? `${details.slice(0, 120)}...` : details

	return (
		<li className="group">
			{/* Card shell with hover states; inner links handle navigation. */}
			<div className="flex h-full flex-col gap-3 rounded-2xl border border-(--glass-border) bg-(--surface) p-5 shadow-(--shadow-soft) transition duration-200 hover:-translate-y-1 hover:shadow-(--shadow)">
				<div className="flex items-center justify-between gap-3">
					{/* Collection label to distinguish folders from individual items. */}
					<span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-(--muted)">
						<FiFolder className="text-sm text-(--accent-strong)" />
						Collection
					</span>
					<span className="rounded-full border border-(--glass-border) bg-(--accent-soft) px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-(--accent-strong)">
						{folder.isPublic ? 'Public' : 'Private'}
					</span>
				</div>
				<Link
					href={`/f/${folder.id}`}
					className="grid gap-2 focus-visible:outline-none focus-visible:shadow-[0_0_0_4px_var(--ring)]"
				>
					<h4 className="text-lg font-semibold text-foreground">
						{folder.title}
					</h4>
					<p className="text-sm text-(--muted)">
						{summary || 'No description yet.'}
					</p>
				</Link>
				<div className="mt-auto flex items-center justify-between text-xs text-(--muted)">
					{/* Username links to the author's profile. */}
					<Link
						href={`/u/${folder.ownerId}`}
						className="font-semibold text-(--muted-strong) transition hover:text-(--accent-strong)"
					>
						@{username || 'unknown'}
					</Link>
					<Link
						href={`/f/${folder.id}`}
						className="inline-flex items-center gap-1 font-semibold text-(--accent-strong)"
					>
						Open
						<FiArrowUpRight className="text-xs" />
					</Link>
				</div>
			</div>
		</li>
	)
}
