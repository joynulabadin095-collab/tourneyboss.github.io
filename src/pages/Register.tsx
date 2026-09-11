import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { Role } from '../types'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState<Role>('player')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    register(name, phone, role)
    navigate(role === 'admin' ? '/admin' : role === 'organizer' ? '/organizer' : '/player')
  }

  return (
    <div className="container" style={{ maxWidth: 380, padding: '60px 20px' }}>
      <h1>রেজিস্টার</h1>
      <form onSubmit={handleSubmit} className="card">
        <div className="field">
          <label>নাম</label>
          <input value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div className="field">
          <label>ফোন নম্বর</label>
          <input value={phone} onChange={e => setPhone(e.target.value)} required placeholder="01XXXXXXXXX" />
        </div>
        <div className="field">
          <label>তুমি কী হিসেবে যোগ দিতে চাও?</label>
          <select value={role} onChange={e => setRole(e.target.value as Role)}>
            <option value="player">Player — টুর্নামেন্টে খেলবো</option>
            <option value="organizer">Organizer — টুর্নামেন্ট হোস্ট করবো</option>
          </select>
        </div>
        <button className="btn btn-primary" type="submit" style={{ width: '100%' }}>অ্যাকাউন্ট তৈরি করো</button>
      </form>
    </div>
  )
}
