const express = require('express');
const fs = require('fs');
const app = express();
app.use(express.json());

// File lưu keys
const KEYS_FILE = 'keys.json';

// Load keys từ file
function loadKeys() {
  if (fs.existsSync(KEYS_FILE)) {
    return JSON.parse(fs.readFileSync(KEYS_FILE, 'utf8'));
  }
  return [];
}

// Save keys vào file
function saveKeys(keys) {
  fs.writeFileSync(KEYS_FILE, JSON.stringify(keys, null, 2));
}

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  next();
});
// API generate key
app.post('/generate', (req, res) => {
  const keys = loadKeys();
  const newKey = Math.random().toString(36).substring(2, 14).toUpperCase(); // Key 12 ký tự
  keys.push({ key: newKey, used: false, date: new Date().toISOString() });
  saveKeys(keys);
  res.json({ success: true, key: newKey });
});

// API verify key (cho Roblox)
app.post('/verify', (req, res) => {
  const { key } = req.body;
  const keys = loadKeys();
  const validKey = keys.find(k => k.key === key && !k.used);
  if (validKey) {
    validKey.used = true;
    saveKeys(keys);
    res.json({ success: true, message: 'Key hợp lệ!' });
  } else {
    res.json({ success: false, message: 'Key không hợp lệ hoặc đã dùng!' });
  }
});

// Route test
app.get('/', (req, res) => {
  res.send('Roblox Key Verifier API');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server chạy trên port ${PORT}`);
});
