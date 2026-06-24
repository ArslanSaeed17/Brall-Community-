# 🏛️ Brall Community Website

A full-stack community heritage website for the **Brall Community** — preserving history, photos, and videos with an admin panel.

**Stack:** FastAPI + Supabase + Vanilla HTML/CSS/JS  
**Deploy:** Railway (backend) + Vercel (frontend)

---

## 📁 Project Structure

```
brall-community/
├── backend/
│   ├── main.py              ← FastAPI app
│   ├── requirements.txt
│   ├── railway.toml
│   └── .env.example
├── frontend/
│   ├── index.html           ← Home
│   ├── history.html         ← History page
│   ├── gallery.html         ← Gallery page
│   ├── contact.html         ← Contact page
│   ├── css/main.css
│   ├── js/api.js
│   ├── js/main.js
│   ├── admin/
│   │   ├── login.html
│   │   └── dashboard.html
│   └── vercel.json
└── supabase_setup.sql
```

---

## 🚀 Setup Steps

### 1. Supabase
1. Go to [supabase.com](https://supabase.com) → New Project
2. Open **SQL Editor** → paste `supabase_setup.sql` → Run
3. Go to **Settings → API** → copy:
   - `Project URL` → `SUPABASE_URL`
   - `service_role` key → `SUPABASE_SERVICE_KEY`

### 2. Backend → Railway
1. Push `backend/` folder to a GitHub repo
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Add environment variables:
   ```
   SUPABASE_URL=https://xxx.supabase.co
   SUPABASE_SERVICE_KEY=eyJhbGc...
   ADMIN_PASSWORD=your_strong_password
   ADMIN_TOKEN=any_random_secret_string
   ```
4. Deploy → copy your Railway URL (e.g. `https://brall.up.railway.app`)

### 3. Frontend → Vercel
1. Open `frontend/js/api.js`
2. Replace `YOUR_RAILWAY_URL` with your Railway URL:
   ```js
   : 'https://brall.up.railway.app'
   ```
3. Push `frontend/` to GitHub → connect to [vercel.com](https://vercel.com)
4. Deploy!

---

## 🔐 Admin Access
- URL: `your-domain.vercel.app/admin/login.html`
- Password: whatever you set as `ADMIN_PASSWORD`

---

## ✨ Features
- **Home** — Animated hero (canvas particles + geometric pattern), stats counter, latest posts preview
- **History** — Era-filtered articles with images, scroll-reveal animations
- **Gallery** — Masonry grid, category filters, lightbox for images & videos
- **Admin Panel** — Upload history posts (text + image), upload gallery (images/videos), delete items
- **Contact** — WhatsApp-integrated contact form
- **Design** — Navy + Gold palette, Playfair Display typography, glassmorphism, smooth animations

---

## 🎨 Design Tokens
| Token | Value |
|-------|-------|
| Navy bg | `#0A0E1A` |
| Gold accent | `#C9A84C` |
| Cream text | `#F5EDD6` |
| Card bg | `#1E2640` |
| Display font | Playfair Display |
| Body font | Inter |
