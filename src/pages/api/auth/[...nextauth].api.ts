import { envs } from '@/src/configs/envs'
import NextAuth, { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: envs.googleOAuth.clientId,
      clientSecret: envs.googleOAuth.clientSecret,
      authorization: {
        params: {
          scope:
            'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
        },
      },
    }),
  ],
  callbacks: {
    signIn: async ({ account }) => {
      const hasCalendarScope = account?.scope?.includes(
        'https://www.googleapis.com/auth/calendar',
      )
      if (!hasCalendarScope) {
        return '/register/connect-calendar?error=permissions'
      }
      return true
    },
  },
}

export default NextAuth(authOptions)
