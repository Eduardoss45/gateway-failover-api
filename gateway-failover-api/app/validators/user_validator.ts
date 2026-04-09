import vine, { SimpleMessagesProvider } from '@vinejs/vine'

const ROLES = ['ADMIN', 'MANAGER', 'FINANCE', 'USER'] as const

vine.messagesProvider = new SimpleMessagesProvider({
  enum: `Invalid role. Allowed values: ${ROLES.join(', ')}`,
})

export const createUserValidator = vine.create(
  vine.object({
    email: vine
      .string()
      .email()
      .unique(async (db, value) => {
        const user = await db.from('users').where('email', value).first()
        return !user
      }),
    password: vine.string().minLength(6),
    role: vine.enum(ROLES),
  })
)

export const updateUserValidator = vine.compile(
  vine.object({
    email: vine
      .string()
      .trim()
      .email()
      .unique(async (db, value, field) => {
        if (value === undefined) return true

        const query = db.from('users').where('email', value)

        const userId = field.meta?.userId as number | undefined
        if (userId) {
          query.whereNot('id', userId)
        }

        const exists = await query.first()
        return !exists
      })
      .optional(),

    password: vine.string().trim().minLength(6).optional(),

    role: vine.enum(ROLES).optional(),
  })
)
