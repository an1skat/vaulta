export const TITLE_MIN_LENGTH = 3
export const TITLE_MAX_LENGTH = 80
export const DETAILS_MAX_LENGTH = 300

export const isValidTitle = (title: string) => {
	return (
		title.trim().length >= TITLE_MIN_LENGTH &&
		title.trim().length <= TITLE_MAX_LENGTH
	)
}

export const isValidDetails = (details: string) => {
	return details.length <= DETAILS_MAX_LENGTH
}
