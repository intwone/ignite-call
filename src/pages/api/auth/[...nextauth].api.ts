import { envs } from '@/src/configs/envs'
import { PrismaAdapter } from '@/src/lib/auth/prisma-adapter'
import { NextApiRequest, NextApiResponse, NextPageContext } from 'next'
import NextAuth, { NextAuthOptions } from 'next-auth'
import GoogleProvider, { GoogleProfile } from 'next-auth/providers/google'

export function buildNextAuthOptions(
  req: NextApiRequest | NextPageContext['req'],
  res: NextApiResponse | NextPageContext['res'],
): NextAuthOptions {
  return {
    adapter: PrismaAdapter(req, res),
    providers: [
      GoogleProvider({
        clientId: envs.googleOAuth.clientId,
        clientSecret: envs.googleOAuth.clientSecret,
        authorization: {
          params: {
            prompt: 'consent',
            access_type: 'offline',
            response_type: 'code',
            scope:
              'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
          },
        },
        profile: (profile: GoogleProfile) => {
          return {
            id: profile.sub,
            name: profile.name,
            username: '',
            email: profile.email,
            avatarUrl: profile.picture,
          }
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
      session: async ({ session, user }) => {
        return {
          ...session,
          user,
        }
      },
    },
  }
}

export default async function auth(req: NextApiRequest, res: NextApiResponse) {
  return await NextAuth(req, res, buildNextAuthOptions(req, res))
}
