export function extFromType(type: string) {
	if (type === 'image/png') return 'png'
	if (type === 'image/jpeg') return 'jpg'
	if (type === 'image/webp') return 'webp'
	if (type === 'image/gif') return 'gif'
	return 'bin'
}