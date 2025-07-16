import { useState, useEffect, useRef } from 'react'
import { io } from 'socket.io-client'

const API_URL = 'https://gamehub-vnum.onrender.com'
const SOCKET_URL = API_URL

function TopBar({ title }) {
    return (
        <header className="top-bar">
            <span className="top-bar-title">{title}</span>
        </header>
    )
}

function BottomNav({ onLogout, current, onNavigate }) {
    return (
        <nav className="bottom-nav">
            <button className={current === 'home' ? 'nav-btn active' : 'nav-btn'} onClick={() => onNavigate('home')} aria-label="Ana Sayfa">
                <svg width="26" height="26" fill="none" viewBox="0 0 24 24"><path d="M3 11.5L12 4l9 7.5V20a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-4h-4v4a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V11.5z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></svg>
            </button>
            <button className={current === 'messages' ? 'nav-btn active' : 'nav-btn'} onClick={() => onNavigate('messages')} aria-label="Mesajlar">
                <svg width="26" height="26" fill="none" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></svg>
            </button>
            <button className={current === 'profile' ? 'nav-btn active' : 'nav-btn'} onClick={() => onNavigate('profile')} aria-label="Profil">
                <svg width="26" height="26" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" /><path d="M4 20c0-2.5 3.5-4 8-4s8 1.5 8 4" stroke="currentColor" strokeWidth="2" /></svg>
            </button>
            <button className="nav-btn" onClick={onLogout} aria-label="Çıkış Yap">
                <svg width="26" height="26" fill="none" viewBox="0 0 24 24"><path d="M16 17l5-5-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M4 4v16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            </button>
        </nav>
    )
}

function GameGridCard({ title, bg, onClick }) {
    return (
        <div className="game-grid-card" onClick={onClick}>
            <div className="game-grid-bg" style={{ backgroundImage: `url(${bg})` }} />
            <div className="game-grid-title">{title}</div>
        </div>
    )
}

const games = [
    { title: 'Word Imposter', bg: '/assets/word-imposter-bg.png' },
    // Yeni oyunlar eklenebilir
]

const wonGames = [
    { name: 'Word Imposter', img: '/assets/word-imposter-bg.png', count: 5 }
];

