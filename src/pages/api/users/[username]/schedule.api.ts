import { prisma } from '@/src/lib/prisma'
import * as z from 'zod'
import { NextApiRequest, NextApiResponse } from 'next'
import dayjs from 'dayjs'
import { google } from 'googleapis'
import { getGoogleOAuthToken } from '@/src/lib/google'

const createSchedulingBody = z.object({
  name: z.string(),
  email: z.string().email(),
  observations: z.string(),
  date: z.string().datetime(),
})

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') return res.status(405).end()
  const username = String(req.query.username)

  const user = await prisma.user.findUnique({
    where: {
      username,
    },
  })
  if (!user) return res.status(400).json({ message: 'user does not exist' })
  const { name, email, observations, date } = createSchedulingBody.parse(
    req.body,
  )
  const schedulingDate = dayjs(date).startOf('hour')
  if (schedulingDate.isBefore(new Date())) {
    return res.status(400).json({ message: 'date is in the past' })
  }
  const conflictingScheduling = await prisma.scheduling.findFirst({
    where: {
      userId: user.id,
      date: schedulingDate.toDate(),
    },
  })
  if (conflictingScheduling) {
    return res
      .status(400)
      .json({ message: 'there is another scheduling at the same time' })
  }
  const scheduling = await prisma.scheduling.create({
    data: {
      date: schedulingDate.toDate(),
      name,
      email,
      observations,
      userId: user.id,
    },
  })
  const calendar = google.calendar({
    version: 'v3',
    auth: await getGoogleOAuthToken(user.id),
  })
  await calendar.events.insert({
    calendarId: 'primary',
    conferenceDataVersion: 1,
    requestBody: {
      summary: `Ignite Call: ${name}`,
      description: observations,
      start: {
        dateTime: schedulingDate.format(),
      },
      end: {
        dateTime: schedulingDate.add(1, 'hour').format(),
      },
      attendees: [{ email, displayName: name }],
      conferenceData: {
        createRequest: {
          requestId: scheduling.id,
          conferenceSolutionKey: {
            type: 'hangoutsMeet',
          },
        },
      },
    },
  })
  return res.status(201).end()
}
