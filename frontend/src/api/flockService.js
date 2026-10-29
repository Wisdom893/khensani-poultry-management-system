
const API_BASE_URL = 'http://localhost:8080/api/flocks'

function getAuthHeaders(includeJson = false) {
  const token = sessionStorage.getItem('khensani_token')

  return {
    ...(includeJson ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export async function getFlocks() {
  const response = await fetch(API_BASE_URL, {
    headers: getAuthHeaders(),
  })

  if (!response.ok) {
    throw new Error('Failed to fetch flocks')
  }

  return response.json()
}

export async function getFlockById(id) {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    headers: getAuthHeaders(),
  })

  if (!response.ok) {
    throw new Error('Failed to fetch flock details')
  }

  return response.json()
}

export async function createFlock(flock) {
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: getAuthHeaders(true),
    body: JSON.stringify(flock),
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || 'Failed to register flock')
  }

  return response.json()
}

export async function updateFlock(id, flock) {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(true),
    body: JSON.stringify(flock),
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || 'Failed to update flock')
  }

  return response.json()
}

export async function getFlockStatistics(id) {
  const response = await fetch(`${API_BASE_URL}/${id}/statistics`, {
    headers: getAuthHeaders(),
  })

  if (!response.ok) {
    throw new Error('Failed to fetch flock statistics')
  }

  return response.json()
}
