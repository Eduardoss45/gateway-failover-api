import fs from 'node:fs/promises'

const BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:3333'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'admin@admin.com'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? '123456'
const GW1_ID = Number(process.env.GW1_ID ?? '1')
const GW2_ID = Number(process.env.GW2_ID ?? '2')

const results = []
const SUMMARY_ONLY = process.env.SUMMARY_ONLY !== 'false'

function summarizeBody(body) {
  if (body == null) return null
  if (Array.isArray(body)) {
    return {
      type: 'array',
      count: body.length,
      firstId: body[0]?.id ?? null,
    }
  }
  if (typeof body === 'object') {
    return {
      type: 'object',
      keys: Object.keys(body).slice(0, 10),
    }
  }
  return body
}

function record(name, response) {
  results.push({
    name,
    status: response?.status ?? null,
    ok: response?.status != null && response.status < 400,
    body: SUMMARY_ONLY ? summarizeBody(response?.body) : response?.body ?? null,
    error: response?.error ?? null,
  })
}

async function request(method, path, { token, body } = {}) {
  const headers = {
    'Content-Type': 'application/json',
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })
    const text = await res.text()
    let parsed = null
    try {
      parsed = text ? JSON.parse(text) : null
    } catch {
      parsed = text
    }
    return { status: res.status, body: parsed }
  } catch (error) {
    return { status: null, body: null, error: String(error) }
  }
}

