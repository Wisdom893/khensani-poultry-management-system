
const API_BASE_URL = 'http://localhost:8080/api/poultry-houses'

function getAuthHeaders(includeJson = false) {
  const token = sessionStorage.getItem('khensani_token')

  return {
    ...(includeJson ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export async function getPoultryHouses() {
  const response = await fetch(API_BASE_URL, {
    headers: getAuthHeaders(),
  })

  if (!response.ok) {
    throw new Error('Failed to fetch poultry houses')
  }

  return response.json()
}

export async function getPoultryHouseById(id) {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    headers: getAuthHeaders(),
  })

  if (!response.ok) {
    throw new Error('Failed to fetch poultry house details')
  }

  return response.json()
}

export async function createPoultryHouse(house) {
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: getAuthHeaders(true),
    body: JSON.stringify(house),
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || 'Failed to register poultry house')
  }

  return response.json()
}

export async function updatePoultryHouse(id, house) {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(true),
    body: JSON.stringify(house),
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || 'Failed to update poultry house')
  }

  return response.json()
}
