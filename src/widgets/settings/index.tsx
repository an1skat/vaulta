'use client'

import {
	DESCRIPTION_MAX_LENGTH,
	isValidDescription
} from '@/src/entities/user/lib/validation'
import { useAuth } from '@/src/entities/user/model/auth'
import {
	applyTheme,
	resolveTheme,
	THEME_STORAGE_KEY,
	type ThemeMode
} from '@/src/shared/lib/theme'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
	ChangeEvent,
	FormEvent,
	useEffect,
	useMemo,
	useState
} from 'react'
import { FiArrowLeft } from 'react-icons/fi'

type SettingsSectionProps = {
	user: {
		id: string
		name: string
		username: string
		email: string
		description?: string | null
		avatarKey?: string | null
	}
}

export default function SettingsSection({ user }: SettingsSectionProps) {
	const { deleteProfile, logout, updateProfile } = useAuth()
	const router = useRouter()
	const [theme, setTheme] = useState<ThemeMode>('light')
	const [deleteConfirm, setDeleteConfirm] = useState('')
	const [deleteError, setDeleteError] = useState<string | null>(null)
	const [isDeleting, setIsDeleting] = useState(false)
	const baseDescription = useMemo(() => user.description ?? '', [user.description])
	const [description, setDescription] = useState(baseDescription)
	const [savedDescription, setSavedDescription] = useState(baseDescription)
	const [descriptionError, setDescriptionError] = useState<string | null>(null)
	const [isSavingDescription, setIsSavingDescription] = useState(false)

	useEffect(() => {
		const initialTheme = resolveTheme()
		setTheme(initialTheme)
		applyTheme(initialTheme)
	}, [])

	const handleThemeChange = (next: ThemeMode) => {
		setTheme(next)
		applyTheme(next)
		localStorage.setItem(THEME_STORAGE_KEY, next)
	}

	const handleDescriptionChange = (
		event: ChangeEvent<HTMLTextAreaElement>
	) => {
		setDescription(event.target.value)
		setDescriptionError(null)
	}

	const handleDescriptionSave = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		setDescriptionError(null)

		const trimmed = description.trim()
		const baseTrimmed = savedDescription.trim()

		if (trimmed === baseTrimmed) {
			setDescriptionError('No changes to save.')
			return
		}

		if (!isValidDescription(description)) {
			setDescriptionError(
				`Description must be ${DESCRIPTION_MAX_LENGTH} characters or less.`
			)
			return
		}

		setIsSavingDescription(true)
		try {
			await updateProfile({ description: trimmed })
			setSavedDescription(trimmed)
			setDescription(trimmed)
		} catch (err) {
			setDescriptionError((err as Error).message)
		} finally {
			setIsSavingDescription(false)
		}
	}

	const handleDeleteInput = (event: ChangeEvent<HTMLInputElement>) => {
		setDeleteConfirm(event.target.value)
		setDeleteError(null)
	}

	const handleDelete = async () => {
		if (deleteConfirm.trim().toUpperCase() !== 'DELETE') {
			setDeleteError('Type DELETE to confirm.')
			return
		}
		if (!user?.id) {
			setDeleteError('Unable to locate your account.')
			return
		}
		setIsDeleting(true)
		setDeleteError(null)
		try {
			await deleteProfile(user.id)
			await logout()
			router.push('/')
		} catch (err) {
			setDeleteError((err as Error).message)
		} finally {
			setIsDeleting(false)
		}
	}

	return (
		<main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
			<header className="flex flex-col gap-3">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div>
						<p className="text-xs font-semibold uppercase tracking-[0.35em] text-(--muted)">
							Settings
						</p>
						<h1 className="text-3xl font-semibold text-foreground">
							Account settings
						</h1>
					</div>
					<Link
						href={`/u/${user.id}`}
						className="inline-flex items-center gap-2 rounded-full border border-(--border) bg-(--surface) px-3 py-1.5 text-xs font-semibold text-(--muted-strong) shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] transition duration-200 hover:-translate-y-0.5 hover:border-(--accent) hover:text-(--accent-strong) focus-visible:outline-none focus-visible:shadow-[0_0_0_4px_var(--ring)]"
					>
						<FiArrowLeft className="text-sm" />
						Back to profile
					</Link>
				</div>
				<p className="max-w-2xl text-sm text-(--muted)">
					Manage how your profile looks, adjust appearance, and control account
					actions.
				</p>
			</header>

			<section className="relative overflow-hidden rounded-3xl border border-(--glass-border) bg-(--glass) p-6 shadow-(--shadow) backdrop-blur-[18px] backdrop-saturate-150 sm:p-8">
				<div className="pointer-events-none absolute inset-0 bg-[linear-gradient(140deg,rgba(255,255,255,0.4),rgba(255,255,255,0.08)_45%,transparent_75%)] opacity-70" />
				<div className="relative z-10 grid gap-6">
					<div>
						<h2 className="text-xl font-semibold text-foreground">Account</h2>
						<p className="mt-2 text-sm text-(--muted)">
							Review your identity details.
						</p>
					</div>
					<div className="grid gap-4 sm:grid-cols-2">
						<div className="rounded-2xl border border-(--border) bg-(--surface) px-4 py-3 text-sm">
							<p className="text-xs font-semibold uppercase tracking-[0.3em] text-(--muted)">
								Name
							</p>
							<p className="mt-2 text-base font-semibold text-foreground">
								{user.name}
							</p>
						</div>
						<div className="rounded-2xl border border-(--border) bg-(--surface) px-4 py-3 text-sm">
							<p className="text-xs font-semibold uppercase tracking-[0.3em] text-(--muted)">
								Username
							</p>
							<p className="mt-2 text-base font-semibold text-foreground">
								@{user.username}
							</p>
						</div>
						<div className="rounded-2xl border border-(--border) bg-(--surface) px-4 py-3 text-sm sm:col-span-2">
							<p className="text-xs font-semibold uppercase tracking-[0.3em] text-(--muted)">
								Email
							</p>
							<p className="mt-2 text-base font-semibold text-foreground">
								{user.email}
							</p>
						</div>
					</div>
				</div>
			</section>

			<section className="relative overflow-hidden rounded-3xl border border-(--glass-border) bg-(--glass) p-6 shadow-(--shadow) backdrop-blur-[18px] backdrop-saturate-150 sm:p-8">
				<div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.45),rgba(255,255,255,0.08)_50%,transparent_80%)] opacity-70" />
				<div className="relative z-10 grid gap-6">
					<div>
						<h2 className="text-xl font-semibold text-foreground">
							Profile description
						</h2>
						<p className="mt-2 text-sm text-(--muted)">
							Write a short bio that appears on your profile.
						</p>
					</div>
					<form
						onSubmit={handleDescriptionSave}
						className="grid gap-4"
					>
						<label className="grid gap-2 text-sm font-semibold text-(--muted-strong)">
							<span>Description</span>
							<textarea
								value={description}
								onChange={handleDescriptionChange}
								maxLength={DESCRIPTION_MAX_LENGTH}
								rows={4}
								placeholder="Tell people a little about you."
								className="w-full resize-none rounded-2xl border border-(--border) bg-(--input-bg) px-4 py-3 text-base text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] transition duration-200 placeholder:text-(--muted) focus:border-(--accent) focus:shadow-[0_0_0_4px_var(--ring)] focus:outline-none"
							/>
						</label>
						<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
							<p className="text-xs text-(--muted)">
								{description.length}/{DESCRIPTION_MAX_LENGTH} characters
							</p>
							<button
								type="submit"
								disabled={isSavingDescription}
								className="inline-flex w-fit items-center gap-2 rounded-full border border-(--border) bg-(--surface) px-5 py-2.5 text-sm font-semibold text-(--muted-strong) shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] transition duration-200 hover:-translate-y-0.5 hover:border-(--accent) hover:text-(--accent-strong) disabled:cursor-not-allowed disabled:opacity-70"
							>
								Save description
							</button>
						</div>
						{descriptionError && (
							<div className="rounded-2xl border border-(--border) bg-(--surface) px-4 py-3 text-sm text-(--error)">
								{descriptionError}
							</div>
						)}
					</form>
				</div>
			</section>

			<section className="relative overflow-hidden rounded-3xl border border-(--glass-border) bg-(--glass) p-6 shadow-(--shadow) backdrop-blur-[18px] backdrop-saturate-150 sm:p-8">
				<div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.45),rgba(255,255,255,0.08)_50%,transparent_80%)] opacity-70" />
				<div className="relative z-10 grid gap-6">
					<div>
						<h2 className="text-xl font-semibold text-foreground">Appearance</h2>
						<p className="mt-2 text-sm text-(--muted)">
							Switch between light and dark themes.
						</p>
					</div>
					<div className="flex flex-wrap items-center gap-3">
						<button
							type="button"
							onClick={() => handleThemeChange('light')}
							className={`rounded-full border px-4 py-2 text-sm font-semibold transition duration-200 ${
								theme === 'light'
									? 'border-(--accent) text-(--accent-strong)'
									: 'border-(--border) text-(--muted-strong) hover:-translate-y-0.5'
							}`}
						>
							Light
						</button>
						<button
							type="button"
							onClick={() => handleThemeChange('dark')}
							className={`rounded-full border px-4 py-2 text-sm font-semibold transition duration-200 ${
								theme === 'dark'
									? 'border-(--accent) text-(--accent-strong)'
									: 'border-(--border) text-(--muted-strong) hover:-translate-y-0.5'
							}`}
						>
							Dark
						</button>
					</div>
				</div>
			</section>

			<section className="relative overflow-hidden rounded-3xl border border-(--glass-border) bg-(--glass) p-6 shadow-(--shadow) backdrop-blur-[18px] backdrop-saturate-150 sm:p-8">
				<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(380px_circle_at_80%_40%,rgba(226,77,77,0.18),transparent_70%)] opacity-80" />
				<div className="relative z-10 grid gap-6">
					<div>
						<h2 className="text-xl font-semibold text-foreground">Danger zone</h2>
						<p className="mt-2 text-sm text-(--muted)">
							Delete your profile and all associated data. This cannot be
							undone.
						</p>
					</div>

					<div className="grid gap-4">
						<label className="grid gap-2 text-sm font-semibold text-(--muted-strong)">
							<span>Type DELETE to confirm</span>
							<input
								type="text"
								value={deleteConfirm}
								onChange={handleDeleteInput}
								placeholder="DELETE"
								className="w-full rounded-2xl border border-(--border) bg-(--input-bg) px-4 py-3 text-base text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] transition duration-200 placeholder:text-(--muted) focus:border-(--accent) focus:shadow-[0_0_0_4px_var(--ring)] focus:outline-none"
							/>
						</label>
						{deleteError && (
							<div className="rounded-2xl border border-(--border) bg-(--surface) px-4 py-3 text-sm text-(--error)">
								{deleteError}
							</div>
						)}
						<button
							type="button"
							onClick={handleDelete}
							disabled={isDeleting}
							className="inline-flex w-fit items-center gap-2 rounded-full border border-transparent bg-(--error) px-5 py-2.5 text-sm font-semibold text-white shadow-[0_18px_40px_-28px_rgba(226,77,77,0.6)] transition duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
						>
							Delete profile
						</button>
					</div>
				</div>
			</section>
		</main>
	)
}
