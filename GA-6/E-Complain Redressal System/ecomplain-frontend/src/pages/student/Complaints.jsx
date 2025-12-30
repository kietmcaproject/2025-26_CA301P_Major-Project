import { useEffect, useState } from 'react'
import api from '../../lib/api.js'

export default function Complaints() {
  const [list, setList] = useState([])
  const [form, setForm] = useState({ title: '', description: '', category: '' })
  const [error, setError] = useState('')

  async function load() {
    try {
      const { data } = await api.get('/api/complaints')
      setList(data.complaints)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load complaints')
    }
  }

  useEffect(() => { load() }, [])

  async function submit(e) {
    e.preventDefault()
    setError('')
    try {
      await api.post('/api/complaints', form)
      setForm({ title: '', description: '', category: '' })
      await load()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create complaint')
    }
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>Your Complaints</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={submit} style={{ marginBottom: 16 }}>
        <input placeholder="Title" value={form.title} onChange={(e)=>setForm({...form,title:e.target.value})} required />
        <input placeholder="Category" value={form.category} onChange={(e)=>setForm({...form,category:e.target.value})} />
        <textarea placeholder="Description" value={form.description} onChange={(e)=>setForm({...form,description:e.target.value})} required />
        <button type="submit">Submit</button>
      </form>
      <ul>
        {list.map((c)=> (
          <li key={c._id}>{c.title} - {c.category} - {c.status}</li>
        ))}
      </ul>
    </div>
  )
}


