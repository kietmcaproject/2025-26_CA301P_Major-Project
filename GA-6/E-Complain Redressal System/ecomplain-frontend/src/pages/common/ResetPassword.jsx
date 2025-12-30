import { useState } from 'react'
import api from '../../lib/api.js'

export default function ResetPassword() {
  const [token, setToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')

  async function submit(e) {
    e.preventDefault()
    setError('')
    try {
      const { data } = await api.post('/api/auth/reset-password', { token, newPassword })
      setMsg(data.message)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password')
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: '24px auto' }}>
      <h2>Reset Password</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {msg && <p style={{ color: 'green' }}>{msg}</p>}
      <form onSubmit={submit}>
        <input placeholder="Token" value={token} onChange={(e)=>setToken(e.target.value)} required />
        <input placeholder="New password" type="password" value={newPassword} onChange={(e)=>setNewPassword(e.target.value)} required />
        <button type="submit">Reset</button>
      </form>
    </div>
  )
}


