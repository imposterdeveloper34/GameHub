import { useState } from 'react'

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
    // Mesajlar için hook'lar her zaman tanımlı olmalı
    const [showFriends, setShowFriends] = useState(false);
    const [activeChat, setActiveChat] = useState(null);
    const [newFriend, setNewFriend] = useState('');
    const [friends, setFriends] = useState([
        { id: 1, name: 'Ayşe' },
        { id: 2, name: 'Mehmet' },
        { id: 3, name: 'Zeynep' },
    ]);
    let nextFriendId = friends.length + 1;

    const chats = [
        { id: 1, name: 'Ayşe', last: 'Nasılsın?' },
        { id: 2, name: 'Mehmet', last: 'Oyun başlasın!' },
    ];

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
                        {chats.map(chat => (
                            <div className="chat-item" key={chat.id} onClick={() => setActiveChat(chat)}>
                                <div className="chat-avatar">{chat.name[0]}</div>
                                <div className="chat-info">
                                    <div className="chat-name">{chat.name}</div>
                                    <div className="chat-last">{chat.last}</div>
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
                                <div className="friends-title">Arkadaş Seç</div>
                                {friends.map(f => (
                                    <div className="friend-item" key={f.id} onClick={() => { setActiveChat(f); setShowFriends(false); }}>
                                        <div className="chat-avatar">{f.name[0]}</div>
                                        <div className="chat-name">{f.name}</div>
                                    </div>
                                ))}
                                <form className="add-friend-form" onSubmit={e => {
                                    e.preventDefault();
                                    if (newFriend.trim()) {
                                        setFriends([...friends, { id: nextFriendId++, name: newFriend.trim() }]);
                                        setNewFriend('');
                                    }
                                }}>
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
                        <div className="message-item received">Merhaba {activeChat.name}!</div>
                        <div className="message-item sent">Selam!</div>
                    </div>
                    <form className="message-form" onSubmit={e => { e.preventDefault(); }}>
                        <input className="message-input" type="text" placeholder="Mesaj yaz..." />
                        <button className="message-send-btn" type="submit">Gönder</button>
                    </form>
                </div>
            )}
        </div>
    );
    if (page === 'profile') content = (
        <div className="profile-section">
            <div className="profile-avatar-img">
                <img src="/assets/profile-photo.png" alt="Profil" />
            </div>
            <div className="profile-info">
                <div className="profile-name">Mirac Kullanıcı</div>
                <div className="profile-email">mirac@email.com</div>
            </div>
            <div className="profile-wins">
                <div className="profile-wins-title big">Kazanılan Oyunlar</div>
                <div className="profile-wins-table">
                    <div className="profile-wins-table-header">
                        <span>Oyun</span>
                        <span>Adet</span>
                    </div>
                    {wonGames.map((g, i) => (
                        <div className="profile-wins-table-row" key={i}>
                            <div className="profile-win-table-game">
                                <img src={g.img} alt={g.name} />
                                <span>{g.name}</span>
                            </div>
                            <div className="profile-win-table-count">{g.count}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )

    let topBarTitle = 'Oyunlar';
    if (page === 'messages') topBarTitle = activeChat ? (activeChat.name || 'Mesajlar') : 'Mesajlar';
    if (page === 'profile') topBarTitle = 'Profil';

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