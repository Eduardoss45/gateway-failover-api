import vine from '@vinejs/vine'

export const createProductValidator = vine.create(
  vine.object({
    name: vine.string().trim().minLength(2),
    amount: vine.number().positive(),
  })
)

export const updateProductValidator = vine.create(
  vine.object({
    name: vine.string().trim().minLength(2).optional(),
    amount: vine.number().positive().optional(),
  })
)
