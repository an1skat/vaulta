import { Folder } from '@prisma/client'
import FolderCard from './FolderCard'

type FolderListItem = Folder & {
	owner: { username: string }
}

type FolderListProps = {
	folders: FolderListItem[]
	query?: string
	profile?: boolean
}

export function FolderList({
	folders,
	query = '',
	profile = false
}: FolderListProps) {
	return (
		<div className="grid gap-4">
			<div className="flex flex-wrap items-center justify-between gap-2">
				{profile ? (
					<h3 className="text-lg font-semibold text-foreground">
						My Collections
					</h3>
				) : (
					<h3 className="text-lg font-semibold text-foreground">Collections</h3>
				)}
				{query && (
					<span className="text-xs font-semibold text-(--muted)">
						&quot;{query}&quot; - {folders.length} result
						{folders.length === 1 ? '' : 's'}
					</span>
				)}
			</div>
			{folders.length ? (
				<ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{/* Owner usernames are selected in the server query to avoid per-item lookups. */}
					{folders.map(folder => (
						<FolderCard
							key={folder.id}
							folder={folder}
							username={folder.owner?.username || ''}
						/>
					))}
				</ul>
			) : (
				<div className="rounded-2xl border border-(--glass-border) bg-(--surface) p-6 text-sm text-(--muted)">
					{query
						? 'No collections match your search yet.'
						: 'Start typing to discover public collections.'}
				</div>
			)}
		</div>
	)
}
