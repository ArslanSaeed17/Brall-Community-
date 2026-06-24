-- ═══════════════════════════════════════════════════
-- BRALL COMMUNITY — SUPABASE SETUP
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════

-- History posts
CREATE TABLE IF NOT EXISTS history_posts (
  id         BIGSERIAL PRIMARY KEY,
  title      TEXT NOT NULL,
  content    TEXT NOT NULL,
  era        TEXT,
  image_url  TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gallery items
CREATE TABLE IF NOT EXISTS gallery_items (
  id         BIGSERIAL PRIMARY KEY,
  url        TEXT NOT NULL,
  caption    TEXT,
  category   TEXT DEFAULT 'general',
  media_type TEXT DEFAULT 'image',   -- 'image' or 'video'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Public read access (no auth needed for viewers)
ALTER TABLE history_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read history" ON history_posts FOR SELECT USING (true);
CREATE POLICY "Public read gallery" ON gallery_items FOR SELECT USING (true);

-- Service role can do everything (backend uses service key)
CREATE POLICY "Service full access history" ON history_posts
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service full access gallery" ON gallery_items
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- ── STORAGE BUCKET ──────────────────────────────────────────────────────────
-- Run this separately in Supabase Storage → New Bucket:
-- Bucket name: brall-media
-- Public: YES

-- Or via SQL:
INSERT INTO storage.buckets (id, name, public)
VALUES ('brall-media', 'brall-media', true)
ON CONFLICT DO NOTHING;

CREATE POLICY "Public read media" ON storage.objects
  FOR SELECT USING (bucket_id = 'brall-media');

CREATE POLICY "Service upload media" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'brall-media' AND auth.role() = 'service_role');

CREATE POLICY "Service delete media" ON storage.objects
  FOR DELETE USING (bucket_id = 'brall-media' AND auth.role() = 'service_role');
