import { useEffect, useState } from 'react'
import {
    getRolePermissions,
    updateRolePermission,
} from '../api/permissionService'

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
    'ACCOUNTANT',
    'HR_OFFICER',
    'AUDITOR',
]

const modules = [
    'OVERVIEW',
    'DEPARTMENTS',
    'EMPLOYEES',
    'POULTRY_HOUSES',
    'FLOCK_MANAGEMENT',
    'TASKS_AND_CLEANING',
    'INVENTORY',
    'DRIVERS_AND_VEHICLES',
    'SALES',
    'DELIVERIES',
    'FINANCE',
    'USER_MANAGEMENT',
]

const permissionLevels = ['NONE', 'VIEW', 'CREATE', 'EDIT', 'FULL']

const formatLabel = (value) =>
    value
        .replaceAll('_', ' ')
        .toLowerCase()
        .replace(/\b\w/g, (letter) => letter.toUpperCase())

function RolePermissions() {
    const [selectedRole, setSelectedRole] = useState('ADMIN')
    const [permissions, setPermissions] = useState([])
    const [loading, setLoading] = useState(true)
    const [savingModule, setSavingModule] = useState(null)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const savedUser = JSON.parse(
        sessionStorage.getItem('khensani_user') || '{}'
    )

    const isSuperAdmin = savedUser.role === 'SUPER_ADMIN'

    // Load permissions for a role
    // Automatically load permissions when the page opens
    // and whenever the selected role changes.
    useEffect(() => {
        let cancelled = false

        getRolePermissions(selectedRole)
            .then((data) => {
                if (!cancelled) {
                    setPermissions(data)
                }
            })
            .catch((err) => {
                if (!cancelled) {
                    setPermissions([])
                    setError(err.message || 'Unable to load permissions.')
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setLoading(false)
                }
            })

        return () => {
            cancelled = true
        }
    }, [selectedRole])

    // Load permissions when the role is selected
    const handleRoleChange = (event) => {
        const role = event.target.value

        setLoading(true)
        setError('')
        setSuccess('')
        setPermissions([])
        setSelectedRole(role)
    }

    // Update a module permission
    const handlePermissionChange = async (module, permissionLevel) => {
        try {
            setSavingModule(module)
            setError('')
            setSuccess('')

            const updatedPermission = await updateRolePermission(
                selectedRole,
                module,
                permissionLevel
            )

            setPermissions((current) =>
                current.map((item) =>
                    item.systemModule === module
                        ? updatedPermission
                        : item
                )
            )

            setSuccess(
                `${formatLabel(module)} permission updated successfully.`
            )
        } catch (err) {
            setError(err.message || 'Unable to update permission.')
            try {
                const latestPermissions = await getRolePermissions(selectedRole)
                setPermissions(latestPermissions)
            } catch {
                setPermissions([])
            }
        } finally {
            setSavingModule(null)
        }
    }

    // Protect the page
    if (!isSuperAdmin) {
        return (
            <section className="rounded-2xl border border-red-200 bg-white p-8">
                <h3 className="text-xl font-bold text-red-700">
                    Access Denied
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                    Only Super Admin can manage role permissions.
                </p>
            </section>
        )
    }

    return (
        <div className="space-y-6">

            <div>
                <h2 className="text-2xl font-bold text-[#20392d]">
                    Role Permissions
                </h2>
                <p className="mt-1 text-sm text-[#849082]">
                    Manage access levels and control what each role can do.
                </p>
            </div>

            <section className="rounded-2xl border border-[#e5e9df] bg-white p-6">
                <label className="mb-2 block text-sm font-semibold text-[#536354]">
                    Select Role
                </label>

                <select
                    value={selectedRole}
                    onChange={handleRoleChange}
                    className="w-full max-w-md rounded-lg border border-[#dce3d7] bg-white px-4 py-3 text-sm outline-none focus:border-[#174a35]"
                >
                    {roles.map((role) => (
                        <option key={role} value={role}>
                            {formatLabel(role)}
                        </option>
                    ))}
                </select>

                <p className="mt-2 text-xs text-[#849082]">
                    Select a role to view and configure its permissions.
                </p>
            </section>

            {success && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
                    {success}
                </div>
            )}

            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {error}
                </div>
            )}

            <section className="overflow-hidden rounded-2xl border border-[#e5e9df] bg-white">

                <div className="border-b border-[#edf0e9] p-5">
                    <h3 className="font-bold text-[#20392d]">
                        {formatLabel(selectedRole)} Access Configuration
                    </h3>
                    <p className="mt-1 text-sm text-[#849082]">
                        Configure the permission level for each system module.
                    </p>
                </div>

                {loading ? (
                    <div className="p-10 text-center text-sm text-[#849082]">
                        Loading permissions...
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-137.5 text-left">
                            <thead className="bg-[#f6f7f2]">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#849082]">
                                        System Module
                                    </th>
                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#849082]">
                                        Permission Level
                                    </th>
                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#849082]">
                                        Status
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-[#edf0e9]">
                                {modules.map((module) => {
                                    const permission = permissions.find(
                                        (item) => item.systemModule === module
                                    )

                                    const currentLevel =
                                        permission?.permissionLevel || 'NONE'

                                    return (
                                        <tr
                                            key={module}
                                            className="transition hover:bg-[#fafbf8]"
                                        >
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-medium text-[#35483a]">
                                                    {formatLabel(module)}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4">
                                                <select
                                                    value={currentLevel}
                                                    disabled={
                                                        !permission ||
                                                        savingModule === module
                                                    }
                                                    onChange={(event) =>
                                                        handlePermissionChange(
                                                            module,
                                                            event.target.value
                                                        )
                                                    }
                                                    className="rounded-lg border border-[#dce3d7] bg-white px-3 py-2 text-sm text-[#35483a] outline-none focus:border-[#174a35] disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    {permissionLevels.map((level) => (
                                                        <option key={level} value={level}>
                                                            {level}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>

                                            <td className="px-6 py-4">
                                                {savingModule === module ? (
                                                    <span className="text-xs text-[#849082]">
                                                        Saving...
                                                    </span>
                                                ) : (
                                                    <span
                                                        className={`rounded-full px-3 py-1 text-xs font-semibold ${currentLevel === 'NONE'
                                                                ? 'bg-gray-100 text-gray-600'
                                                                : currentLevel === 'FULL'
                                                                    ? 'bg-green-100 text-green-800'
                                                                    : 'bg-blue-100 text-blue-800'
                                                            }`}
                                                    >
                                                        {currentLevel === 'NONE'
                                                            ? 'No Access'
                                                            : 'Enabled'}
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            <section className="rounded-2xl border border-[#e5e9df] bg-white p-6">
                <h3 className="mb-4 font-bold text-[#20392d]">
                    Permission Levels
                </h3>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {[
                        { level: 'NONE', description: 'No access to the module.' },
                        { level: 'VIEW', description: 'Can view and search records.' },
                        { level: 'CREATE', description: 'Can view and create records.' },
                        { level: 'EDIT', description: 'Can view and edit records.' },
                        {
                            level: 'FULL',
                            description: 'Can view, create, edit and delete records.',
                        },
                    ].map((item) => (
                        <div
                            key={item.level}
                            className="rounded-lg bg-[#f6f7f2] p-4"
                        >
                            <p className="text-sm font-bold text-[#174a35]">
                                {item.level}
                            </p>
                            <p className="mt-1 text-xs text-[#849082]">
                                {item.description}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

        </div>
    )
}

export default RolePermissions
