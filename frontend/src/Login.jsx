import { useState } from 'react'

export default function Login({ onSwitch, onLogin }) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const handleSubmit = (e) => {
        e.preventDefault()
        // Giriş işlemi burada yapılacak
        onLogin()
    }

    return (
        <form className="auth-box" onSubmit={handleSubmit}>
            <div className="auth-title">Giriş Yap</div>
            <input
                className="auth-input"
                type="email"
                placeholder="E-posta"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
            />
            <input
                className="auth-input"
                type="password"
                placeholder="Şifre"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
            />
            <button className="auth-btn" type="submit">Giriş Yap</button>
            <div className="auth-switch" onClick={onSwitch}>
                Hesabın yok mu? <span className="auth-link">Kayıt Ol</span>
            </div>
        </form>
    )
} 