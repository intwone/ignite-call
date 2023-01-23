import * as z from 'zod'

export const schema = z.object({
  username: z
    .string()
    .min(3, { message: 'O usuário deve ter pelo menos 3 letras' })
    .regex(/^([a-z\\-]+)$/i, {
      message: 'O usuário deve ter apenas letras e hifens',
    })
    .transform((username) => username.toLowerCase()),
  name: z.string().min(3, { message: 'O nome deve ter pelo menos 3 letras' }),
})

export type RegisterFormData = z.infer<typeof schema>
