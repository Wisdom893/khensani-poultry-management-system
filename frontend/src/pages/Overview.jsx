
const summaryCards = [
  { label: 'Chicken Houses', value: '4', detail: '2, 3, 4 and 5 configured', icon: '⌂' },
  { label: 'Active Flocks', value: '6', detail: 'Across 4 chicken houses', icon: '◉' },
  { label: 'Employees', value: '28', detail: 'Across all departments', icon: '♙' },
  { label: 'Pending Tasks', value: '12', detail: '4 tasks due today', icon: '✓' },
]

const tasks = [
  { title: 'Complete morning feeding', department: 'Poultry', assignee: 'Farm Team A', time: '08:00', status: 'In progress' },
  { title: 'Clean and disinfect House 2', department: 'Cleaning', assignee: 'Cleaning Team', time: '10:00', status: 'Pending' },
  { title: 'Inspect delivery vehicle', department: 'Drivers', assignee: 'Transport Team', time: '11:30', status: 'Pending' },
  { title: 'Check feed stock levels', department: 'Inventory', assignee: 'Stock Controller', time: '13:00', status: 'Completed' },
]

function Overview({ onNavigate }) {
  return (
    <>
      <section className="overflow-hidden rounded-2xl bg-[#174a35] p-6 text-white sm:p-8">
        <p className="text-sm font-medium text-[#c6dfc5]">FARM OPERATIONS</p>
        <h3 className="mt-2 text-2xl font-bold sm:text-3xl">
          Good day, Administrator
        </h3>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#e0ebe0] sm:text-base">
          Monitor your poultry houses, coordinate your teams and keep daily
          farm operations running smoothly from one place.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={() => onNavigate('Poultry Houses')}
            className="rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-[#174a35] hover:bg-[#edf5eb]"
          >
            View poultry houses
          </button>
          <button
            onClick={() => onNavigate('Tasks & Cleaning')}
            className="rounded-lg border border-white/40 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
          >
            Manage tasks
          </button>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-[#20392d]">Farm overview</h3>
            <p className="mt-1 text-sm text-[#849082]">
              Illustrative figures for the initial dashboard
            </p>
          </div>
          <span className="rounded-full bg-[#e8f2e6] px-3 py-1 text-xs font-medium text-[#286344]">
            Demo data
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => (
            <article key={card.label} className="rounded-xl border border-[#e5e9df] bg-white p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-[#7e897b]">{card.label}</p>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf4e9] text-xl text-[#286344]">
                  {card.icon}
                </span>
              </div>
              <p className="mt-4 text-3xl font-bold">{card.value}</p>
              <p className="mt-2 text-xs text-[#879183]">{card.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.6fr_1fr]">
        <div className="overflow-hidden rounded-xl border border-[#e5e9df] bg-white">
          <div className="flex items-center justify-between border-b border-[#edf0e9] p-5">
            <div>
              <h3 className="font-bold">Department activity</h3>
              <p className="mt-1 text-xs text-[#879183]">Example task completion</p>
            </div>
            <button
              onClick={() => onNavigate('Departments')}
              className="text-sm font-semibold text-[#286344] hover:underline"
            >
              View departments
            </button>
          </div>

          <div className="space-y-5 p-5">
            {[
              { name: 'Poultry operations', completed: 75, color: 'bg-[#286344]' },
              { name: 'Cleaning & hygiene', completed: 60, color: 'bg-[#6b9460]' },
              { name: 'Inventory', completed: 85, color: 'bg-[#b68b45]' },
              { name: 'Drivers & delivery', completed: 45, color: 'bg-[#66859a]' },
            ].map((department) => (
              <div key={department.name}>
                <div className="mb-2 flex justify-between gap-3 text-sm">
                  <span className="text-[#526253]">{department.name}</span>
                  <span className="font-semibold">{department.completed}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[#edf0e9]">
                  <div
                    className={`h-full rounded-full ${department.color}`}
                    style={{ width: `${department.completed}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-[#e5e9df] bg-white p-5">
          <h3 className="font-bold">Operational reminders</h3>
          <p className="mt-1 text-xs text-[#879183]">Example items requiring attention</p>
          <div className="mt-5 space-y-4">
            <div className="rounded-lg border border-[#f0dfbd] bg-[#fff9ed] p-4">
              <p className="text-sm font-semibold text-[#805b20]">Feed stock review</p>
              <p className="mt-1 text-xs leading-5 text-[#917a53]">
                Review stock levels and reorder thresholds.
              </p>
            </div>
            <div className="rounded-lg border border-[#f0d9d5] bg-[#fff4f2] p-4">
              <p className="text-sm font-semibold text-[#8f443b]">Cleaning inspection</p>
              <p className="mt-1 text-xs leading-5 text-[#a36d66]">
                Review today's hygiene checklist submissions.
              </p>
            </div>
            <div className="rounded-lg border border-[#d9e5ed] bg-[#f2f8fc] p-4">
              <p className="text-sm font-semibold text-[#365e79]">Vehicle inspections</p>
              <p className="mt-1 text-xs leading-5 text-[#668397]">
                Confirm scheduled vehicle checks are complete.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-[#e5e9df] bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#edf0e9] p-5">
          <div>
            <h3 className="font-bold">Today's tasks</h3>
            <p className="mt-1 text-xs text-[#879183]">
              Illustrative tasks across departments
            </p>
          </div>
          <button
            onClick={() => onNavigate('Tasks & Cleaning')}
            className="rounded-lg bg-[#174a35] px-4 py-2 text-sm font-semibold text-white hover:bg-[#225b43]"
          >
            View all tasks
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-left text-sm">
            <thead className="bg-[#f8f9f5] text-xs uppercase tracking-wide text-[#849082]">
              <tr>
                <th className="px-5 py-3 font-semibold">Task</th>
                <th className="px-5 py-3 font-semibold">Department</th>
                <th className="px-5 py-3 font-semibold">Assigned to</th>
                <th className="px-5 py-3 font-semibold">Time</th>
                <th className="px-5 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edf0e9]">
              {tasks.map((task) => (
                <tr key={task.title} className="hover:bg-[#fafbf8]">
                  <td className="px-5 py-4 font-medium">{task.title}</td>
                  <td className="px-5 py-4 text-[#687668]">{task.department}</td>
                  <td className="px-5 py-4 text-[#687668]">{task.assignee}</td>
                  <td className="px-5 py-4 text-[#687668]">{task.time}</td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      task.status === 'Completed'
                        ? 'bg-[#e6f3e5] text-[#286344]'
                        : task.status === 'In progress'
                          ? 'bg-[#e8f0fc] text-[#3e6495]'
                          : 'bg-[#fff1d7] text-[#8d6425]'
                    }`}>
                      {task.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <footer className="pb-4 text-center text-xs text-[#929b8e]">
        Khensani Poultry Internal Management System · Growing Today. Building Tomorrow.
      </footer>
    </>
  )
}

export default Overview
