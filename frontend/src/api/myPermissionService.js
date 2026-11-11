
const API_URL = 'http://localhost:8080/api/my-permissions'

export const getMyPermissions = async () => {
  const token = sessionStorage.getItem('khensani_token')

  const response = await fetch(API_URL, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to retrieve your permissions.')
  }

  return response.json()
}
