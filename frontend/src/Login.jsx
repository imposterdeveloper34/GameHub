import { useState } from 'react'

const API_URL = 'https://gamehub-vnum.onrender.com'

export default function Login({ onSwitch, onLogin }) {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            })
            const data = await res.json()
            if (res.ok) {
                if (onLogin) onLogin(data.token)
                // Başarılı girişte yönlendirme işlemi burada yapılabilir
            } else {
                alert(data.error || 'Giriş başarısız!')
            }
        } catch (err) {
            alert('Sunucu hatası!')
        }
        setLoading(false)
    }

    return (
        <form className="auth-box" onSubmit={handleSubmit}>
            <div className="auth-title">Giriş Yap</div>
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
            <button className="auth-btn" type="submit" disabled={loading}>
                {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
            </button>
            <div className="auth-switch" onClick={onSwitch}>
                Hesabın yok mu? <span className="auth-link">Kayıt Ol</span>
            </div>
        </form>
    )
} 