import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - /login (login page)
     * - /api/auth (auth API routes)
     * - /_next (Next.js internals)
     * - /favicon.ico, /manifest.json, etc (static files)
     */
    "/((?!login|api/auth|_next|favicon.ico|manifest.json|apple-touch-icon.png|icon-192x192.png|icon-512x512.png).*)",
  ],
}
