import * as z from 'zod'

export const schema = z.object({
  bio: z.string(),
})

export type UpdateProfileFormData = z.infer<typeof schema>
