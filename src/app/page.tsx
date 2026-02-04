import { getSession } from '@/src/shared/lib/getSession'
import FoldersSection from '@/src/widgets/folders-section'
import Link from 'next/link'
import { FiPlus, FiUser } from 'react-icons/fi'

type HomeProps = {
	searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export default async function Home({ searchParams }: HomeProps) {
	const params = await searchParams
	const query = typeof params?.q === 'string' ? params.q : ''
	const session = await getSession()

	return (
		<main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
			<header className="flex items-center justify-between">
				{/* Brand name in the top-left corner. */}
				<Link
					href="/"
					className="text-2xl font-semibold tracking-[0.2em] text-foreground"
				>
					Vaulta
				</Link>
				{/* Profile shortcut in the top-right corner (current user). */}
				{session?.userId && (
					<Link
						href={`/u/${session.userId}`}
						aria-label="Open your profile"
						className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-(--glass-border) bg-(--surface) text-(--muted-strong) shadow-(--shadow-soft) transition duration-200 hover:-translate-y-0.5 hover:border-(--accent) hover:text-(--accent-strong) focus-visible:outline-none focus-visible:shadow-[0_0_0_4px_var(--ring)]"
					>
						<FiUser className="text-base" />
					</Link>
				)}
			</header>
			<FoldersSection query={query} />
			<section className="relative overflow-hidden rounded-3xl border border-(--glass-border) bg-(--glass) p-6 shadow-(--shadow) backdrop-blur-[18px] backdrop-saturate-150 sm:p-8">
				<div className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.45),rgba(255,255,255,0.08)_45%,transparent_80%)] opacity-70" />
				<div className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-1/2 bg-[radial-gradient(320px_circle_at_85%_40%,var(--accent-soft),transparent_70%)] opacity-80" />
				<div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
					<div className="max-w-xl">
						<p className="text-xs font-semibold uppercase tracking-[0.35em] text-(--muted)">
							Get started
						</p>
						<h3 className="mt-2 text-2xl font-semibold text-foreground">
							Create your first collection
						</h3>
						<p className="mt-2 text-sm text-(--muted)">
							Bring together notes, links, and ideas into a curated space you
							can share.
						</p>
					</div>
					<div className="flex flex-col items-start gap-3 sm:items-end">
						{/* CTA placeholder; update the href when the create flow is ready. */}
						<Link
							href="/auth/register"
							className="inline-flex items-center gap-2 rounded-full bg-linear-to-br from-(--accent) to-(--accent-strong) px-5 py-3 text-sm font-semibold text-[#061c12] shadow-[0_18px_40px_-22px_rgba(16,158,86,0.85)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_24px_50px_-26px_rgba(16,158,86,0.95)] focus-visible:outline-none focus-visible:shadow-[0_0_0_4px_var(--ring)]"
						>
							<FiPlus className="text-base" />
							Create collection
						</Link>
						<span className="text-xs font-semibold text-(--muted)">
							Free to start - takes less than a minute.
						</span>
					</div>
				</div>
			</section>
		</main>
	)
}
