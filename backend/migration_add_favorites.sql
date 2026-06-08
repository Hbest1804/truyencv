-- Migration: Add Favorites table (separate from bookmarks)
-- Author: Antigravity AI
-- Date: 2026-06-08

CREATE TABLE IF NOT EXISTS public.favorites (
    id              UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID         NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    story_id        UUID         NOT NULL REFERENCES public.stories(id)  ON DELETE CASCADE,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, story_id)
);

COMMENT ON TABLE public.favorites IS 'Danh sách truyện yêu thích của người dùng';

CREATE INDEX IF NOT EXISTS idx_favorites_user_id  ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_story_id ON public.favorites(story_id);

-- Enable RLS
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Xem favorite của chính mình" ON public.favorites;
CREATE POLICY "Xem favorite của chính mình"
    ON public.favorites FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Tạo favorite" ON public.favorites;
CREATE POLICY "Tạo favorite"
    ON public.favorites FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Xoá favorite của chính mình" ON public.favorites;
CREATE POLICY "Xoá favorite của chính mình"
    ON public.favorites FOR DELETE USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE OR REPLACE TRIGGER trg_favorites_updated_at
     BEFORE UPDATE ON public.favorites
     FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
