'use client'

import {
	ChangeEvent,
	FormEvent,
	useEffect,
	useState,
	useTransition
} from 'react'
import { IoSearch } from 'react-icons/io5'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

type SearchInputProps = {
	initialQuery?: string
}

export default function SearchInput({ initialQuery = '' }: SearchInputProps) {
	const searchParams = useSearchParams()
	const pathname = usePathname()
	const router = useRouter()
	const [isPending, startTransition] = useTransition()
	const [query, setQuery] = useState(initialQuery)
	const urlQuery = searchParams.get('q')

	useEffect(() => {
		// Keep the input synced with the URL so server results stay in sync.
		setQuery(urlQuery ?? initialQuery)
	}, [urlQuery, initialQuery])

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		const { value } = e.target
		setQuery(value)
	}

	const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault()

		const params = new URLSearchParams(searchParams.toString())
		const next = query.trim()

		if (next) {
			params.set('q', next)
		} else {
			params.delete('q')
		}

		startTransition(() => {
			const search = params.toString()
			router.replace(search ? `${pathname}?${search}` : pathname)
		})
	}
	return (
		<form
			onSubmit={handleSubmit}
			className="flex w-full flex-col gap-3 sm:flex-row sm:items-center"
		>
			<label className="group flex w-full flex-1 items-center gap-3 rounded-full border border-(--border) bg-(--input-bg) px-4 py-3 text-sm text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] transition focus-within:border-(--accent) focus-within:shadow-[0_0_0_4px_var(--ring)]">
				<span className="sr-only">Search collections</span>
				<IoSearch className="text-lg text-(--muted)" />
				<input
					type="text"
					name="q"
					id="search"
					placeholder="Search collections"
					value={query}
					onChange={handleChange}
					className="w-full bg-transparent text-sm text-foreground placeholder:text-(--muted) focus:outline-none"
				/>
			</label>
			<button
				type="submit"
				disabled={isPending}
				className="inline-flex items-center justify-center gap-2 rounded-full bg-linear-to-br from-(--accent) to-(--accent-strong) px-5 py-3 text-sm font-semibold text-[#061c12] shadow-[0_16px_36px_-22px_rgba(16,158,86,0.85)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_44px_-26px_rgba(16,158,86,0.95)] focus-visible:outline-none focus-visible:shadow-[0_0_0_4px_var(--ring)] disabled:cursor-not-allowed disabled:opacity-70"
			>
				{isPending ? 'Searching...' : 'Search'}
			</button>
		</form>
	)
}
