export default function AddFriendModal({ friends, newFriend, setNewFriend, handleAddFriend, onClose }) {
    return (
        <div className="friends-modal" onClick={onClose}>
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
    )
} 