import vine from '@vinejs/vine'

export const purchaseValidator = vine.create(
  vine.object({
    name: vine.string().trim().minLength(2),
    email: vine.string().email(),
    cardNumber: vine.string().regex(/^\d{16}$/),
    cvv: vine.string().regex(/^\d{3}$/),
    products: vine
      .array(
        vine.object({
          product_id: vine.number().positive(),
          quantity: vine.number().withoutDecimals().min(1),
        })
      )
      .minLength(1)
      .maxLength(50),
  })
)
