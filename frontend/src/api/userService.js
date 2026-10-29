
const API_BASE_URL = 'http://localhost:8080/api/users'

function getHeaders(includeJson = false) {
  const token = sessionStorage.getItem('khensani_token')

  return {
    ...(includeJson ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export async function getUsers() {
  const response = await fetch(API_BASE_URL, {
    headers: getHeaders(),
  })

  if (!response.ok) {
    throw new Error('Failed to fetch users')
  }

  return response.json()
}

export async function createUser(user) {
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify(user),
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || 'Failed to create user')
  }

  return response.json()
}


export async function updateUserStatus(userId, enabled) {
  const response = await fetch(
    `${API_BASE_URL}/${userId}/status?enabled=${enabled}`,
    {
      method: 'PATCH',
      headers: getHeaders(),
    }
  )

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || 'Failed to update user status')
  }

  return response.json()
}