async function run() {
  // Health
  record('GET /health', await request('GET', '/health'))

  // Login
  const login = await request('POST', '/login', {
    body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
  })
  record('POST /login', login)

  const token = login?.body?.token
  const roleTokens = {}

  // Gateways (ADMIN)
  if (token) {
    record(
      'PATCH /gateways/:id/status',
      await request('PATCH', `/gateways/${GW1_ID}/status`, {
        token,
        body: { is_active: true },
      })
    )
    record(
      'PATCH /gateways/:id/priority',
      await request('PATCH', `/gateways/${GW2_ID}/priority`, {
        token,
        body: { priority: 2 },
      })
    )
  } else {
    record('PATCH /gateways/:id/status (skipped: no token)', { status: null, body: null })
    record('PATCH /gateways/:id/priority (skipped: no token)', { status: null, body: null })
  }

  // Products list (needs auth)
  let productsBody = null
  if (token) {
    const productsRes = await request('GET', '/products', { token })
    record('GET /products', productsRes)
    productsBody = productsRes?.body ?? null
  } else {
    record('GET /products (skipped: no token)', { status: null, body: null })
  }

  // Create product (ADMIN/MANAGER/FINANCE)
  let createdProductId = null
  if (token) {
    const createdProductRes = await request('POST', '/products', {
      token,
      body: { name: `Produto Manual ${Date.now()}`, amount: 1500 },
    })
    record('POST /products', createdProductRes)
    createdProductId = createdProductRes?.body?.id ?? null
  } else {
    record('POST /products (skipped: no token)', { status: null, body: null })
  }

  // Purchase (public) uses seeded products
  let p1Id = null
  let p2Id = null
  if (Array.isArray(productsBody) && productsBody.length > 0) {
    p1Id = productsBody[0]?.id ?? null
    p2Id = productsBody[1]?.id ?? productsBody[0]?.id ?? null
  }

  if (!p1Id && createdProductId) {
    p1Id = createdProductId
    p2Id = createdProductId
  }

  if (p1Id) {
    record(
      'POST /purchase',
      await request('POST', '/purchase', {
        body: {
          name: 'Cliente Manual',
          email: 'cliente.manual@example.com',
          cardNumber: '5569000000006063',
          cvv: '010',
          products: [
            { product_id: p1Id, quantity: 2 },
            { product_id: p2Id, quantity: 1 },
          ],
        },
      })
    )
  } else {
    record('POST /purchase (skipped: no products)', { status: null, body: null })
  }

  // Purchase fallback tests (requires products)
  if (p1Id) {
    record(
      'POST /purchase (fallback gw1->gw2)',
      await request('POST', '/purchase', {
        body: {
          name: 'Cliente Fallback',
          email: 'cliente.fallback@example.com',
          cardNumber: '5569000000006063',
          cvv: '100',
          products: [{ product_id: p1Id, quantity: 1 }],
        },
      })
    )
    record(
      'POST /purchase (all gateways fail)',
      await request('POST', '/purchase', {
        body: {
          name: 'Cliente Fail',
          email: 'cliente.fail@example.com',
          cardNumber: '5569000000006063',
          cvv: '200',
          products: [{ product_id: p1Id, quantity: 1 }],
        },
      })
    )
  }

  // Users (ADMIN/MANAGER)
  let createdUserId = null
  if (token) {
    const email = `user.manual.${Date.now()}@example.com`
    const createdUserRes = await request('POST', '/users', {
      token,
      body: { email, password: '123456', role: 'USER' },
    })
    record('POST /users', createdUserRes)
    createdUserId = createdUserRes?.body?.id ?? null

    const usersRes = await request('GET', '/users', { token })
    record('GET /users', usersRes)
  } else {
    record('GET /users (skipped: no token)', { status: null, body: null })
  }

  // Create role users for authorization checks
  if (token) {
    const managerEmail = `manager.${Date.now()}@example.com`
    const financeEmail = `finance.${Date.now()}@example.com`
    const userEmail = `user.${Date.now()}@example.com`

    record(
      'POST /users (create MANAGER)',
      await request('POST', '/users', {
        token,
        body: { email: managerEmail, password: '123456', role: 'MANAGER' },
      })
    )
    record(
      'POST /users (create FINANCE)',
      await request('POST', '/users', {
        token,
        body: { email: financeEmail, password: '123456', role: 'FINANCE' },
      })
    )
    record(
      'POST /users (create USER)',
      await request('POST', '/users', {
        token,
        body: { email: userEmail, password: '123456', role: 'USER' },
      })
    )

    const managerLogin = await request('POST', '/login', {
      body: { email: managerEmail, password: '123456' },
    })
    record('POST /login (MANAGER)', managerLogin)
    roleTokens.MANAGER = managerLogin?.body?.token ?? null

    const financeLogin = await request('POST', '/login', {
      body: { email: financeEmail, password: '123456' },
    })
    record('POST /login (FINANCE)', financeLogin)
    roleTokens.FINANCE = financeLogin?.body?.token ?? null

    const userLogin = await request('POST', '/login', {
      body: { email: userEmail, password: '123456' },
    })
    record('POST /login (USER)', userLogin)
    roleTokens.USER = userLogin?.body?.token ?? null
  }

  if (token && createdUserId) {
    record('GET /users/:id', await request('GET', `/users/${createdUserId}`, { token }))
    record(
      'PUT /users/:id',
      await request('PUT', `/users/${createdUserId}`, {
        token,
        body: { role: 'FINANCE' },
      })
    )
    record('DELETE /users/:id', await request('DELETE', `/users/${createdUserId}`, { token }))
  } else {
    record('GET /users/:id (skipped: no user)', { status: null, body: null })
    record('PUT /users/:id (skipped: no user)', { status: null, body: null })
    record('DELETE /users/:id (skipped: no user)', { status: null, body: null })
  }

  // Clients
  if (token) {
    const clientsRes = await request('GET', '/clients', { token })
    record('GET /clients', clientsRes)
    const clientId =
      Array.isArray(clientsRes?.body) && clientsRes.body.length > 0 ? clientsRes.body[0]?.id : null
    if (clientId) {
      record('GET /clients/:id', await request('GET', `/clients/${clientId}`, { token }))
    } else {
      record('GET /clients/:id (skipped: no clients)', { status: null, body: null })
    }
  } else {
    record('GET /clients (skipped: no token)', { status: null, body: null })
  }

  // Transactions
  let txBody = null
  if (token) {
    const txRes = await request('GET', '/transactions', { token })
    record('GET /transactions', txRes)
    txBody = txRes?.body ?? null
    const txId = Array.isArray(txBody) && txBody.length > 0 ? txBody[0]?.id : null
    if (txId) {
      record('GET /transactions/:id', await request('GET', `/transactions/${txId}`, { token }))
    } else {
      record('GET /transactions/:id (skipped: no transactions)', { status: null, body: null })
    }
  } else {
    record('GET /transactions (skipped: no token)', { status: null, body: null })
  }

  if (token && createdProductId) {
    record('GET /products/:id', await request('GET', `/products/${createdProductId}`, { token }))
    record(
      'PUT /products/:id',
      await request('PUT', `/products/${createdProductId}`, {
        token,
        body: { name: `Produto Manual Atualizado ${Date.now()}`, amount: 2000 },
      })
    )
    record('DELETE /products/:id', await request('DELETE', `/products/${createdProductId}`, { token }))
  } else {
    record('GET /products/:id (skipped: no product)', { status: null, body: null })
    record('PUT /products/:id (skipped: no product)', { status: null, body: null })
    record('DELETE /products/:id (skipped: no product)', { status: null, body: null })
  }

  // Role-based access checks (basic)
  const sampleUserId = createdUserId
  const sampleProductId = createdProductId
  const sampleTxId = Array.isArray(txBody) && txBody.length > 0 ? txBody[0]?.id : null

  if (roleTokens.MANAGER) {
    record(
      'ROLE MANAGER -> GET /users',
      await request('GET', '/users', { token: roleTokens.MANAGER })
    )
    if (sampleUserId) {
      record(
        'ROLE MANAGER -> PUT /users/:id',
        await request('PUT', `/users/${sampleUserId}`, {
          token: roleTokens.MANAGER,
          body: { role: 'USER' },
        })
      )
    }
    if (sampleProductId) {
      record(
        'ROLE MANAGER -> PUT /products/:id',
        await request('PUT', `/products/${sampleProductId}`, {
          token: roleTokens.MANAGER,
          body: { name: `Produto Manager ${Date.now()}`, amount: 2100 },
        })
      )
    }
  }

  if (roleTokens.FINANCE) {
    record(
      'ROLE FINANCE -> GET /products',
      await request('GET', '/products', { token: roleTokens.FINANCE })
    )
    if (sampleProductId) {
      record(
        'ROLE FINANCE -> PUT /products/:id',
        await request('PUT', `/products/${sampleProductId}`, {
          token: roleTokens.FINANCE,
          body: { name: `Produto Finance ${Date.now()}`, amount: 2200 },
        })
      )
    }
    if (sampleTxId) {
      record(
        'ROLE FINANCE -> POST /transactions/:id/refund',
        await request('POST', `/transactions/${sampleTxId}/refund`, {
          token: roleTokens.FINANCE,
        })
      )
    }
  }

  if (roleTokens.USER) {
    record(
      'ROLE USER -> GET /products',
      await request('GET', '/products', { token: roleTokens.USER })
    )
    record(
      'ROLE USER -> GET /clients (should fail)',
      await request('GET', '/clients', { token: roleTokens.USER })
    )
    record(
      'ROLE USER -> POST /products (should fail)',
      await request('POST', '/products', {
        token: roleTokens.USER,
        body: { name: `Produto User ${Date.now()}`, amount: 2300 },
      })
    )
  }

  // Refund (needs an existing transaction id)
  if (token) {
    const txId = Array.isArray(txBody) && txBody.length > 0 ? txBody[0]?.id : null
    if (txId) {
      record(
        'POST /transactions/:id/refund',
        await request('POST', `/transactions/${txId}/refund`, { token })
      )
    } else {
      record('POST /transactions/:id/refund (skipped: no transactions)', {
        status: null,
        body: null,
      })
    }
  }

  // Save results
  const outFile = SUMMARY_ONLY ? 'test-results.summary.json' : 'test-results.json'
  const outPath = new URL(`./${outFile}`, import.meta.url)
  await fs.writeFile(outPath, JSON.stringify({ baseUrl: BASE_URL, results }, null, 2))
  // eslint-disable-next-line no-console
  console.log(`Saved results to ${outPath.pathname}`)
}

await run()
