
const API_BASE_URL = 'http://localhost:8080/api/departments'

function getAuthHeaders(includeJson = false) {
  const token = sessionStorage.getItem('khensani_token')

  return {
    ...(includeJson ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export async function getDepartments() {
  const response = await fetch(API_BASE_URL, {
    headers: getAuthHeaders(),
  })

  if (!response.ok) {
    throw new Error('Failed to fetch departments')
  }

  return response.json()
}

export async function createDepartment(department) {
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: getAuthHeaders(true),
    body: JSON.stringify(department),
  })

  if (!response.ok) {
    throw new Error('Failed to create department')
  }

  return response.json()
}
