import { useState } from 'react'

const API_URL = 'https://gamehub-vnum.onrender.com'

export default function Register({ onSwitch, onRegister }) {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [confirm, setConfirm] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (password !== confirm) {
            alert('Şifreler eşleşmiyor!')
            return
        }
        setLoading(true)
        try {
            const res = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            })
            const data = await res.json()
            if (res.ok) {
                alert('Kayıt başarılı! Giriş yapabilirsiniz.')
                if (onRegister) onRegister(data.token)
                onSwitch() // Giriş ekranına geç
            } else {
                alert(data.error || 'Kayıt başarısız!')
            }
        } catch (err) {
            alert('Sunucu hatası!')
        }
        setLoading(false)
    }

    return (
        <form className="auth-box" onSubmit={handleSubmit}>
            <div className="auth-title">Kayıt Ol</div>
            <input
                className="auth-input"
                type="text"
                placeholder="Kullanıcı Adı"
                value={username}
                onChange={e => setUsername(e.target.value)}
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
            <button className="auth-btn" type="submit" disabled={loading}>
                {loading ? 'Kaydediliyor...' : 'Kayıt Ol'}
            </button>
            <div className="auth-switch" onClick={onSwitch}>
                Hesabın var mı? <span className="auth-link">Giriş Yap</span>
            </div>
        </form>
    )
} 