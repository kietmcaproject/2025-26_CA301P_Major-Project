import { useState } from 'react'
import api from '../../lib/api.js'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [resp, setResp] = useState('')
  const [error, setError] = useState('')

  async function submit(e) {
    e.preventDefault()
    setError('')
    try {
      const { data } = await api.post('/api/auth/forgot-password', { email })
      setResp(`Request received. Token (dev): ${data.resetToken || 'sent via email'}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to request reset')
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: '24px auto' }}>
      <h2>Forgot Password</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {resp && <p style={{ color: 'green' }}>{resp}</p>}
      <form onSubmit={submit}>
        <input placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
        <button type="submit">Send reset link</button>
      </form>
    </div>
  )
}


