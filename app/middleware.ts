export { auth as middleware } from "@/auth"

export const config = {
  // Protect /settings but allow root (/) to be public
  // Root page will handle its own conditional rendering
  matcher: ["/settings/:path*"],
}
