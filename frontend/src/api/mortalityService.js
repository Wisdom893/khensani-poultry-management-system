
const API_BASE_URL = 'http://localhost:8080/api/mortality-records'

function getAuthHeaders(includeJson = false) {
  const token = sessionStorage.getItem('khensani_token')

  return {
    ...(includeJson ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export async function getMortalityRecords() {
  const response = await fetch(API_BASE_URL, {
    headers: getAuthHeaders(),
  })

  if (!response.ok) {
    throw new Error('Failed to fetch mortality records')
  }

  return response.json()
}

export async function getMortalityRecordsByFlock(flockId) {
  const response = await fetch(`${API_BASE_URL}/flock/${flockId}`, {
    headers: getAuthHeaders(),
  })

  if (!response.ok) {
    throw new Error('Failed to fetch flock mortality history')
  }

  return response.json()
}

export async function createMortalityRecord(flockId, record) {
  const response = await fetch(`${API_BASE_URL}/flock/${flockId}`, {
    method: 'POST',
    headers: getAuthHeaders(true),
    body: JSON.stringify(record),
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || 'Failed to record mortality')
  }

  return response.json()
}

export async function updateMortalityRecord(id, record) {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(true),
    body: JSON.stringify(record),
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || 'Failed to update mortality record')
  }

  return response.json()
}

export async function deleteMortalityRecord(id) {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || 'Failed to delete mortality record')
  }
}
