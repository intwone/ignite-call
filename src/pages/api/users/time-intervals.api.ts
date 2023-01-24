import { NextApiRequest, NextApiResponse } from 'next'
import { unstable_getServerSession as unstableGetServerSession } from 'next-auth'
import { buildNextAuthOptions } from '../auth/[...nextauth].api'
import * as z from 'zod'
import { prisma } from '@/src/lib/prisma'

const timeIntervalsBodySchema = z.object({
  intervals: z.array(
    z.object({
      weekDay: z.number(),
      startTimeInMinutes: z.number(),
      endTimeInMinutes: z.number(),
    }),
  ),
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') return res.status(405).end()
  const session = await unstableGetServerSession(
    req,
    res,
    buildNextAuthOptions(req, res),
  )
  if (!session) return res.status(401).end()
  const { intervals } = timeIntervalsBodySchema.parse(req.body)
  // with MySQL and PostgreSQL, use createMany
  await Promise.all(
    intervals.map((interval) => {
      return prisma.userTimeInterval.create({
        data: {
          weekDay: interval.weekDay,
          timeStartInMinutes: interval.startTimeInMinutes,
          timeEndInMinutes: interval.endTimeInMinutes,
          userId: session.user.id,
        },
      })
    }),
  )
  return res.status(201).end()
}
