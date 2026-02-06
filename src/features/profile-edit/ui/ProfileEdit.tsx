'use client'

import { Portal } from '@/src/shared/ui/Portal'
import { useEffect, useState } from 'react'
import { FiEdit2, FiEye, FiEyeOff, FiUser, FiX } from 'react-icons/fi'
import type { ProfileEditInitialUser } from '../model/useProfileEdit'
import { useProfileEdit } from '../model/useProfileEdit'

type ProfileEditProps = {
	initialUser: ProfileEditInitialUser
}

export default function ProfileEdit({ initialUser }: ProfileEditProps) {
	const [showCurrentPassword, setShowCurrentPassword] = useState(false)
	const [showNewPassword, setShowNewPassword] = useState(false)
	const [showConfirmPassword, setShowConfirmPassword] = useState(false)
	const {
		open,
		openModal,
		closeModal,
		handleOverlayClick,
		stopPropagation,

		form,
		handleChange,

		avatarFile,
		displayAvatar,
		handleAvatarChange,
		clearAvatar,

		error,
		isSubmitting,

		strengthPercent,
		strengthLabel,
		strengthColor,

		submit
	} = useProfileEdit(initialUser)

	useEffect(() => {
		if (open) return
		setShowCurrentPassword(false)
		setShowNewPassword(false)
		setShowConfirmPassword(false)
	}, [open])

	return (
		<>
			<button
				type="button"
				onClick={openModal}
				className="inline-flex items-center gap-2 rounded-full bg-linear-to-br from-(--accent) to-(--accent-strong) px-4 py-2 text-sm font-semibold text-[#061c12] shadow-[0_18px_40px_-22px_rgba(16,158,86,0.85)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_24px_50px_-26px_rgba(16,158,86,0.95)] focus-visible:outline-none focus-visible:shadow-[0_0_0_4px_var(--ring)]"
			>
				<FiEdit2 className="text-base" />
				Edit profile
			</button>

			{open && (
				<Portal>
					<div
						className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8"
						role="dialog"
						aria-modal="true"
						aria-labelledby="edit-profile-title"
						onClick={handleOverlayClick}
					>
						<div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
						<div
							className="relative z-10 w-full max-w-3xl overflow-hidden rounded-3xl border border-(--glass-border) bg-(--glass) shadow-(--shadow) backdrop-blur-[18px] backdrop-saturate-150"
							onClick={stopPropagation}
						>
							<div className="pointer-events-none absolute inset-0 bg-[linear-gradient(140deg,rgba(255,255,255,0.4),rgba(255,255,255,0.08)_45%,transparent_75%)] opacity-70" />
							<div className="relative z-10 flex flex-col gap-6 p-6 sm:p-8">
								<div className="flex items-start justify-between gap-4">
									<div>
										<p className="text-xs font-semibold uppercase tracking-[0.35em] text-(--muted)">
											Profile settings
										</p>
										<h2
											id="edit-profile-title"
											className="mt-2 text-2xl font-semibold text-foreground"
										>
											Edit profile
										</h2>
										<p className="mt-2 text-sm text-(--muted)">
											Keep your details up to date and secure.
										</p>
									</div>
									<button
										type="button"
										onClick={closeModal}
										className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-(--border) text-(--muted) transition hover:text-(--muted-strong) focus-visible:outline-none focus-visible:shadow-[0_0_0_4px_var(--ring)]"
										aria-label="Close edit profile"
									>
										<FiX />
									</button>
								</div>

								<form
									onSubmit={submit}
									className="grid gap-6 sm:grid-cols-2"
								>
									<label className="grid gap-2 text-sm font-semibold text-(--muted-strong) sm:col-span-2">
										<span>Avatar</span>
										<div className="flex flex-wrap items-center gap-4">
											<div className="relative h-14 w-14 overflow-hidden rounded-2xl border border-(--border) bg-(--input-bg) shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]">
												{displayAvatar ? (
													<img
														src={displayAvatar}
														alt="Avatar preview"
														className="h-full w-full object-cover"
													/>
												) : (
													<div className="flex h-full w-full items-center justify-center text-(--muted)">
														<FiUser />
													</div>
												)}
											</div>
											<div className="flex flex-wrap items-center gap-2">
												<input
													id="profile-avatar"
													name="avatar"
													type="file"
													accept="image/*"
													onChange={handleAvatarChange}
													className="hidden"
												/>
												<label
													htmlFor="profile-avatar"
													className="cursor-pointer rounded-full border border-(--border) bg-(--input-bg) px-4 py-2 text-sm font-semibold text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] transition duration-200 hover:-translate-y-0.5 focus:outline-none"
												>
													Choose file
												</label>
												<button
													type="button"
													onClick={clearAvatar}
													disabled={!avatarFile}
													className="rounded-full border border-(--border) bg-transparent px-4 py-2 text-sm font-semibold text-(--muted-strong) transition duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
												>
													Clear
												</button>
												<p className="text-xs text-(--muted)">
													PNG/JPG/WebP, up to 5MB
												</p>
											</div>
										</div>
									</label>

									<label className="grid gap-2 text-sm font-semibold text-(--muted-strong)">
										<span>Name</span>
										<input
											type="text"
											name="name"
											value={form.name}
											onChange={handleChange}
											autoComplete="name"
											className="w-full rounded-2xl border border-(--border) bg-(--input-bg) px-4 py-3 text-base text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] transition duration-200 placeholder:text-(--muted) focus:border-(--accent) focus:shadow-[0_0_0_4px_var(--ring)] focus:outline-none"
										/>
									</label>

									<label className="grid gap-2 text-sm font-semibold text-(--muted-strong)">
										<span>Username</span>
										<input
											type="text"
											name="username"
											value={form.username}
											onChange={handleChange}
											autoComplete="username"
											className="w-full rounded-2xl border border-(--border) bg-(--input-bg) px-4 py-3 text-base text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] transition duration-200 placeholder:text-(--muted) focus:border-(--accent) focus:shadow-[0_0_0_4px_var(--ring)] focus:outline-none"
										/>
									</label>

									<label className="grid gap-2 text-sm font-semibold text-(--muted-strong) sm:col-span-2">
										<span>Email</span>
										<input
											type="email"
											name="email"
											value={form.email}
											onChange={handleChange}
											autoComplete="email"
											className="w-full rounded-2xl border border-(--border) bg-(--input-bg) px-4 py-3 text-base text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] transition duration-200 placeholder:text-(--muted) focus:border-(--accent) focus:shadow-[0_0_0_4px_var(--ring)] focus:outline-none"
										/>
									</label>

									<label className="grid gap-2 text-sm font-semibold text-(--muted-strong) sm:col-span-2">
										<span>Current password</span>
										<div className="relative">
											<input
												type={showCurrentPassword ? 'text' : 'password'}
												name="currentPassword"
												value={form.currentPassword}
												onChange={handleChange}
												autoComplete="current-password"
												placeholder="Required for email or password changes"
												className="w-full rounded-2xl border border-(--border) bg-(--input-bg) px-4 py-3 pr-12 text-base text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] transition duration-200 placeholder:text-(--muted) focus:border-(--accent) focus:shadow-[0_0_0_4px_var(--ring)] focus:outline-none"
											/>
											<button
												type="button"
												onClick={() =>
													setShowCurrentPassword(prev => !prev)
												}
												aria-label={
													showCurrentPassword
														? 'Hide current password'
														: 'Show current password'
												}
												className="absolute right-3 top-1/2 -translate-y-1/2 text-(--muted) transition hover:text-(--muted-strong) focus-visible:outline-none focus-visible:shadow-[0_0_0_4px_var(--ring)]"
											>
												{showCurrentPassword ? <FiEyeOff /> : <FiEye />}
											</button>
										</div>
									</label>

									<label className="grid gap-2 text-sm font-semibold text-(--muted-strong)">
										<span>New password</span>
										<div className="relative">
											<input
												type={showNewPassword ? 'text' : 'password'}
												name="password"
												value={form.password}
												onChange={handleChange}
												autoComplete="new-password"
												className="w-full rounded-2xl border border-(--border) bg-(--input-bg) px-4 py-3 pr-12 text-base text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] transition duration-200 placeholder:text-(--muted) focus:border-(--accent) focus:shadow-[0_0_0_4px_var(--ring)] focus:outline-none"
											/>
											<button
												type="button"
												onClick={() => setShowNewPassword(prev => !prev)}
												aria-label={
													showNewPassword
														? 'Hide new password'
														: 'Show new password'
												}
												className="absolute right-3 top-1/2 -translate-y-1/2 text-(--muted) transition hover:text-(--muted-strong) focus-visible:outline-none focus-visible:shadow-[0_0_0_4px_var(--ring)]"
											>
												{showNewPassword ? <FiEyeOff /> : <FiEye />}
											</button>
										</div>
									</label>

									<label className="grid gap-2 text-sm font-semibold text-(--muted-strong)">
										<span>Confirm password</span>
										<div className="relative">
											<input
												type={showConfirmPassword ? 'text' : 'password'}
												name="confirmPassword"
												value={form.confirmPassword}
												onChange={handleChange}
												autoComplete="new-password"
												className="w-full rounded-2xl border border-(--border) bg-(--input-bg) px-4 py-3 pr-12 text-base text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] transition duration-200 placeholder:text-(--muted) focus:border-(--accent) focus:shadow-[0_0_0_4px_var(--ring)] focus:outline-none"
											/>
											<button
												type="button"
												onClick={() =>
													setShowConfirmPassword(prev => !prev)
												}
												aria-label={
													showConfirmPassword
														? 'Hide confirm password'
														: 'Show confirm password'
												}
												className="absolute right-3 top-1/2 -translate-y-1/2 text-(--muted) transition hover:text-(--muted-strong) focus-visible:outline-none focus-visible:shadow-[0_0_0_4px_var(--ring)]"
											>
												{showConfirmPassword ? <FiEyeOff /> : <FiEye />}
											</button>
										</div>
									</label>

									<div className="sm:col-span-2">
										<div className="mb-2 flex items-center justify-between text-xs font-semibold text-(--muted)">
											<span>Password strength</span>
											<span>{strengthLabel}</span>
										</div>
										<div className="h-2 w-full rounded-full bg-black/10">
											<div
												className={`h-2 rounded-full ${strengthColor}`}
												style={{ width: `${strengthPercent}%` }}
											/>
										</div>
									</div>

									{error && (
										<div className="sm:col-span-2 rounded-2xl border border-(--border) bg-(--surface) px-4 py-3 text-sm text-(--error)">
											{error}
										</div>
									)}

									<div className="flex flex-col items-start gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
										<p className="text-xs text-(--muted)">
											Changing email or password requires your current password.
										</p>
										<div className="flex flex-wrap items-center gap-2">
											<button
												type="button"
												onClick={closeModal}
												className="rounded-full border border-(--border) px-4 py-2 text-sm font-semibold text-(--muted-strong) transition duration-200 hover:-translate-y-0.5"
											>
												Cancel
											</button>
											<button
												type="submit"
												disabled={isSubmitting}
												className="inline-flex items-center gap-2 rounded-full bg-linear-to-br from-(--accent) to-(--accent-strong) px-5 py-2.5 text-sm font-semibold text-[#061c12] shadow-[0_18px_40px_-22px_rgba(16,158,86,0.85)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_24px_50px_-26px_rgba(16,158,86,0.95)] disabled:cursor-not-allowed disabled:opacity-70"
											>
												Save changes
											</button>
										</div>
									</div>
								</form>
							</div>
						</div>
					</div>
				</Portal>
			)}
		</>
	)
}
