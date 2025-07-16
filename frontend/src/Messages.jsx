import { useState, useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import AddFriendModal from './AddFriendModal'

const API_URL = 'https://gamehub-vnum.onrender.com'
const SOCKET_URL = API_URL

export default function Messages({ token, userId }) {
    const [friends, setFriends] = useState([])
    const [activeChat, setActiveChat] = useState(null)
    const [messages, setMessages] = useState([])
    const [messageInput, setMessageInput] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [newFriend, setNewFriend] = useState('')
    const socketRef = useRef(null)

    // Arkadaşları çek
    useEffect(() => {
        if (!token) return
        fetch(`${API_URL}/friends`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => setFriends(data.map(f => ({ id: f.friend.id, name: f.friend.username }))))
            .catch(() => setFriends([]))
    }, [token, showModal])

    // Aktif chat değişince mesajları çek
    useEffect(() => {
        if (!token || !activeChat) return
        fetch(`${API_URL}/messages?friend_id=${activeChat.id}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(setMessages)
            .catch(() => setMessages([]))
    }, [token, activeChat])

    // Socket bağlantısı ve anlık mesaj dinleme
    useEffect(() => {
        if (!userId) return
        const socket = io(SOCKET_URL)
        console.log('Socket connected:', socket.id)
        socket.emit('join', userId)
        socket.on('new_message', (msg) => {
            console.log('New message received:', msg)
            // Hem karşıdan gelen hem de kendi gönderdiğin mesajı anlık ekle
            if (activeChat && (msg.sender_id === activeChat.id || msg.sender_id === userId)) {
                setMessages(prev => [...prev, msg])
            }
        })
        socketRef.current = socket
        return () => socket.disconnect()
    }, [userId, activeChat])

    // Arkadaş ekle
    const handleAddFriend = async (e) => {
        e.preventDefault()
        if (!newFriend.trim()) return
        const res = await fetch(`${API_URL}/friends`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ friend_username: newFriend.trim() })
        })
        if (res.ok) {
            setNewFriend('')
            setShowModal(false)
            // Arkadaş listesini tekrar çekmek için useEffect tetiklenir
        } else {
            const data = await res.json()
            alert(data.error || 'Arkadaş eklenemedi!')
        }
    }

    // Mesaj gönder
    const handleSendMessage = async (e) => {
        e.preventDefault()
        if (!messageInput.trim() || !activeChat) return
        const res = await fetch(`${API_URL}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ to: activeChat.id, content: messageInput })
        })
        if (res.ok) {
            setMessageInput('')
            // Mesajlar anlık olarak socket ile eklenecek
        } else {
            const data = await res.json()
            alert(data.error || 'Mesaj gönderilemedi!')
        }
    }

    return (
        <div className="messages-section">
            <h1 className="page-title">Mesajlar</h1>
            {!activeChat && (
                <>
                    <div className="chats-list">
                        {friends.length === 0 ? <div>Arkadaş yok.</div> : friends.map(friend => (
                            <div className="chat-item" key={friend.id} onClick={() => setActiveChat(friend)}>
                                <div className="chat-avatar">{friend.name[0]}</div>
                                <div className="chat-info">
                                    <div className="chat-name">{friend.name}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="fab-btn" onClick={() => setShowModal(true)} title="Yeni Mesaj">
                        <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#646cff" /><path d="M8 12h8M12 8v8" stroke="#fff" strokeWidth="2" strokeLinecap="round" /></svg>
                    </button>
                    {showModal && (
                        <AddFriendModal
                            friends={friends}
                            newFriend={newFriend}
                            setNewFriend={setNewFriend}
                            handleAddFriend={handleAddFriend}
                            onClose={() => setShowModal(false)}
                        />
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
                        {messages.length === 0 ? <div>Mesaj yok.</div> : messages.map(msg => (
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
    )
} 