import { useState } from 'react'

export default function Register({ onSwitch }) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirm, setConfirm] = useState('')

    const handleSubmit = (e) => {
        e.preventDefault()
        if (password !== confirm) {
            alert('Şifreler eşleşmiyor!')
            return
        }
        // Kayıt işlemi burada yapılacak
        alert('Kayıt başarılı!')
    }

    return (
        <form className="auth-box" onSubmit={handleSubmit}>
            <div className="auth-title">Kayıt Ol</div>
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
            <input
                className="auth-input"
                type="password"
                placeholder="Şifreyi Onayla"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
            />
            <button className="auth-btn" type="submit">Kayıt Ol</button>
            <div className="auth-switch" onClick={onSwitch}>
                Hesabın var mı? <span className="auth-link">Giriş Yap</span>
            </div>
        </form>
    )
} 