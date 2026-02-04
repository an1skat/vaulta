import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

const AUTH_PREFIX = '/auth'

function handler(request: NextRequest) {
	const { pathname } = request.nextUrl
	const access = request.cookies.get('access_token')?.value

	const isAuthRoute = pathname.startsWith(AUTH_PREFIX)

	if (access && isAuthRoute) {
		return NextResponse.redirect(new URL('/', request.url))
	}

	if (!access && !isAuthRoute) {
		const url = new URL('/auth/login', request.url)
		url.searchParams.set('next', pathname)
		return NextResponse.redirect(url)
	}

	return NextResponse.next()
}

export const proxy = handler
export const middleware = handler

export const config = {
	matcher: [
		'/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)'
	]
}
