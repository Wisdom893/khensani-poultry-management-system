
import { useEffect, useState } from 'react';
import {
    getDepartments,
    createDepartment,
} from '../api/departmentService';

function Departments() {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');

    const [showForm, setShowForm] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [saving, setSaving] = useState(false);

    async function loadDepartments() {
        try {
            setLoading(true);
            setError('');

            const data = await getDepartments();
            setDepartments(data);
        } catch {
            setError('Could not load departments. Check that the backend is running.');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        let cancelled = false;

        async function fetchDepartments() {
            try {
                const data = await getDepartments();

                if (!cancelled) {
                    setDepartments(data);
                    setError('');
                }
            } catch {
                if (!cancelled) {
                    setError(
                        'Could not load departments. Check that the backend is running.'
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        fetchDepartments();

        return () => {
            cancelled = true;
        };
    }, []);

    async function handleSubmit(event) {
        event.preventDefault();

        if (!name.trim()) {
            setError('Please enter a department name.');
            return;
        }

        try {
            setSaving(true);
            setError('');

            await createDepartment({
                name: name.trim(),
                description: description.trim(),
            });

            setName('');
            setDescription('');
            setShowForm(false);

            await loadDepartments();
        } catch (err) {
            setError(err.message || 'Could not create department.');
        } finally {
            setSaving(false);
        }
    }

    const filteredDepartments = departments.filter((department) =>
        `${department.name} ${department.description || ''}`
            .toLowerCase()
            .includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-2xl font-bold text-green-950">
                        Departments
                    </h1>
                    <p className="mt-1 text-sm text-gray-600">
                        Manage the departments operating across Khensani Poultry.
                    </p>
                </div>

                <button
                    onClick={() => setShowForm(!showForm)}
                    className="rounded-lg bg-green-800 px-5 py-3 font-medium text-white hover:bg-green-900"
                >
                    {showForm ? 'Cancel' : '+ Add Department'}
                </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-green-100 bg-white p-5">
                    <p className="text-sm text-gray-500">Total Departments</p>
                    <p className="mt-2 text-3xl font-bold text-green-900">
                        {departments.length}
                    </p>
                </div>

                <div className="rounded-xl border border-green-100 bg-white p-5">
                    <p className="text-sm text-gray-500">Database Connection</p>
                    <p className="mt-2 font-semibold text-green-800">
                        {loading ? 'Connecting...' : error ? 'Check connection' : 'Connected'}
                    </p>
                </div>
            </div>

            {showForm && (
                <form
                    onSubmit={handleSubmit}
                    className="space-y-4 rounded-xl border border-green-100 bg-white p-6"
                >
                    <h2 className="text-lg font-semibold text-green-950">
                        Register Department
                    </h2>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Department Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            placeholder="e.g. Poultry Operations"
                            required
                            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-700"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(event) => setDescription(event.target.value)}
                            placeholder="Describe the department's responsibilities"
                            rows={3}
                            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-700"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        className="rounded-lg bg-green-800 px-5 py-3 font-medium text-white hover:bg-green-900 disabled:opacity-60"
                    >
                        {saving ? 'Saving...' : 'Save Department'}
                    </button>
                </form>
            )}

            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {error}
                </div>
            )}

            <div className="rounded-xl border border-green-100 bg-white p-5">
                <div className="mb-5">
                    <h2 className="text-lg font-semibold text-green-950">
                        Department List
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                        Departments are loaded from your backend and MySQL database.
                    </p>
                </div>

                <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search departments..."
                    className="mb-5 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-green-700"
                />

                {loading ? (
                    <p className="py-8 text-center text-gray-500">
                        Loading departments...
                    </p>
                ) : filteredDepartments.length === 0 ? (
                    <p className="py-8 text-center text-gray-500">
                        No departments found.
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-gray-200 text-gray-500">
                                    <th className="px-4 py-3 font-medium">Department</th>
                                    <th className="px-4 py-3 font-medium">Description</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredDepartments.map((department) => (
                                    <tr
                                        key={department.id}
                                        className="border-b border-gray-100 last:border-0"
                                    >
                                        <td className="px-4 py-4 font-medium text-green-950">
                                            {department.name}
                                        </td>
                                        <td className="px-4 py-4 text-gray-600">
                                            {department.description || 'No description provided'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Departments;
