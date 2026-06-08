-- Migration: Add Reports table
-- Author: Antigravity AI
-- Date: 2026-06-08

CREATE TABLE IF NOT EXISTS public.reports (
    id              UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    story_id        UUID         NOT NULL REFERENCES public.stories(id)  ON DELETE CASCADE,
    reported_by     UUID         NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reason          VARCHAR(50)  NOT NULL CHECK (reason IN ('spam', 'copyright', 'inappropriate', 'wrong_category', 'other')),
    detail          TEXT         DEFAULT '',
    status          VARCHAR(20)  NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.reports IS 'Danh sách báo cáo vi phạm truyện của người dùng';

CREATE INDEX IF NOT EXISTS idx_reports_story_id ON public.reports(story_id);
CREATE INDEX IF NOT EXISTS idx_reports_reported_by ON public.reports(reported_by);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);

-- Enable RLS
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Người dùng đăng nhập được gửi báo cáo" ON public.reports;
CREATE POLICY "Người dùng đăng nhập được gửi báo cáo"
    ON public.reports FOR INSERT WITH CHECK (auth.uid() = reported_by);

DROP POLICY IF EXISTS "Người dùng xem báo cáo của chính mình" ON public.reports;
CREATE POLICY "Người dùng xem báo cáo của chính mình"
    ON public.reports FOR SELECT USING (auth.uid() = reported_by);

DROP POLICY IF EXISTS "Admin toàn quyền quản lý báo cáo" ON public.reports;
CREATE POLICY "Admin toàn quyền quản lý báo cáo"
    ON public.reports FOR ALL USING (
        auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
    );

-- Trigger for updated_at
CREATE OR REPLACE TRIGGER trg_reports_updated_at
     BEFORE UPDATE ON public.reports
     FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
