/** Error de una API externa, con datos para decidir qué mostrarle a la persona. */
export class ApiError extends Error {
  constructor(message, { status = 0, service = 'api', code, data } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.service = service
    this.code = code
    this.data = data
  }
}

const sleep = (ms, signal) =>
  new Promise((resolve, reject) => {
    const id = setTimeout(resolve, ms)
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(id)
        reject(new DOMException('Aborted', 'AbortError'))
      },
      { once: true },
    )
  })

function buildUrl(url, params) {
  if (!params) return url
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') search.append(key, String(value))
  }
  const query = search.toString()
  if (!query) return url
  return `${url}${url.includes('?') ? '&' : '?'}${query}`
}

function extractMessage(data, fallback) {
  if (!data) return fallback
  if (typeof data === 'string') return data
  return (
    data.error?.message ??
    data.error_description ??
    data.message ??
    (typeof data.error === 'string' ? data.error : null) ??
    fallback
  )
}

/**
 * fetch + JSON con errores tipados. Si la API responde 429 con Retry-After corto,
 * espera y reintenta una sola vez.
 */
export async function requestJson(
  url,
  { method = 'GET', headers, body, params, signal, service = 'api', retryOn429 = true } = {},
) {
  const response = await fetch(buildUrl(url, params), { method, headers, body, signal })

  if (response.status === 429 && retryOn429) {
    const wait = Number(response.headers.get('Retry-After'))
    if (Number.isFinite(wait) && wait > 0 && wait <= 5) {
      await sleep(wait * 1000, signal)
      return requestJson(url, { method, headers, body, params, signal, service, retryOn429: false })
    }
  }

  const text = await response.text()
  let data = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = text
    }
  }

  if (!response.ok) {
    throw new ApiError(extractMessage(data, `Error ${response.status}`), {
      status: response.status,
      service,
      // Last.fm manda su código de error como número en data.error
      code: typeof data?.error === 'number' ? data.error : undefined,
      data,
    })
  }
  return data
}
