import { prisma } from '@/src/lib/prisma'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') return res.status(405).end()
  const username = String(req.query.username)
  const { year, month } = req.query
  if (!month || !year)
    return res.status(400).json({ message: 'year or month not specified' })
  const user = await prisma.user.findUnique({
    where: {
      username,
    },
  })
  if (!user) return res.status(400).json({ message: 'user does not exist' })
  const availableWeekDays = await prisma.userTimeInterval.findMany({
    select: {
      weekDay: true,
    },
    where: {
      userId: user.id,
    },
  })
  const blockedWeekDays = [0, 1, 2, 3, 4, 5, 6].filter((weekDay) => {
    return !availableWeekDays.some(
      (availableWeekDay) => availableWeekDay.weekDay === weekDay,
    )
  })
  const blockedDatesRaw: Array<{ date: number }> = await prisma.$queryRaw`
    SELECT 
      EXTRACT(DAY FROM s.date) as date,
      COUNT(s.date) as amount,
      ((uti.time_end_in_minutes - uti.time_start_in_minutes) / 60) as size

    FROM schedulings as s

    LEFT JOIN user_time_intervals as uti
      ON uti.week_day = WEEKDAY(DATE_ADD(s.date, INTERVAL 1 DAY))

    WHERE s.user_id = ${user.id}
      AND DATE_FORMAT(s.date, "%Y-%m") = ${`${year}-${month}`}

    GROUP BY EXTRACT(DAY FROM s.date),
      ((uti.time_end_in_minutes - uti.time_start_in_minutes) / 60)

    HAVING amount >= size
  `

  const blockedDays = blockedDatesRaw.map((item) => item.date)

  return res.json({ blockedWeekDays, blockedDays })
}
