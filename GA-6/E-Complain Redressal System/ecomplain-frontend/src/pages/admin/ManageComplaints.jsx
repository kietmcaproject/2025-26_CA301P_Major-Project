import { useEffect, useState } from 'react'
import api from '../../lib/api.js'

export default function ManageComplaints() {
  const [list, setList] = useState([])
  const [error, setError] = useState('')

  async function load() {
    try {
      const { data } = await api.get('/api/admin/complaints')
      setList(data.complaints)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load')
    }
  }

  useEffect(() => { load() }, [])

  async function updateStatus(id, status) {
    try {
      await api.post(`/api/admin/complaints/${id}/status`, { status })
      await load()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update')
    }
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>Manage Complaints</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <ul>
        {list.map((c)=> (
          <li key={c._id}>
            {c.title} - {c.status}
            <select value={c.status} onChange={(e)=>updateStatus(c._id, e.target.value)} style={{ marginLeft: 8 }}>
              {['submitted','in_progress','resolved','rejected'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </li>
        ))}
      </ul>
    </div>
  )
}


