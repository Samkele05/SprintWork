async function request(endpoint, options = {}) {
  const response = await fetch(endpoint, {
    headers: {
      'Content-Type': 'application/json'
    },
    ...options
  })

  let body = null
  try {
    body = await response.json()
  } catch (error) {
    body = null
  }

  if (!response.ok) {
    throw new Error(body?.message || response.statusText || 'API request failed')
  }

  return body
}

export function fetchApi(endpoint) {
  return request(endpoint)
}

export function postApi(endpoint, data) {
  return request(endpoint, {
    method: 'POST',
    body: JSON.stringify(data)
  })
}
