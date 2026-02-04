import { getAllUserFolders } from '@/src/entities/folder/server/repo'
import { FolderList } from '@/src/entities/folder/ui/FolderList'
import { getSession } from '@/src/shared/lib/getSession'
import ProfileSection from '@/src/widgets/profile-section'

export default async function ProfilePage({
	params
}: {
	params: Promise<{ id: string }>
}) {
	const session = await getSession()
	const viewerId = session?.userId || null

	const folders = await getAllUserFolders(viewerId)

	return (
		<main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
			<ProfileSection params={params} />
			<FolderList
				folders={folders}
				profile
			/>
		</main>
	)
}
