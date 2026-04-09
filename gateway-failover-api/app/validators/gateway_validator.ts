import vine from '@vinejs/vine'

export const updateGatewayStatusValidator = vine.create(
  vine.object({
    is_active: vine.boolean(),
  })
)

export const updateGatewayPriorityValidator = vine.create(
  vine.object({
    priority: vine.number().min(1),
  })
)
