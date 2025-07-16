import { useState, useEffect } from 'react'
import './App.css'
import Login from './Login'
import Register from './Register'
import Home from './Home'

function App() {
  const [page, setPage] = useState('login')
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'))

  // Otomatik giriş için effect
  useEffect(() => {
    if (localStorage.getItem('token')) setIsLoggedIn(true)
  }, [])

  const handleLogin = (token) => {
    localStorage.setItem('token', token)
    setIsLoggedIn(true)
  }
  const handleLogout = () => {
    localStorage.removeItem('token')
    setIsLoggedIn(false)
    setPage('login')
  }

  if (isLoggedIn) {
    return <Home onLogout={handleLogout} />
  }

  return (
    <div className="auth-container">
      {page === 'login' ? (
        <Login onSwitch={() => setPage('register')} onLogin={handleLogin} />
      ) : (
        <Register onSwitch={() => setPage('login')} onRegister={handleLogin} />
      )}
    </div>
  )
}

export default App
