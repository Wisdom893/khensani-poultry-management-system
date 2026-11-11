
import { useEffect, useState } from 'react'
import { createUser, getUsers, updateUserStatus } from '../api/userService'
import { getEmployees } from '../api/employeeService'

const roles = [
    'ADMIN',
    'FARM_MANAGER',
    'DEPARTMENT_MANAGER',
    'VETERINARY_OFFICER',
    'INVENTORY_OFFICER',
    'SALES_OFFICER',
    'DELIVERY_MANAGER',
    'DRIVER',
    'FARM_WORKER',
    'POULTRY_HOUSE_CLEANER',
    'ACCOUNTANT',
    'HR_OFFICER',
    'AUDITOR',
]

function UserManagement() {
    const [users, setUsers] = useState([])
    const [employees, setEmployees] = useState([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const [form, setForm] = useState({
        username: '',
        password: '',
        role: 'FARM_WORKER',
        employeeId: '',
    })


    useEffect(() => {
        let cancelled = false

        async function loadData() {
            try {
                const [usersData, employeesData] = await Promise.all([
                    getUsers(),
                    getEmployees(),
                ])

                if (!cancelled) {
                    setUsers(usersData)
                    setEmployees(employeesData)
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err.message || 'Failed to load user management data')
                }
            } finally {
                if (!cancelled) {
                    setLoading(false)
                }
            }
        }

        loadData()

        return () => {
            cancelled = true
        }
    }, [])


    function updateForm(event) {
        const { name, value } = event.target

        setForm((previous) => {
            const updatedForm = {
                ...previous,
                [name]: value,
            }

            // When an employee is selected, show their assigned system role.
            if (name === 'employeeId') {
                if (!value) {
                    updatedForm.role = 'FARM_WORKER'
                } else {
                    const selectedEmployee = employees.find(
                        (employee) => String(employee.id) === value
                    )

                    if (selectedEmployee?.systemRole) {
                        updatedForm.role = selectedEmployee.systemRole
                    }
                }
            }

            return updatedForm
        })
    }

    async function handleSubmit(event) {
        event.preventDefault()
        setSaving(true)
        setError('')
        setSuccess('')

        try {
            const newUser = {
                username: form.username.trim(),
                password: form.password,
                role: form.role,
                employeeId: form.employeeId
                    ? Number(form.employeeId)
                    : null,
            }

            await createUser(newUser)

            setForm({
                username: '',
                password: '',
                role: 'FARM_WORKER',
                employeeId: '',
            })

            setSuccess('User account created successfully.')

            const [usersData, employeesData] = await Promise.all([
                getUsers(),
                getEmployees(),
            ])

            setUsers(usersData)
            setEmployees(employeesData)
        } catch (err) {
            setError(err.message || 'Failed to create user account')
        } finally {
            setSaving(false)
        }
    }


    async function handleStatusChange(user) {
        const action = user.enabled ? 'disable' : 'enable'

        const confirmed = window.confirm(
            `Are you sure you want to ${action} the account "${user.username}"?`
        )

        if (!confirmed) return

        setError('')
        setSuccess('')

        try {
            await updateUserStatus(user.id, !user.enabled)

            const updatedUsers = await getUsers()
            setUsers(updatedUsers)

            setSuccess(
                `User account "${user.username}" has been ${action}d successfully.`
            )
        } catch (err) {
            setError(err.message || 'Failed to update user status')
        }
    }


    return (
        <div className="space-y-7">
            <section>
                <h3 className="text-2xl font-bold">User Management</h3>
                <p className="mt-1 text-sm text-[#849082]">
                    Create system accounts and manage access roles.
                </p>
            </section>

            {error && (
                <div
                    role="alert"
                    className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                >
                    {error}
                </div>
            )}

            {success && (
                <div
                    role="status"
                    className="rounded-xl border border-[#cce2c8] bg-[#e9f2e8] p-4 text-sm text-[#174a35]"
                >
                    {success}
                </div>
            )}

            <section className="rounded-2xl border border-[#e5e9df] bg-white p-6">
                <h4 className="text-lg font-bold">Create User Account</h4>
                <p className="mt-1 text-sm text-[#849082]">
                    Passwords must contain at least 12 characters.
                </p>

                <form onSubmit={handleSubmit} className="mt-6 grid gap-5 sm:grid-cols-2">
                    <div>
                        <label htmlFor="username" className="mb-2 block text-sm font-semibold">
                            Username
                        </label>
                        <input
                            id="username"
                            name="username"
                            value={form.username}
                            onChange={updateForm}
                            minLength={3}
                            maxLength={50}
                            required
                            className="w-full rounded-lg border border-[#dce3d7] px-3 py-2.5 outline-none focus:border-[#174a35]"
                            placeholder="Enter username"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="mb-2 block text-sm font-semibold">
                            Temporary password
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            value={form.password}
                            onChange={updateForm}
                            minLength={12}
                            maxLength={100}
                            autoComplete="new-password"
                            required
                            className="w-full rounded-lg border border-[#dce3d7] px-3 py-2.5 outline-none focus:border-[#174a35]"
                            placeholder="At least 12 characters"
                        />
                    </div>

                    <div>
                        <label htmlFor="role" className="mb-2 block text-sm font-semibold">
                            System role
                        </label>
                        <select
                            id="role"
                            name="role"
                            value={form.role}
                            onChange={updateForm}
                            required
                            disabled={Boolean(form.employeeId)}
                            className="w-full rounded-lg border border-[#dce3d7] bg-white px-3 py-2.5 outline-none focus:border-[#174a35] disabled:cursor-not-allowed disabled:bg-[#f4f7ef] disabled:text-[#667267]"
                        >
                            {roles.map((role) => (
                                <option key={role} value={role}>
                                    {role.replaceAll('_', ' ')}
                                </option>
                            ))}
                        </select>
                        <p className="mt-1 text-xs text-[#849082]">
                            {form.employeeId
                                ? 'Role is automatically taken from the selected employee.'
                                : 'Select a role for a standalone account, or link an employee to use their assigned system role.'}
                        </p>
                    </div>

                    <div>
                        <label htmlFor="employeeId" className="mb-2 block text-sm font-semibold">
                            Link to employee (optional)
                        </label>
                        <select
                            id="employeeId"
                            name="employeeId"
                            value={form.employeeId}
                            onChange={updateForm}
                            className="w-full rounded-lg border border-[#dce3d7] bg-white px-3 py-2.5 outline-none focus:border-[#174a35]"
                        >
                            <option value="">No employee linked</option>
                            {employees.map((employee) => (
                                <option key={employee.id} value={employee.id}>
                                    {employee.firstName} {employee.surname}
                                    {employee.employeeNumber
                                        ? ` (${employee.employeeNumber})`
                                        : ''}
                                </option>
                            ))}
                        </select>
                        {form.employeeId && (
                            <p className="mt-1 text-xs font-medium text-[#286344]">
                                Assigned role: {form.role.replaceAll('_', ' ')}
                            </p>
                        )}
                    </div>

                    <div className="sm:col-span-2">
                        <button
                            type="submit"
                            disabled={saving}
                            className="rounded-lg bg-[#174a35] px-5 py-3 font-semibold text-white transition hover:bg-[#103b2a] disabled:opacity-60"
                        >
                            {saving ? 'Creating account...' : 'Create User Account'}
                        </button>
                    </div>
                </form>
            </section>

            <section className="overflow-hidden rounded-2xl border border-[#e5e9df] bg-white">
                <div className="border-b border-[#edf0e9] px-6 py-5">
                    <h4 className="text-lg font-bold">System Users</h4>
                    <p className="mt-1 text-sm text-[#849082]">
                        Accounts registered in the system.
                    </p>
                </div>

                {loading ? (
                    <p className="p-6 text-sm text-[#849082]">Loading users...</p>
                ) : users.length === 0 ? (
                    <p className="p-6 text-sm text-[#849082]">No users found.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-[#f6f7f2] text-[#667267]">
                                <tr>
                                    <th className="px-6 py-3 font-semibold">Username</th>
                                    <th className="px-6 py-3 font-semibold">Employee</th>
                                    <th className="px-6 py-3 font-semibold">Role</th>
                                    <th className="px-6 py-3 font-semibold">Status</th>
                                    <th className="px-6 py-3 font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#edf0e9]">
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-[#fafbf8]">
                                        <td className="px-6 py-4 font-semibold">
                                            {user.username}
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.employeeName || 'Not linked'}
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.role.replaceAll('_', ' ')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-semibold ${user.enabled
                                                    ? 'bg-[#e9f2e8] text-[#174a35]'
                                                    : 'bg-gray-100 text-gray-600'
                                                    }`}
                                            >
                                                {user.enabled ? 'Active' : 'Disabled'}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4">
                                            {user.role === 'SUPER_ADMIN' ? (
                                                <span className="text-xs text-[#849082]">
                                                    Protected account
                                                </span>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => handleStatusChange(user)}
                                                    className={`rounded-lg px-3 py-2 text-xs font-semibold ${user.enabled
                                                            ? 'border border-red-200 text-red-700 hover:bg-red-50'
                                                            : 'bg-[#174a35] text-white hover:bg-[#103b2a]'
                                                        }`}
                                                >
                                                    {user.enabled ? 'Disable' : 'Enable'}
                                                </button>
                                            )}
                                        </td>

                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    )
}

export default UserManagement
