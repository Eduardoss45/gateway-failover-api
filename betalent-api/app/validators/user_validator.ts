import vine from '@vinejs/vine'

export const createUserValidator = vine.create(
  vine.object({
    email: vine.string().email(),
    password: vine.string().minLength(6),
    role: vine.enum(['ADMIN', 'MANAGER', 'FINANCE', 'USER']),
  })
)

export const updateUserValidator = vine.create(
  vine.object({
    email: vine.string().email().optional(),
    password: vine.string().minLength(6).optional(),
    role: vine.enum(['ADMIN', 'MANAGER', 'FINANCE', 'USER']).optional(),
  })
)
