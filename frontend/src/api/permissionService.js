
const API_URL = 'http://localhost:8080/api/permissions'

const getAuthHeaders = () => {
  const token = sessionStorage.getItem('khensani_token')

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
}

// Get permissions for a selected role
export const getRolePermissions = async (role) => {
  const response = await fetch(`${API_URL}/${role}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  })

  if (!response.ok) {
    throw new Error('Failed to retrieve role permissions.')
  }

  return response.json()
}

// Update a module permission
export const updateRolePermission = async (
  role,
  module,
  permissionLevel
) => {
  const response = await fetch(
    `${API_URL}/${role}/${module}?permissionLevel=${permissionLevel}`,
    {
      method: 'PUT',
      headers: getAuthHeaders(),
    }
  )

  if (!response.ok) {
    throw new Error('Failed to update permission.')
  }

  return response.json()
}
