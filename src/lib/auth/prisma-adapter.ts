import { NextApiRequest, NextApiResponse, NextPageContext } from 'next'
import { Adapter } from 'next-auth/adapters'
import { parseCookies, destroyCookie } from 'nookies'
import { prisma } from '../prisma'

export function PrismaAdapter(
  req: NextApiRequest | NextPageContext['req'],
  res: NextApiResponse | NextPageContext['res'],
): Adapter {
  return {
    async createUser(user) {
      const { '@ignitecall:userId': userIdOnCookies } = parseCookies({ req })
      if (!userIdOnCookies) throw new Error('User ID not found on cookies')
      const updatedUser = await prisma.user.update({
        where: {
          id: userIdOnCookies,
        },
        data: {
          name: user.name,
          email: user.email,
          avatarUrl: user.avatarUrl,
        },
      })
      destroyCookie({ res }, '@ignitecall:userId', { path: '/' })
      return {
        id: updatedUser.id,
        name: updatedUser.name,
        username: updatedUser.username,
        emailVerified: null,
        email: updatedUser.email!,
        avatarUrl: updatedUser.avatarUrl!,
      }
    },

    async getUser(id) {
      const user = await prisma.user.findUnique({
        where: {
          id,
        },
      })
      if (!user) return null
      return {
        id: user.id,
        name: user.name,
        username: user.username,
        emailVerified: null,
        email: user.email!,
        avatarUrl: user.avatarUrl!,
      }
    },

    async getUserByEmail(email) {
      const user = await prisma.user.findUnique({
        where: {
          email,
        },
      })
      if (!user) return null
      return {
        id: user.id,
        name: user.name,
        username: user.username,
        emailVerified: null,
        email: user.email!,
        avatarUrl: user.avatarUrl!,
      }
    },

    async getUserByAccount({ providerAccountId, provider }) {
      const account = await prisma.account.findUnique({
        where: {
          provider_providerAccountId: {
            provider,
            providerAccountId,
          },
        },
        include: {
          user: true,
        },
      })
      if (!account) return null
      const { user } = account
      return {
        id: user.id,
        name: user.name,
        username: user.username,
        emailVerified: null,
        email: user.email!,
        avatarUrl: user.avatarUrl!,
      }
    },

    async updateUser(user) {
      const updatedUser = await prisma.user.update({
        where: {
          id: user.id!,
        },
        data: {
          name: user.name,
          email: user.email,
          avatarUrl: user.avatarUrl,
        },
      })
      return {
        id: updatedUser.id,
        name: updatedUser.name,
        username: updatedUser.username,
        emailVerified: null,
        email: updatedUser.email!,
        avatarUrl: updatedUser.avatarUrl!,
      }
    },

    async linkAccount(account) {
      await prisma.account.create({
        data: {
          userId: account.userId,
          type: account.type,
          provider: account.provider,
          providerAccountId: account.providerAccountId,
          refreshToken: account.refresh_token,
          accessToken: account.access_token,
          expiresAt: account.expires_at,
          tokenType: account.token_type,
          scope: account.scope,
          idToken: account.id_token,
          sessionState: account.session_state,
        },
      })
    },

    async createSession({ sessionToken, userId, expires }) {
      await prisma.session.create({
        data: {
          userId,
          expires,
          sessionToken,
        },
      })
      return {
        userId,
        expires,
        sessionToken,
      }
    },

    async getSessionAndUser(sessionToken) {
      const prismaSession = await prisma.session.findUnique({
        where: {
          sessionToken,
        },
        include: {
          user: true,
        },
      })
      if (!prismaSession) return null
      const { user, ...session } = prismaSession
      return {
        session: {
          userId: session.userId,
          expires: session.expires,
          sessionToken: session.sessionToken,
        },
        user: {
          id: user.id,
          name: user.name,
          username: user.username,
          emailVerified: null,
          email: user.email!,
          avatarUrl: user.avatarUrl!,
        },
      }
    },

    async updateSession({ sessionToken, userId, expires }) {
      const updatedSession = await prisma.session.update({
        where: {
          sessionToken,
        },
        data: {
          userId,
          expires,
        },
      })
      return {
        userId: updatedSession.userId,
        sessionToken: updatedSession.sessionToken,
        expires: updatedSession.expires,
      }
    },

    async deleteSession(sessionToken) {
      await prisma.session.delete({
        where: {
          sessionToken,
        },
      })
    },
  }
}
