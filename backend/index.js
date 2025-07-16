const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY // Değiştirildi
);
const JWT_SECRET = process.env.JWT_SECRET;

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// Socket.io bağlantısı
io.on('connection', (socket) => {
    // Kullanıcı, frontend'den userId ile join olmalı
    socket.on('join', (userId) => {
        socket.join(userId);
    });
});

app.get('/', (req, res) => {
    res.send('GameHub Backend Çalışıyor!');
});

// Örnek: Kullanıcıları çek
app.get('/users', async (req, res) => {
    const { data, error } = await supabase.from('users').select('*');
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

// Kullanıcı kaydı (Supabase Auth yerine kendi users tablosu)
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Kullanıcı adı ve şifre gereklidir.' });
    }
    // Kullanıcı var mı kontrolü
    const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('username', username)
        .single();
    if (existingUser) {
        return res.status(400).json({ error: 'Kullanıcı adı zaten alınmış.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const { data, error } = await supabase
        .from('users')
        .insert([{ username, password: hashedPassword }])
        .select()
        .single();
    if (error) return res.status(500).json({ error: error.message });
    const token = jwt.sign({ userId: data.id, username: data.username }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token });
});

// Kullanıcı girişi (Supabase Auth yerine kendi users tablosu)
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Kullanıcı adı ve şifre gereklidir.' });
    }
    const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();
    if (error || !user) {
        return res.status(400).json({ error: 'Kullanıcı bulunamadı.' });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
        return res.status(400).json({ error: 'Şifre hatalı.' });
    }
    const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token });
});

// JWT doğrulama middleware
function verifyToken(req, res, next) {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token gerekli.' });
    }
    const token = auth.split(' ')[1];
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Geçersiz veya süresi dolmuş token.' });
        req.user = user;
        next();
    });
}

// Korumalı profil endpointi
app.get('/profile', verifyToken, async (req, res) => {
    // Kullanıcı bilgilerini users tablosundan çek
    const { data: user, error } = await supabase
        .from('users')
        .select('id,username,created_at')
        .eq('id', req.user.userId)
        .single();
    if (error || !user) return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
    res.json({ user });
});

// Arkadaş ekle (username ile)
app.post('/friends', verifyToken, async (req, res) => {
    const { friend_username } = req.body;
    if (!friend_username) return res.status(400).json({ error: 'Arkadaş kullanıcı adı gerekli.' });
    // Kullanıcıyı bul
    const { data: friendUser, error: userError } = await supabase.from('users').select('id,username').eq('username', friend_username).single();
    if (userError || !friendUser) return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
    // Çift yönlü arkadaşlık ekle
    const { data, error } = await supabase.from('friends').insert([
        { user_id: req.user.userId, friend_id: friendUser.id },
        { user_id: friendUser.id, friend_id: req.user.userId }
    ]);
    if (error) return res.status(500).json({ error: error.message });
    // Bildirim mesajı (opsiyonel)
    await supabase.from('messages').insert([
        { sender_id: req.user.userId, receiver_id: friendUser.id, content: `${req.user.username} sizi arkadaş olarak ekledi!` }
    ]);
    res.json({ success: true });
});

// Arkadaş listesini çek
app.get('/friends', verifyToken, async (req, res) => {
    const { data, error } = await supabase
        .from('friends')
        .select('id,friend:friend_id(id,username)')
        .eq('user_id', req.user.userId);
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

// Mesaj gönder
app.post('/messages', verifyToken, async (req, res) => {
    const { to, content } = req.body;
    if (!to || !content) return res.status(400).json({ error: 'Alıcı ve mesaj içeriği gerekli.' });
    const { data, error } = await supabase.from('messages').insert([
        { sender_id: req.user.userId, receiver_id: to, content }
    ]).select().single();
    if (error) return res.status(500).json({ error: error.message });
    // Mesajı karşı tarafa anlık ilet
    io.to(to).emit('new_message', data);
    res.json({ success: true });
});

// Mesajları listele (iki kullanıcı arası)
app.get('/messages', verifyToken, async (req, res) => {
    const { friend_id } = req.query;
    if (!friend_id) return res.status(400).json({ error: 'friend_id gerekli.' });
    const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${req.user.userId},receiver_id.eq.${friend_id}),and(sender_id.eq.${friend_id},receiver_id.eq.${req.user.userId})`)
        .order('created_at', { ascending: true });
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

// Kazanılan oyun ekle
app.post('/wins', verifyToken, async (req, res) => {
    const { game_name } = req.body;
    if (!game_name) return res.status(400).json({ error: 'Oyun adı gerekli.' });
    const { data, error } = await supabase.from('wins').insert([
        { user_id: req.user.userId, game_name }
    ]);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
});

// Kazanılan oyunları listele (oyun adı ve adet)
app.get('/wins', verifyToken, async (req, res) => {
    const { data, error } = await supabase
        .from('wins')
        .select('game_name, count:game_name')
        .eq('user_id', req.user.userId)
        .group('game_name');
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
    console.log(`Backend sunucu çalışıyor: http://localhost:${PORT}`);
}); 