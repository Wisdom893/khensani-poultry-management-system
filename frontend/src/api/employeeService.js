
const API_BASE_URL = 'http://localhost:8080/api/employees'

function getAuthHeaders(includeJson = false) {
  const token = sessionStorage.getItem('khensani_token')

  return {
    ...(includeJson ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export async function getEmployees() {
  const response = await fetch(API_BASE_URL, {
    headers: getAuthHeaders(),
  })

  if (!response.ok) {
    throw new Error('Failed to fetch employees')
  }

  return response.json()
}

export async function getEmployeeById(id) {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    headers: getAuthHeaders(),
  })

  if (!response.ok) {
    throw new Error('Failed to fetch employee')
  }

  return response.json()
}

export async function createEmployee(employee) {
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: getAuthHeaders(true),
    body: JSON.stringify(employee),
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || 'Failed to create employee')
  }

  return response.json()
}

export async function updateEmployee(id, employee) {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(true),
    body: JSON.stringify(employee),
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || 'Failed to update employee')
  }

  return response.json()
}
