import { api } from '../lib/axios'

interface CreateNewUserParams {
  name: string
  username: string
}

interface CreateNewIntervalsParams {
  weekDay: number
  startTimeInMinutes: number
  endTimeInMinutes: number
}

export async function createNewUser({ name, username }: CreateNewUserParams) {
  const response = await api.post('/users', {
    name,
    username,
  })
  return response
}

export async function createNewIntervals(
  intervals: CreateNewIntervalsParams[],
) {
  const response = await api.post('/users/time-intervals', {
    intervals,
  })
  return response
}

export async function updateUserById(bio: string) {
  const response = await api.put('/users/profile', {
    bio,
  })
  return response
}

export async function getHoursAvailability(username: string, date: string) {
  const response = await api.get(`/users/${username}/availability`, {
    params: {
      date,
    },
  })
  return response
}
