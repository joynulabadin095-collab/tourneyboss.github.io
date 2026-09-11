import { useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (login(phone)) {
      navigate('/')
    } else {
      setError('এই নম্বরে কোনো অ্যাকাউন্ট পাওয়া যায়নি।')
    }
  }

  return (
    <div className="container" style={{ maxWidth: 380, padding: '60px 20px' }}>
      <h1>লগইন</h1>
      <form onSubmit={handleSubmit} className="card">
        <div className="field">
          <label>ফোন নম্বর</label>
          <input value={phone} onChange={e => setPhone(e.target.value)} required placeholder="01XXXXXXXXX" />
        </div>
        {error && <p style={{ color: 'var(--danger)' }}>{error}</p>}
        <button className="btn btn-primary" type="submit" style={{ width: '100%' }}>লগইন করো</button>
        <p style={{ marginTop: 14, color: 'var(--text-dim)', fontSize: '0.9rem' }}>
          অ্যাকাউন্ট নেই? <Link to="/register">রেজিস্টার করো</Link>
        </p>
      </form>
    </div>
  )
}
