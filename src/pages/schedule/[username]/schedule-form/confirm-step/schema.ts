import * as z from 'zod'

export const schema = z.object({
  name: z
    .string()
    .min(3, { message: 'O nome precisa ter no mínimo 3 caracteres' }),
  email: z.string().email({ message: 'Informe um e-mail válido' }),
  observations: z.string().nullable(),
})

export type ConfirmStepFormData = z.input<typeof schema>
