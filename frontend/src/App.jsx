import { useState } from 'react'
import './App.css'
import Login from './Login'
import Register from './Register'
import Home from './Home'

function App() {
  const [page, setPage] = useState('login')
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  if (isLoggedIn) {
    return <Home onLogout={() => { setIsLoggedIn(false); setPage('login'); }} />
  }

  return (
    <div className="auth-container">
      {page === 'login' ? (
        <Login onSwitch={() => setPage('register')} onLogin={() => setIsLoggedIn(true)} />
      ) : (
        <Register onSwitch={() => setPage('login')} />
      )}
    </div>
  )
}

export default App
