import Product from '#models/product'
import type { HttpContext } from '@adonisjs/core/http'
import { createProductValidator, updateProductValidator } from '#validators/product_validator'

export default class ProductsController {
  async store({ request }: HttpContext) {
    const data = await request.validateUsing(createProductValidator)
    return Product.create(data)
  }

  async index() {
    return Product.all()
  }

  async show({ params, response }: HttpContext) {
    const product = await Product.find(params.id)
    if (!product) return response.notFound({ message: 'Product not found' })
    return product
  }

  async update({ params, request, response }: HttpContext) {
    const product = await Product.find(params.id)
    if (!product) return response.notFound({ message: 'Product not found' })

    const data = await request.validateUsing(updateProductValidator)
    product.merge(data)
    await product.save()
    return product
  }

  async destroy({ params, response }: HttpContext) {
    const product = await Product.find(params.id)
    if (!product) return response.notFound({ message: 'Product not found' })

    await product.delete()
    return response.noContent()
  }
}
