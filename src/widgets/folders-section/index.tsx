import {
	findFolders,
	getAllUserFolders
} from '@/src/entities/folder/server/repo'
import { FolderList } from '@/src/entities/folder/ui/FolderList'
import SearchInput from '@/src/features/search-folders/ui/SearchInput'
import { getSession } from '@/src/shared/lib/getSession'
import { FiLayers } from 'react-icons/fi'

type FoldersSectionProps = {
	query?: string
}

export default async function FoldersSection({
	query = ''
}: FoldersSectionProps) {
	const session = await getSession()
	const viewerId = session?.userId

	const folders = query
		? await findFolders(query, viewerId)
		: viewerId
			? await getAllUserFolders(viewerId)
			: []
	return (
		<section className="relative overflow-hidden rounded-3xl border border-(--glass-border) bg-(--glass) p-6 shadow-(--shadow) backdrop-blur-[18px] backdrop-saturate-150 sm:p-8">
			<div className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(130deg,rgba(255,255,255,0.45),rgba(255,255,255,0.08)_45%,transparent_75%)] opacity-70" />
			<div className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-1/2 bg-[radial-gradient(320px_circle_at_20%_40%,var(--accent-soft),transparent_70%)] opacity-80" />
			<div className="relative z-10 grid gap-6">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
					<div>
						<p className="text-xs font-semibold uppercase tracking-[0.35em] text-(--muted)">
							Collections
						</p>
						<div className="mt-2 flex items-center gap-3">
							{/* Icon and label to emphasize collections over individual items. */}
							<span className="flex h-9 w-9 items-center justify-center rounded-full border border-(--glass-border) bg-(--accent-soft) text-(--accent-strong)">
								<FiLayers className="text-lg" />
							</span>
							<h2 className="text-2xl font-semibold text-foreground">
								Collection library
							</h2>
						</div>
						<p className="mt-2 text-sm text-(--muted)">
							Explore shared collections from the community.
						</p>
					</div>
					<div className="w-full sm:max-w-md">
						<SearchInput initialQuery={query} />
					</div>
				</div>
				<FolderList
					folders={folders}
					query={query}
				/>
			</div>
		</section>
	)
}
