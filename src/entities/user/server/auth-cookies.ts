import 'server-only'
import { NextResponse } from 'next/server'
import {
  ACCESS_TOKEN_TTL_MS,
  REFRESH_TOKEN_TTL_MS,
  type SessionTokens,
} from '@/src/entities/user/server/session'

const buildCookieOptions = () => ({
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
})

export const ACCESS_COOKIE_NAME = 'access_token'
export const REFRESH_COOKIE_NAME = 'refresh_token'

export const setAuthCookies = (
  response: NextResponse,
  tokens: SessionTokens
) => {
  response.cookies.set(ACCESS_COOKIE_NAME, tokens.accessToken, {
    ...buildCookieOptions(),
    maxAge: Math.floor(ACCESS_TOKEN_TTL_MS / 1000),
    path: '/',
  })

  response.cookies.set(REFRESH_COOKIE_NAME, tokens.refreshToken, {
    ...buildCookieOptions(),
    maxAge: Math.floor(REFRESH_TOKEN_TTL_MS / 1000),
    path: '/api/auth',
  })
}

export const clearAuthCookies = (response: NextResponse) => {
  response.cookies.set(ACCESS_COOKIE_NAME, '', {
    ...buildCookieOptions(),
    maxAge: 0,
    path: '/',
  })

  response.cookies.set(REFRESH_COOKIE_NAME, '', {
    ...buildCookieOptions(),
    maxAge: 0,
    path: '/api/auth',
  })
}
