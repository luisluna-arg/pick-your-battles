import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { upsertUser } from "./lib/db/mutations"

export const { auth, signIn, signOut, handlers } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized: async ({ auth }) => {
      // Logged in users are authenticated, otherwise redirect to login page
      return !!auth
    },
    session: async ({ session, token }) => {
      // Forward the user ID from the JWT token (token.sub) to the session object.
      // NextAuth v5 does not automatically populate session.user.id without this callback.
      if (token.sub && session.user) {
        session.user.id = token.sub
      }
      return session
    },
    signIn: async ({ user }) => {
      // Sync user to database on login
      if (user.id && user.email) {
        try {
          await upsertUser({
            id: user.id,
            email: user.email,
            name: user.name || null,
            image: user.image || null,
          });
        } catch (error) {
          console.error('Error syncing user to database:', error);
          // Continue with sign-in even if database sync fails
        }
      }
      return true;
    },
  },
})
