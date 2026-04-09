import axios from 'axios'

type AxiosPost = typeof axios.post

let originalPost: AxiosPost | null = null

function setPostMock(handler: (url: string, data?: any) => any) {
  if (!originalPost) originalPost = axios.post
  axios.post = (async (url: string, data?: any) => {
    return handler(url, data)
  }) as AxiosPost
}

export function mockGatewaysSuccess() {
  setPostMock((url) => {
    if (url.endsWith('/login')) {
      return Promise.resolve({ data: { token: 'gw1_token' } })
    }
    if (url.includes('/transactions')) {
      return Promise.resolve({ data: { id: 'gw1_tx' } })
    }
    if (url.includes('/transacoes')) {
      return Promise.resolve({ data: { id: 'gw2_tx' } })
    }
    if (url.includes('/charge_back') || url.includes('/reembolso')) {
      return Promise.resolve({ data: { ok: true } })
    }
    throw new Error(`Unexpected url: ${url}`)
  })
}

export function mockGateway1FailGateway2Success() {
  setPostMock((url) => {
    if (url.endsWith('/login')) {
      return Promise.resolve({ data: { token: 'gw1_token' } })
    }
    if (url.includes('/transactions') && !url.includes('/transacoes')) {
      return Promise.reject(new Error('gw1 fail'))
    }
    if (url.includes('/transacoes')) {
      return Promise.resolve({ data: { id: 'gw2_tx' } })
    }
    if (url.includes('/charge_back') || url.includes('/reembolso')) {
      return Promise.resolve({ data: { ok: true } })
    }
    throw new Error(`Unexpected url: ${url}`)
  })
}

export function mockAllGatewaysFail() {
  setPostMock((url) => {
    if (url.endsWith('/login')) {
      return Promise.resolve({ data: { token: 'gw1_token' } })
    }
    if (url.includes('/transactions') || url.includes('/transacoes')) {
      return Promise.reject(new Error('gateway fail'))
    }
    throw new Error(`Unexpected url: ${url}`)
  })
}

export function mockRefundSuccess() {
  setPostMock((url) => {
    if (url.includes('/charge_back') || url.includes('/reembolso')) {
      return Promise.resolve({ data: { ok: true } })
    }
    if (url.endsWith('/login')) {
      return Promise.resolve({ data: { token: 'gw1_token' } })
    }
    if (url.includes('/transactions') || url.includes('/transacoes')) {
      return Promise.resolve({ data: { id: 'gw_tx' } })
    }
    throw new Error(`Unexpected url: ${url}`)
  })
}

export function restoreAxios() {
  if (originalPost) {
    axios.post = originalPost
    originalPost = null
  }
}
