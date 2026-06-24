// ─── API CONFIG ────────────────────────────────────────────────────────────
const API_BASE = window.location.hostname === 'localhost'
  ? 'http://localhost:8000'
  : 'https://YOUR_RAILWAY_URL'; // <-- replace after deploy

const api = {
  get: async (path) => {
    const res = await fetch(`${API_BASE}${path}`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  post: async (path, body, isForm = false) => {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: isForm ? {} : {'Content-Type': 'application/json'},
      body: isForm ? body : JSON.stringify(body)
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  del: async (path) => {
    const token = getAdminToken();
    const res = await fetch(`${API_BASE}${path}?token=${token}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }
};

// ─── ADMIN AUTH ─────────────────────────────────────────────────────────────
function getAdminToken() { return localStorage.getItem('brall_admin_token'); }
function setAdminToken(t) { localStorage.setItem('brall_admin_token', t); }
function clearAdminToken() { localStorage.removeItem('brall_admin_token'); }
function isAdmin() { return !!getAdminToken(); }

async function verifyAdmin() {
  const token = getAdminToken();
  if (!token) return false;
  try {
    const res = await api.get(`/api/admin/verify?token=${token}`);
    return res.valid;
  } catch { return false; }
}

// ─── TOAST ──────────────────────────────────────────────────────────────────
function showToast(msg, type = 'success') {
  let t = document.querySelector('.toast');
  if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
  t.className = `toast ${type}`;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3500);
}

// ─── UTILS ──────────────────────────────────────────────────────────────────
function timeAgo(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
  return d.toLocaleDateString('en-PK', { day:'numeric', month:'short', year:'numeric' });
}

function excerpt(text, len = 160) {
  if (!text) return '';
  return text.length > len ? text.slice(0, len) + '…' : text;
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-PK', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
}
