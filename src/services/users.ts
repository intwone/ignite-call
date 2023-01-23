import { api } from '../lib/axios'

interface CreateNewUserParams {
  name: string
  username: string
}

export async function createNewUser({ name, username }: CreateNewUserParams) {
  const response = await api.post('/users', {
    name,
    username,
  })
  return response
}
