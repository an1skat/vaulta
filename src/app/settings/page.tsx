import { getUserById } from '@/src/entities/user/server/repo'
import { getSession } from '@/src/shared/lib/getSession'
import SettingsSection from '@/src/widgets/settings'
import { redirect } from 'next/navigation'

export default async function SettingsPage() {
	const session = await getSession()
	if (!session) redirect('/auth/login')

	const user = await getUserById(session.userId)
	if (!user) redirect('/auth/login')

	return <SettingsSection user={user} />
}
