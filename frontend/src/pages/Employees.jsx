
import { useEffect, useState } from 'react'
import { getEmployees, createEmployee, updateEmployee } from '../api/employeeService'
import { getDepartments } from '../api/departmentService'

function Employees() {
    const [employees, setEmployees] = useState([])
    const [departments, setDepartments] = useState([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [search, setSearch] = useState('')
    const [showForm, setShowForm] = useState(false)
    const [selectedEmployee, setSelectedEmployee] = useState(null)
    const [editingEmployeeId, setEditingEmployeeId] = useState(null)


    const emptyForm = {
        employeeNumber: '',
        firstName: '',
        surname: '',
        email: '',
        phoneNumber: '',
        jobTitle: '',
        systemRole: 'FARM_WORKER',
        status: 'ACTIVE',
        departmentId: '',
    }

    const [form, setForm] = useState(emptyForm)

    async function loadData() {
        try {
            setLoading(true)
            setError('')

            const [employeeData, departmentData] = await Promise.all([
                getEmployees(),
                getDepartments(),
            ])

            setEmployees(employeeData)
            setDepartments(departmentData)
        } catch {
            setError(
                'Could not load employees or departments. Check that the backend is running.'
            )
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        let cancelled = false

        async function fetchData() {
            try {
                const [employeeData, departmentData] = await Promise.all([
                    getEmployees(),
                    getDepartments(),
                ])

                if (!cancelled) {
                    setEmployees(employeeData)
                    setDepartments(departmentData)
                    setError('')
                }
            } catch {
                if (!cancelled) {
                    setError(
                        'Could not load employees or departments. Check that the backend is running.'
                    )
                }
            } finally {
                if (!cancelled) {
                    setLoading(false)
                }
            }
        }

        fetchData()

        return () => {
            cancelled = true
        }
    }, [])

    function handleChange(event) {
        const { name, value } = event.target

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }))
    }

    function handleEdit(employee) {
        setEditingEmployeeId(employee.id)

        setForm({
            employeeNumber: employee.employeeNumber || '',
            firstName: employee.firstName || '',
            surname: employee.surname || '',
            email: employee.email || '',
            phoneNumber: employee.phoneNumber || '',
            jobTitle: employee.jobTitle || '',
            systemRole: employee.systemRole || 'FARM_WORKER',
            status: employee.status || 'ACTIVE',
            departmentId: employee.department?.id
                ? String(employee.department.id)
                : '',
        })

        setSelectedEmployee(null)
        setError('')
        setShowForm(true)
    }


    async function handleStatusChange(employee, newStatus) {
        setError('')

        try {
            const updatedEmployee = {
                employeeNumber: employee.employeeNumber,
                firstName: employee.firstName,
                surname: employee.surname,
                email: employee.email || '',
                phoneNumber: employee.phoneNumber || '',
                jobTitle: employee.jobTitle,
                systemRole: employee.systemRole || 'FARM_WORKER',
                status: newStatus,
                department: {
                    id: employee.department?.id,
                },
            }

            await updateEmployee(employee.id, updatedEmployee)
            await loadData()
        } catch (err) {
            setError(err.message || 'Could not update employee status.')
        }
    }


    async function handleSubmit(event) {
        event.preventDefault()
        setError('')

        if (!form.departmentId) {
            setError('Please select a department.')
            return
        }

        try {
            setSaving(true)

            const employeeData = {
                employeeNumber: form.employeeNumber.trim(),
                firstName: form.firstName.trim(),
                surname: form.surname.trim(),
                email: form.email.trim(),
                phoneNumber: form.phoneNumber.trim(),
                jobTitle: form.jobTitle.trim(),
                systemRole: form.systemRole,
                status: form.status,
                department: {
                    id: Number(form.departmentId),
                },
            }

            if (editingEmployeeId !== null) {
                await updateEmployee(editingEmployeeId, employeeData)
            } else {
                await createEmployee(employeeData)
            }

            setForm(emptyForm)
            setEditingEmployeeId(null)
            setShowForm(false)
            setSelectedEmployee(null)

            await loadData()
        } catch (err) {
            setError(
                err.message ||
                `Could not ${editingEmployeeId !== null ? 'update' : 'register'} employee. Check the details and try again.`
            )
        } finally {
            setSaving(false)
        }
    }

    const filteredEmployees = employees.filter((employee) => {
        const departmentName = employee.department?.name || ''

        const searchableText = [
            employee.employeeNumber,
            employee.firstName,
            employee.surname,
            employee.email,
            employee.jobTitle,
            employee.systemRole,
            departmentName,
        ]
            .join(' ')
            .toLowerCase()

        return searchableText.includes(search.toLowerCase())
    })

    return (
        <section className="space-y-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <p className="text-sm font-semibold text-[#6b8468]">
                        FARM ORGANISATION
                    </p>
                    <h3 className="mt-2 text-2xl font-bold">Employees</h3>
                    <p className="mt-2 text-sm text-[#849082]">
                        Register employees and organise your farm workforce.
                    </p>
                </div>

                <button
                    onClick={() => {
                        setShowForm(!showForm)
                        setError('')
                    }}
                    className="rounded-lg bg-[#174a35] px-5 py-3 text-sm font-semibold text-white hover:bg-[#225b43]"
                >
                    {showForm ? 'Cancel' : '+ Add Employee'}
                </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-[#e5e9df] bg-white p-5">
                    <p className="text-sm text-[#849082]">Total employees</p>
                    <p className="mt-2 text-3xl font-bold">{employees.length}</p>
                </div>

                <div className="rounded-xl border border-[#e5e9df] bg-white p-5">
                    <p className="text-sm text-[#849082]">Active employees</p>
                    <p className="mt-2 text-3xl font-bold text-[#286344]">
                        {employees.filter((employee) => employee.status === 'ACTIVE').length}
                    </p>
                </div>
            </div>

            {error && (
                <div
                    role="alert"
                    className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                >
                    {error}
                </div>
            )}

            {showForm && (
                <form
                    onSubmit={handleSubmit}
                    className="space-y-5 rounded-2xl border border-[#e5e9df] bg-white p-5 sm:p-6"
                >
                    <div>
                        <h4 className="text-lg font-bold">
                            {editingEmployeeId !== null ? 'Edit Employee' : 'Register Employee'}
                        </h4>
                        <p className="mt-1 text-sm text-[#849082]">
                            Enter the employee's details below.
                        </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Employee Number *
                            </label>
                            <input
                                name="employeeNumber"
                                value={form.employeeNumber}
                                onChange={handleChange}
                                placeholder="e.g. KHE001"
                                required
                                maxLength={50}
                                className="w-full rounded-lg border border-[#dce3d7] px-3 py-3 outline-none focus:border-[#286344]"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                First Name *
                            </label>
                            <input
                                name="firstName"
                                value={form.firstName}
                                onChange={handleChange}
                                required
                                maxLength={100}
                                className="w-full rounded-lg border border-[#dce3d7] px-3 py-3 outline-none focus:border-[#286344]"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Surname *
                            </label>
                            <input
                                name="surname"
                                value={form.surname}
                                onChange={handleChange}
                                required
                                maxLength={100}
                                className="w-full rounded-lg border border-[#dce3d7] px-3 py-3 outline-none focus:border-[#286344]"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Email Address *
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                required
                                maxLength={150}
                                className="w-full rounded-lg border border-[#dce3d7] px-3 py-3 outline-none focus:border-[#286344]"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Cellphone Number
                            </label>
                            <input
                                type="tel"
                                name="phoneNumber"
                                value={form.phoneNumber}
                                onChange={handleChange}
                                maxLength={30}
                                placeholder="e.g. 0712345678"
                                className="w-full rounded-lg border border-[#dce3d7] px-3 py-3 outline-none focus:border-[#286344]"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Job Title *
                            </label>
                            <input
                                name="jobTitle"
                                value={form.jobTitle}
                                onChange={handleChange}
                                required
                                maxLength={100}
                                placeholder="e.g. Poultry Worker"
                                className="w-full rounded-lg border border-[#dce3d7] px-3 py-3 outline-none focus:border-[#286344]"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                System Role *
                            </label>
                            <select
                                name="systemRole"
                                value={form.systemRole}
                                onChange={handleChange}
                                required
                                className="w-full rounded-lg border border-[#dce3d7] bg-white px-3 py-3 outline-none focus:border-[#286344]"
                            >
                                <option value="FARM_MANAGER">Farm Manager</option>
                                <option value="DEPARTMENT_MANAGER">Department Manager</option>
                                <option value="VETERINARY_OFFICER">Veterinary Officer</option>
                                <option value="INVENTORY_OFFICER">Inventory Officer</option>
                                <option value="SALES_OFFICER">Sales Officer</option>
                                <option value="DELIVERY_MANAGER">Delivery Manager</option>
                                <option value="DRIVER">Driver</option>
                                <option value="FARM_WORKER">Farm Worker</option>
                                <option value="POULTRY_HOUSE_CLEANER">Poultry House Cleaner</option>
                                <option value="ACCOUNTANT">Accountant</option>
                                <option value="HR_OFFICER">HR Officer</option>
                                <option value="AUDITOR">Auditor</option>
                            </select>
                            <p className="mt-1 text-xs text-[#849082]">
                                Determines which modules and actions the employee can access.
                            </p>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Department *
                            </label>
                            <select
                                name="departmentId"
                                value={form.departmentId}
                                onChange={handleChange}
                                required
                                className="w-full rounded-lg border border-[#dce3d7] bg-white px-3 py-3 outline-none focus:border-[#286344]"
                            >
                                <option value="">Select department</option>
                                {departments.map((department) => (
                                    <option key={department.id} value={department.id}>
                                        {department.name}
                                    </option>
                                ))}
                            </select>
                            {departments.length === 0 && !loading && (
                                <p className="mt-1 text-xs text-amber-700">
                                    Add a department before registering an employee.
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Employment Status *
                            </label>
                            <select
                                name="status"
                                value={form.status}
                                onChange={handleChange}
                                required
                                className="w-full rounded-lg border border-[#dce3d7] bg-white px-3 py-3 outline-none focus:border-[#286344]"
                            >
                                <option value="ACTIVE">Active</option>
                                <option value="INACTIVE">Inactive</option>
                                <option value="ON_LEAVE">On Leave</option>
                                <option value="TERMINATED">Terminated</option>
                            </select>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={saving || departments.length === 0}
                        className="rounded-lg bg-[#174a35] px-5 py-3 text-sm font-semibold text-white hover:bg-[#225b43] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : editingEmployeeId !== null ? 'Update Employee' : 'Save Employee'}
                    </button>
                </form>
            )}


            {selectedEmployee && (
                <div className="rounded-2xl border border-[#e5e9df] bg-white p-6 sm:p-8">
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                        <div>
                            <p className="text-sm font-semibold text-[#6b8468]">
                                EMPLOYEE PROFILE
                            </p>
                            <h3 className="mt-2 text-2xl font-bold">
                                {selectedEmployee.firstName} {selectedEmployee.surname}
                            </h3>
                            <p className="mt-1 text-sm text-[#849082]">
                                Employee Number: {selectedEmployee.employeeNumber}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => setSelectedEmployee(null)}
                            className="rounded-lg border border-[#dce3d7] px-4 py-2 text-sm font-semibold hover:bg-[#f4f7ef]"
                        >
                            Close Details
                        </button>
                    </div>

                    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {[
                            ['First Name', selectedEmployee.firstName],
                            ['Surname', selectedEmployee.surname],
                            ['Email Address', selectedEmployee.email],
                            ['Phone Number', selectedEmployee.phoneNumber],
                            ['Job Title', selectedEmployee.jobTitle],
                            ['System Role', (selectedEmployee.systemRole || 'FARM_WORKER').replaceAll('_', ' ')],
                            ['Department', selectedEmployee.department?.name],
                            [
                                'Employment Status',
                                selectedEmployee.status?.replace('_', ' '),
                            ],
                        ].map(([label, value]) => (
                            <div
                                key={label}
                                className="rounded-xl bg-[#f4f7ef] p-4"
                            >
                                <p className="text-sm text-[#849082]">{label}</p>
                                <p className="mt-2 break-words font-semibold text-[#20392d]">
                                    {value || 'Not provided'}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}


            <div className="rounded-2xl border border-[#e5e9df] bg-white p-5 sm:p-6">
                <div className="mb-5">
                    <h4 className="text-lg font-bold">Employee Directory</h4>
                    <p className="mt-1 text-sm text-[#849082]">
                        Search employees registered in your database.
                    </p>
                </div>

                <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search by name, employee number, job title or department..."
                    className="w-full rounded-lg border border-[#dce3d7] px-4 py-3 outline-none focus:border-[#286344]"
                />

                {loading ? (
                    <p className="py-10 text-center text-sm text-[#849082]">
                        Loading employees...
                    </p>
                ) : filteredEmployees.length === 0 ? (
                    <p className="py-10 text-center text-sm text-[#849082]">
                        {employees.length === 0
                            ? 'No employees registered yet.'
                            : 'No employees match your search.'}
                    </p>
                ) : (
                    <div className="mt-5 overflow-x-auto">
                        <table className="w-full min-w-212.5 text-left text-sm">
                            <thead className="bg-[#f4f7ef] text-[#526253]">
                                <tr>
                                    <th className="px-4 py-3 font-semibold">Employee</th>
                                    <th className="px-4 py-3 font-semibold">Contact</th>
                                    <th className="px-4 py-3 font-semibold">Job Title</th>
                                    <th className="px-4 py-3 font-semibold">System Role</th>
                                    <th className="px-4 py-3 font-semibold">Department</th>
                                    <th className="px-4 py-3 font-semibold">Status</th>
                                    <th className="px-4 py-3 font-semibold">Actions</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-[#edf0e9]">
                                {filteredEmployees.map((employee) => (
                                    <tr
                                        key={employee.id}
                                        className="hover:bg-[#fafbf8]"
                                    >
                                        <td className="px-4 py-4">
                                            <p className="font-semibold">
                                                {employee.firstName} {employee.surname}
                                            </p>
                                            <p className="mt-1 text-xs text-[#849082]">
                                                {employee.employeeNumber}
                                            </p>
                                        </td>

                                        <td className="px-4 py-4">
                                            <p>{employee.email}</p>
                                            <p className="mt-1 text-xs text-[#849082]">
                                                {employee.phoneNumber || 'No cellphone provided'}
                                            </p>
                                        </td>

                                        <td className="px-4 py-4">
                                            {employee.jobTitle}
                                        </td>

                                        <td className="px-4 py-4">
                                            <span className="inline-block rounded-full bg-[#e9f2e8] px-3 py-1 text-xs font-semibold text-[#174a35]">
                                                {(employee.systemRole || 'FARM_WORKER').replaceAll('_', ' ')}
                                            </span>
                                        </td>

                                        <td className="px-4 py-4">
                                            {employee.department?.name || 'Not assigned'}
                                        </td>


                                        <td className="px-4 py-4">
                                            <div className="space-y-2">
                                                <span
                                                    className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${employee.status === 'ACTIVE'
                                                            ? 'bg-green-100 text-green-800'
                                                            : employee.status === 'ON_LEAVE'
                                                                ? 'bg-amber-100 text-amber-800'
                                                                : employee.status === 'TERMINATED'
                                                                    ? 'bg-red-100 text-red-800'
                                                                    : 'bg-gray-100 text-gray-700'
                                                        }`}
                                                >
                                                    {employee.status?.replace('_', ' ') || 'Unknown'}
                                                </span>

                                                <select
                                                    value={employee.status || 'ACTIVE'}
                                                    onChange={(event) =>
                                                        handleStatusChange(employee, event.target.value)
                                                    }
                                                    aria-label={`Change status for ${employee.firstName} ${employee.surname}`}
                                                    className="block w-full rounded-lg border border-[#dce3d7] bg-white px-2 py-2 text-xs outline-none focus:border-[#286344]"
                                                >
                                                    <option value="ACTIVE">Active</option>
                                                    <option value="INACTIVE">Inactive</option>
                                                    <option value="ON_LEAVE">On Leave</option>
                                                    <option value="TERMINATED">Terminated</option>
                                                </select>
                                            </div>
                                        </td>

                                        <td className="px-4 py-4">
                                            <div className="flex flex-wrap gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedEmployee(employee)}
                                                    className="rounded-lg border border-[#dce3d7] px-3 py-2 text-sm font-semibold text-[#174a35] hover:bg-[#e9f2e8]"
                                                >
                                                    View Details
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => handleEdit(employee)}
                                                    className="rounded-lg bg-[#174a35] px-3 py-2 text-sm font-semibold text-white hover:bg-[#225b43]"
                                                >
                                                    Edit
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </section>
    )
}

export default Employees
