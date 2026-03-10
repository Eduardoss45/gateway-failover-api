import vine from '@vinejs/vine'

export const purchaseValidator = vine.create(
  vine.object({
    name: vine.string().trim(),
    email: vine.string().email(),
    cardNumber: vine.string().fixedLength(16),
    cvv: vine.string().fixedLength(3),

    products: vine.array(
      vine.object({
        product_id: vine.number(),
        quantity: vine.number().min(1),
      })
    ),
  })
)
