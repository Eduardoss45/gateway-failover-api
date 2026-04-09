import User from '#models/user'

export async function createUser(role: 'ADMIN' | 'MANAGER' | 'FINANCE' | 'USER', email?: string) {
  const safeEmail = email ?? `${role.toLowerCase()}_${Date.now()}@example.com`
  return User.create({
    email: safeEmail,
    password: '123456',
    role,
  })
}

export async function loginAs(client: any, role: 'ADMIN' | 'MANAGER' | 'FINANCE' | 'USER') {
  const user = await createUser(role)

  const response = await client.post('/login').json({
    email: user.email,
    password: '123456',
  })

  return response.body().token as string
}
