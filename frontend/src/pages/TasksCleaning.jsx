
import { useState } from 'react'

const TasksCleaning = () => {
  const [tasks, setTasks] = useState([])
  const [showForm, setShowForm] = useState(false)

  const [form, setForm] = useState({
    title: '',
    description: '',
    house: '',
    assignedTo: '',
    dueDate: '',
    priority: 'MEDIUM',
  })

  const handleChange = (e) => {
    const { name, value } = e.target

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const newTask = {
      id: Date.now(),
      ...form,
      status: 'PENDING',
    }

    setTasks((previous) => [newTask, ...previous])

    setForm({
      title: '',
      description: '',
      house: '',
      assignedTo: '',
      dueDate: '',
      priority: 'MEDIUM',
    })

    setShowForm(false)
  }

  const pendingTasks = tasks.filter(
    (task) => task.status === 'PENDING'
  ).length

  const inProgressTasks = tasks.filter(
    (task) => task.status === 'IN_PROGRESS'
  ).length

  const completedTasks = tasks.filter(
    (task) => task.status === 'COMPLETED'
  ).length

  const getStatusStyle = (status) => {
    const styles = {
      PENDING: 'bg-yellow-100 text-yellow-700',
      IN_PROGRESS: 'bg-blue-100 text-blue-700',
      COMPLETED: 'bg-green-100 text-green-700',
    }

    return styles[status] || 'bg-gray-100 text-gray-600'
  }

  const getPriorityStyle = (priority) => {
    const styles = {
      LOW: 'bg-gray-100 text-gray-600',
      MEDIUM: 'bg-orange-100 text-orange-700',
      HIGH: 'bg-red-100 text-red-700',
    }

    return styles[priority] || 'bg-gray-100 text-gray-600'
  }

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#24452F]">
            Tasks & Cleaning
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Assign, manage and monitor daily farm activities and cleaning tasks.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="bg-[#315C3B] hover:bg-[#24452F] text-white px-5 py-2.5 rounded-lg font-medium transition"
        >
          + Create Task
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Total Tasks', value: tasks.length },
          { title: 'Pending Tasks', value: pendingTasks },
          { title: 'In Progress', value: inProgressTasks },
          { title: 'Completed', value: completedTasks },
        ].map((item) => (
          <div
            key={item.title}
            className="bg-white border border-[#E8E5D9] rounded-xl p-5 shadow-sm"
          >
            <p className="text-sm text-gray-500">{item.title}</p>
            <h2 className="text-3xl font-bold text-[#315C3B] mt-2">
              {item.value}
            </h2>
          </div>
        ))}
      </div>

      {/* Create Task Form */}
      {showForm && (
        <div className="bg-white border border-[#E8E5D9] rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-[#24452F]">
                Create New Task
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Enter the details of the farm task.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-gray-400 hover:text-red-500 text-xl"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Task Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. Clean poultry house"
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-[#315C3B]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Poultry House *
                </label>
                <input
                  type="text"
                  name="house"
                  value={form.house}
                  onChange={handleChange}
                  placeholder="e.g. House 01"
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-[#315C3B]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assign To *
                </label>
                <input
                  type="text"
                  name="assignedTo"
                  value={form.assignedTo}
                  onChange={handleChange}
                  placeholder="Enter employee name"
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-[#315C3B]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date *
                </label>
                <input
                  type="date"
                  name="dueDate"
                  value={form.dueDate}
                  onChange={handleChange}
                  min={new Date().toLocaleDateString('en-CA')}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-[#315C3B]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority *
                </label>
                <select
                  name="priority"
                  value={form.priority}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:border-[#315C3B]"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>

            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Task Description *
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe what needs to be done..."
                rows="4"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-[#315C3B] resize-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-5 py-2.5 bg-[#315C3B] hover:bg-[#24452F] text-white rounded-lg font-medium"
              >
                Create Task
              </button>
            </div>

          </form>
        </div>
      )}

      {/* Tasks Table */}
      <div className="bg-white border border-[#E8E5D9] rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-[#E8E5D9]">
          <h2 className="text-lg font-semibold text-[#24452F]">
            Farm Tasks
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            A list of assigned tasks and their current status.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#F5F5EC] text-[#315C3B]">
              <tr>
                <th className="px-5 py-4">Task</th>
                <th className="px-5 py-4">House</th>
                <th className="px-5 py-4">Assigned To</th>
                <th className="px-5 py-4">Due Date</th>
                <th className="px-5 py-4">Priority</th>
                <th className="px-5 py-4">Status</th>
              </tr>
            </thead>

            <tbody>
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-gray-400">
                    No tasks have been created yet.
                  </td>
                </tr>
              ) : (
                tasks.map((task) => (
                  <tr key={task.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-[#24452F]">
                        {task.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {task.description}
                      </p>
                    </td>
                    <td className="px-5 py-4">{task.house}</td>
                    <td className="px-5 py-4">{task.assignedTo}</td>
                    <td className="px-5 py-4">{task.dueDate}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getPriorityStyle(task.priority)}`}>
                        {task.priority.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusStyle(task.status)}`}>
                        {task.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}

export default TasksCleaning
