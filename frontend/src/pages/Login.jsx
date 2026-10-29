
import { useState } from 'react'

function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      if (!response.ok) {
        throw new Error('Invalid username or password.')
      }

      const data = await response.json()
      onLogin(data)
    } catch (err) {
      setError(
        err.message === 'Failed to fetch'
          ? 'Cannot connect to the server. Please try again.'
          : err.message
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f6f7f2] px-4 py-10 text-[#20392d]">
      <div className="w-full max-w-md rounded-2xl border border-[#e4e9df] bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#174a35] text-3xl font-bold text-white">
            K
          </div>

          <h1 className="text-2xl font-bold tracking-wide">
            KHENSANI
          </h1>

          <p className="mt-1 text-sm tracking-[0.18em] text-[#8b967f]">
            POULTRY MANAGEMENT
          </p>

          <p className="mt-5 text-sm text-[#849082]">
            Sign in to access your farm operations dashboard.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="username"
              className="mb-2 block text-sm font-semibold"
            >
              Username
            </label>

            <input
              id="username"
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
              autoComplete="username"
              className="w-full rounded-lg border border-[#dce3d7] px-4 py-3 outline-none focus:border-[#174a35] focus:ring-2 focus:ring-[#174a35]/10"
              placeholder="Enter your username"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-semibold"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              autoComplete="current-password"
              className="w-full rounded-lg border border-[#dce3d7] px-4 py-3 outline-none focus:border-[#174a35] focus:ring-2 focus:ring-[#174a35]/10"
              placeholder="Enter your password"
            />
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#174a35] px-4 py-3 font-semibold text-white transition hover:bg-[#103b2a] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-[#849082]">
          Growing Today. Building Tomorrow.
        </p>
      </div>
    </div>
  )
}

export default Login