export default function Home({ onLogout }) {
    const [page, setPage] = useState('home')
    // MESAJLAR STATE
    const [friends, setFriends] = useState([])
    const [chats, setChats] = useState([]) // Arkadaşlar ile son mesajlar
    const [activeChat, setActiveChat] = useState(null)
    const [messages, setMessages] = useState([])
    const [messageInput, setMessageInput] = useState('')
    const [showFriends, setShowFriends] = useState(false)
    const [newFriend, setNewFriend] = useState('')
    const [messagesLoading, setMessagesLoading] = useState(false)
    const [friendsLoading, setFriendsLoading] = useState(false)
    const [profile, setProfile] = useState(null)
    const [profileLoading, setProfileLoading] = useState(true)
    const [wins, setWins] = useState([])

    const socketRef = useRef(null)
    // Kullanıcı id'sini localStorage'dan veya profile'dan al
    const userId = profile?.id
    // Socket bağlantısı
    useEffect(() => {
        if (!userId) return;
        if (socketRef.current) return;
        const socket = io(SOCKET_URL)
        socket.emit('join', userId)
        socket.on('new_message', (msg) => {
            // Eğer aktif chat bu kullanıcı ise anlık ekle
            if (activeChat && msg.sender_id === activeChat.id) {
                setMessages(prev => [...prev, msg])
            }
        })
        socketRef.current = socket
        return () => {
            socket.disconnect()
            socketRef.current = null
        }
    }, [userId, activeChat])

    let content = null
    if (page === 'home') content = (
        <div className="games-grid-section">
            <div className="games-grid">
                {games.map((g, i) => (
                    <GameGridCard key={i} title={g.title} bg={g.bg} onClick={() => alert(g.title + ' seçildi!')} />
                ))}
            </div>
        </div>
    )
    if (page === 'messages') content = (
        <div className="messages-section">
            <h1 className="page-title">Mesajlar</h1>
            {!activeChat && (
                <>
                    <div className="chats-list">
                        {friendsLoading ? <div>Yükleniyor...</div> : friends.length === 0 ? <div>Arkadaş yok.</div> : friends.map(friend => (
                            <div className="chat-item" key={friend.id} onClick={() => setActiveChat(friend)}>
                                <div className="chat-avatar">{friend.name[0]}</div>
                                <div className="chat-info">
                                    <div className="chat-name">{friend.name}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="fab-btn" onClick={() => setShowFriends(true)} title="Yeni Mesaj">
                        <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#646cff" /><path d="M8 12h8M12 8v8" stroke="#fff" strokeWidth="2" strokeLinecap="round" /></svg>
                    </button>
                    {showFriends && (
                        <div className="friends-modal" onClick={() => setShowFriends(false)}>
                            <div className="friends-list" onClick={e => e.stopPropagation()}>
                                <div className="friends-title">Arkadaş Ekle</div>
                                {friends.map(f => (
                                    <div className="friend-item" key={f.id}>
                                        <div className="chat-avatar">{f.name[0]}</div>
                                        <div className="chat-name">{f.name}</div>
                                    </div>
                                ))}
                                <form className="add-friend-form" onSubmit={handleAddFriend}>
                                    <input className="add-friend-input" type="text" placeholder="Kullanıcı adı..." value={newFriend} onChange={e => setNewFriend(e.target.value)} />
                                    <button className="add-friend-btn" type="submit">Ekle</button>
                                </form>
                            </div>
                        </div>
                    )}
                </>
            )}
            {activeChat && (
                <div className="messages-chat">
                    <div className="chat-header">
                        <button className="chat-back-btn" onClick={() => setActiveChat(null)}>&larr;</button>
                        <div className="chat-avatar">{activeChat.name[0]}</div>
                        <div className="chat-name">{activeChat.name}</div>
                    </div>
                    <div className="messages-list">
                        {messagesLoading ? <div>Yükleniyor...</div> : messages.length === 0 ? <div>Mesaj yok.</div> : messages.map(msg => (
                            <div key={msg.id} className={msg.sender_id === activeChat.id ? 'message-item received' : 'message-item sent'}>
                                {msg.content}
                            </div>
                        ))}
                    </div>
                    <form className="message-form" onSubmit={handleSendMessage}>
                        <input className="message-input" type="text" placeholder="Mesaj yaz..." value={messageInput} onChange={e => setMessageInput(e.target.value)} />
                        <button className="message-send-btn" type="submit">Gönder</button>
                    </form>
                </div>
            )}
        </div>
    );
    if (page === 'profile') content = (
        <div className="profile-section">
            {profileLoading ? (
                <div>Yükleniyor...</div>
            ) : profile ? (
                <>
                    <div className="profile-avatar-img">
                        <img src="/assets/profile-photo.png" alt="Profil" />
                    </div>
                    <div className="profile-info">
                        <div className="profile-name">{profile.username}</div>
                        <div className="profile-email">ID: {profile.id}</div>
                        <div className="profile-date">Kayıt: {new Date(profile.created_at).toLocaleString()}</div>
                    </div>
                    <div className="profile-wins">
                        <div className="profile-wins-title big">Kazanılan Oyunlar</div>
                        <div className="profile-wins-table">
                            <div className="profile-wins-table-header">
                                <span>Oyun</span>
                                <span>Adet</span>
                            </div>
                            {wins.length === 0 && <div>Henüz kazanılan oyun yok.</div>}
                            {wins.map((g, i) => (
                                <div className="profile-wins-table-row" key={i}>
                                    <div className="profile-win-table-game">
                                        <span>{g.game_name}</span>
                                    </div>
                                    <div className="profile-win-table-count">{g.count}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            ) : (
                <div>Profil bulunamadı.</div>
            )}
        </div>
    )

    let topBarTitle = 'Oyunlar';
    if (page === 'messages') topBarTitle = activeChat ? (activeChat.name || 'Mesajlar') : 'Mesajlar';
    if (page === 'profile') topBarTitle = 'Profil';

    // PROFIL VERISI CEKME
    useEffect(() => {
        if (page !== 'profile') return;
        const token = localStorage.getItem('token')
        if (!token) return;
        setProfileLoading(true)
        fetch(`${API_URL}/profile`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => setProfile(data.user))
            .catch(() => setProfile(null))
        fetch(`${API_URL}/wins`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => setWins(data))
            .catch(() => setWins([]))
            .finally(() => setProfileLoading(false))
    }, [page])

    // Arkadaşları çek
    useEffect(() => {
        if (page !== 'messages') return;
        const token = localStorage.getItem('token')
        if (!token) return;
        setFriendsLoading(true)
        fetch(`${API_URL}/friends`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => setFriends(data.map(f => ({ id: f.friend.id, name: f.friend.username }))))
            .catch(() => setFriends([]))
            .finally(() => setFriendsLoading(false))
    }, [page])
    // Aktif chat değişince mesajları çek
    useEffect(() => {
        if (!activeChat) return;
        const token = localStorage.getItem('token')
        if (!token) return;
        setMessagesLoading(true)
        fetch(`${API_URL}/messages?friend_id=${activeChat.id}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => setMessages(data))
            .catch(() => setMessages([]))
            .finally(() => setMessagesLoading(false))
    }, [activeChat])
    // Arkadaş ekle
    const handleAddFriend = async (e) => {
        e.preventDefault();
        if (!newFriend.trim()) return;
        const token = localStorage.getItem('token')
        if (!token) return;
        const res = await fetch(`${API_URL}/friends`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ friend_username: newFriend.trim() })
        })
        if (res.ok) {
            setNewFriend('');
            // Arkadaş listesini tekrar çek
            fetch(`${API_URL}/friends`, {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(res => res.json())
                .then(data => setFriends(data.map(f => ({ id: f.friend.id, name: f.friend.username }))))
        } else {
            const data = await res.json();
            alert(data.error || 'Arkadaş eklenemedi!')
        }
    }
    // Mesaj gönder
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!messageInput.trim() || !activeChat) return;
        const token = localStorage.getItem('token')
        if (!token) return;
        const res = await fetch(`${API_URL}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ to: activeChat.id, content: messageInput })
        })
        if (res.ok) {
            setMessageInput('');
            // Mesajları tekrar çek
            fetch(`${API_URL}/messages?friend_id=${activeChat.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(res => res.json())
                .then(data => setMessages(data))
        } else {
            const data = await res.json();
            alert(data.error || 'Mesaj gönderilemedi!')
        }
    }

    return (
        <div className="layout">
            <TopBar title={topBarTitle} />
            <div className="layout-content">
                {content}
            </div>
            <BottomNav onLogout={onLogout} current={page} onNavigate={setPage} />
        </div>
    )
} 