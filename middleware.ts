import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

const AUTH_PREFIX = '/auth'
const SKIP_PREFIXES = ['/_next', '/api']
const SKIP_EXACT = ['/favicon.ico', '/robots.txt', '/sitemap.xml']

export function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl
	const access = request.cookies.get('access-token')?.value

	if (
		SKIP_EXACT.includes(pathname) ||
		SKIP_PREFIXES.some(p => pathname.startsWith(p))
	) {
		return NextResponse.next()
	}

	const isAuthRoute = pathname.startsWith(AUTH_PREFIX)

	if (access && isAuthRoute) {
		const url = request.nextUrl.clone()
		url.pathname = '/'
		return NextResponse.redirect(url)
	}

	if (!access && !isAuthRoute) {
		const url = request.nextUrl.clone()
		url.pathname = '/auth/login'
		url.searchParams.set('next', pathname)
		return NextResponse.redirect(url)
	}

	return NextResponse.next()
}

export const config = {
	matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
}
