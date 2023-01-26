import { prisma } from '@/src/lib/prisma'
import dayjs from 'dayjs'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') return res.status(405).end()
  const username = String(req.query.username)
  const { date } = req.query
  if (!date) return res.status(400).json({ message: 'date not provided' })
  const user = await prisma.user.findUnique({
    where: {
      username,
    },
  })
  if (!user) return res.status(400).json({ message: 'user does not exist' })
  const referenceDate = dayjs(String(date))
  const isPastDate = referenceDate.endOf('day').isBefore(new Date())
  if (isPastDate) return res.json({ possibleTimes: [], availability: [] })
  const userAvailability = await prisma.userTimeInterval.findFirst({
    where: {
      userId: user.id,
      weekDay: referenceDate.get('day'),
    },
  })
  if (!userAvailability)
    return res.json({ possibleTimes: [], availability: [] })
  const { timeStartInMinutes, timeEndInMinutes } = userAvailability
  const startHour = timeStartInMinutes / 60
  const endHour = timeEndInMinutes / 60
  const possibleTimes = Array.from({ length: endHour - startHour }).map(
    (_, index) => {
      return startHour + index
    },
  )
  const blockedTimes = await prisma.scheduling.findMany({
    select: {
      date: true,
    },
    where: {
      userId: user.id,
      date: {
        gte: referenceDate.set('hour', startHour).toDate(),
        lte: referenceDate.set('hour', endHour).toDate(),
      },
    },
  })
  const availableTimes = possibleTimes.filter((time) => {
    const isTimeBlocked = !blockedTimes.some(
      (blockedTime) => blockedTime.date.getHours() === time,
    )
    const isTimeInPassed = referenceDate.set('hour', time).isBefore(new Date())
    return !isTimeBlocked && !isTimeInPassed
  })
  return res.json({ possibleTimes, availableTimes })
}
