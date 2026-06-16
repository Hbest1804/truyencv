-- ============================================================
--  SUPABASE SCHEMA - NỀN TẢNG ĐỌC TRUYỆN ONLINE
--  Phiên bản: 1.0.0
--  Ngày tạo: 2026-06-01
-- ============================================================
-- Mô tả: Schema đầy đủ cho web đọc truyện với các tính năng:
--   - Quản lý truyện, chương, thể loại
--   - Hệ thống tài khoản người dùng (Supabase Auth)
--   - Bình luận & trả lời
--   - Theo dõi truyện (bookmark)
--   - Lịch sử đọc & tiến trình đọc
--   - Bảng xếp hạng (views)
--   - Đánh giá & rating
-- ============================================================

-- Bật extension cần thiết
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Hỗ trợ tìm kiếm full-text nhanh hơn

-- ============================================================
-- 1. BẢNG PROFILES (Mở rộng từ auth.users của Supabase)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username        VARCHAR(50)  UNIQUE NOT NULL,
    display_name    VARCHAR(100),
    avatar_url      TEXT,
    bio             TEXT,
    role            VARCHAR(20)  NOT NULL DEFAULT 'reader'
                        CHECK (role IN ('reader', 'author', 'moderator', 'admin')),
    is_banned       BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.profiles IS 'Thông tin mở rộng của người dùng, liên kết với Supabase Auth';
COMMENT ON COLUMN public.profiles.role IS 'reader: độc giả | author: tác giả | moderator: kiểm duyệt | admin: quản trị';

-- ============================================================
-- 2. BẢNG GENRES (Thể loại truyện)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.genres (
    id          SERIAL       PRIMARY KEY,
    name        VARCHAR(80)  UNIQUE NOT NULL,  -- VD: Tiên Hiệp, Kiếm Hiệp
    slug        VARCHAR(80)  UNIQUE NOT NULL,  -- VD: tien-hiep, kiem-hiep
    description TEXT,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.genres IS 'Danh sách các thể loại / tag của truyện';

-- ============================================================
-- 3. BẢNG STORIES (Truyện)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.stories (
    id              UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id       UUID         NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
    title           VARCHAR(255) NOT NULL,
    slug            VARCHAR(255) UNIQUE NOT NULL,   -- URL-friendly title
    cover_url       TEXT,
    description     TEXT,                           -- Mô tả ngắn (hiển thị card)
    synopsis        TEXT,                           -- Tóm tắt nội dung đầy đủ
    status          VARCHAR(20)  NOT NULL DEFAULT 'ongoing'
                        CHECK (status IN ('ongoing', 'completed', 'hiatus', 'dropped')),
    is_published    BOOLEAN      NOT NULL DEFAULT FALSE,
    chapter_count   INT          NOT NULL DEFAULT 0,
    view_count      BIGINT       NOT NULL DEFAULT 0,
    bookmark_count  INT          NOT NULL DEFAULT 0,
    rating_avg      NUMERIC(3,2) NOT NULL DEFAULT 0.00
                        CHECK (rating_avg >= 0 AND rating_avg <= 5),
    rating_count    INT          NOT NULL DEFAULT 0,
    word_count      BIGINT       NOT NULL DEFAULT 0,
    featured        BOOLEAN      NOT NULL DEFAULT FALSE,  -- Truyện nổi bật (hero section)
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    published_at    TIMESTAMPTZ
);

COMMENT ON TABLE public.stories IS 'Bảng chính lưu thông tin truyện';
COMMENT ON COLUMN public.stories.status IS 'ongoing: đang ra | completed: hoàn | hiatus: tạm ngưng | dropped: drop';
COMMENT ON COLUMN public.stories.featured IS 'TRUE = hiển thị ở Hero Section trang chủ';

-- Index tìm kiếm và sắp xếp phổ biến
CREATE INDEX IF NOT EXISTS idx_stories_author      ON public.stories(author_id);
CREATE INDEX IF NOT EXISTS idx_stories_status      ON public.stories(status);
CREATE INDEX IF NOT EXISTS idx_stories_featured    ON public.stories(featured) WHERE featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_stories_view_count  ON public.stories(view_count DESC);
CREATE INDEX IF NOT EXISTS idx_stories_updated_at  ON public.stories(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_stories_title_trgm  ON public.stories USING gin(title gin_trgm_ops);

-- ============================================================
-- 4. BẢNG STORY_GENRES (Quan hệ N-N: Truyện - Thể loại)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.story_genres (
    story_id   UUID    NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
    genre_id   INT     NOT NULL REFERENCES public.genres(id)  ON DELETE CASCADE,
    PRIMARY KEY (story_id, genre_id)
);

COMMENT ON TABLE public.story_genres IS 'Quan hệ nhiều-nhiều giữa truyện và thể loại';

-- ============================================================
-- 5. BẢNG CHAPTERS (Chương truyện)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.chapters (
    id              UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    story_id        UUID         NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
    chapter_number  INT          NOT NULL,           -- Số thứ tự chương: 1, 2, 3...
    title           VARCHAR(500) NOT NULL,
    content         TEXT         NOT NULL,            -- Nội dung chương (toàn bộ text)
    word_count      INT          NOT NULL DEFAULT 0,
    view_count      INT          NOT NULL DEFAULT 0,
    is_published    BOOLEAN      NOT NULL DEFAULT FALSE,
    is_free         BOOLEAN      NOT NULL DEFAULT TRUE,  -- FALSE = chương VIP (trả phí)
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    published_at    TIMESTAMPTZ,
    UNIQUE (story_id, chapter_number)
);

COMMENT ON TABLE public.chapters IS 'Nội dung từng chương của truyện';
COMMENT ON COLUMN public.chapters.is_free IS 'TRUE = miễn phí | FALSE = cần coin/VIP để đọc';

CREATE INDEX IF NOT EXISTS idx_chapters_story_id        ON public.chapters(story_id);
CREATE INDEX IF NOT EXISTS idx_chapters_story_number    ON public.chapters(story_id, chapter_number);
CREATE INDEX IF NOT EXISTS idx_chapters_published       ON public.chapters(story_id, published_at DESC)
    WHERE is_published = TRUE;

-- ============================================================
-- 6. BẢNG BOOKMARKS (Theo dõi truyện)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.bookmarks (
    id              UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID         NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    story_id        UUID         NOT NULL REFERENCES public.stories(id)  ON DELETE CASCADE,
    last_chapter_id UUID         REFERENCES public.chapters(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, story_id)
);

COMMENT ON TABLE public.bookmarks IS 'Danh sách truyện đang theo dõi của người dùng';
COMMENT ON COLUMN public.bookmarks.last_chapter_id IS 'Chương đang đọc dở, để tiếp tục đọc';

CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id  ON public.bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_story_id ON public.bookmarks(story_id);

-- ============================================================
-- 6b. BẢNG FAVORITES (Yêu thích truyện)
-- ============================================================
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

-- ============================================================
-- 7. BẢNG READING_HISTORY (Lịch sử đọc)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.reading_history (
    id          UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID         NOT NULL REFERENCES public.profiles(id)  ON DELETE CASCADE,
    story_id    UUID         NOT NULL REFERENCES public.stories(id)   ON DELETE CASCADE,
    chapter_id  UUID         NOT NULL REFERENCES public.chapters(id)  ON DELETE CASCADE,
    progress    SMALLINT     NOT NULL DEFAULT 0
                    CHECK (progress >= 0 AND progress <= 100), -- % cuộn trang
    read_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, chapter_id)
);

COMMENT ON TABLE public.reading_history IS 'Lịch sử và tiến trình đọc của người dùng theo chương';
COMMENT ON COLUMN public.reading_history.progress IS 'Phần trăm đã cuộn (0-100%)';

CREATE INDEX IF NOT EXISTS idx_reading_history_user    ON public.reading_history(user_id, read_at DESC);
CREATE INDEX IF NOT EXISTS idx_reading_history_story   ON public.reading_history(user_id, story_id);

-- ============================================================
-- 8. BẢNG RATINGS (Đánh giá truyện)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.ratings (
    id          UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID         NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    story_id    UUID         NOT NULL REFERENCES public.stories(id)  ON DELETE CASCADE,
    score       SMALLINT     NOT NULL CHECK (score BETWEEN 1 AND 5),
    review      TEXT,                   -- Bình luận đánh giá (tùy chọn)
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, story_id)
);

COMMENT ON TABLE public.ratings IS 'Đánh giá sao và review của người dùng cho truyện';

CREATE INDEX IF NOT EXISTS idx_ratings_story_id ON public.ratings(story_id);

-- ============================================================
-- 9. BẢNG COMMENTS (Bình luận)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.comments (
    id          UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID         NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    story_id    UUID         NOT NULL REFERENCES public.stories(id)  ON DELETE CASCADE,
    chapter_id  UUID         REFERENCES public.chapters(id) ON DELETE CASCADE,  -- NULL = bình luận truyện
    parent_id   UUID         REFERENCES public.comments(id) ON DELETE CASCADE,  -- NULL = comment gốc, có giá trị = reply
    content     TEXT         NOT NULL,
    like_count  INT          NOT NULL DEFAULT 0,
    is_hidden   BOOLEAN      NOT NULL DEFAULT FALSE,  -- Bị kiểm duyệt ẩn
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.comments IS 'Bình luận của người dùng, hỗ trợ reply (parent_id)';
COMMENT ON COLUMN public.comments.chapter_id IS 'NULL = bình luận cho cả truyện | có giá trị = bình luận chương cụ thể';
COMMENT ON COLUMN public.comments.parent_id  IS 'NULL = comment gốc | có giá trị = reply của comment khác';

CREATE INDEX IF NOT EXISTS idx_comments_story_id    ON public.comments(story_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_chapter_id  ON public.comments(chapter_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id   ON public.comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id     ON public.comments(user_id);

-- ============================================================
-- 10. BẢNG COMMENT_LIKES (Thích bình luận)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.comment_likes (
    user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    comment_id  UUID NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, comment_id)
);

COMMENT ON TABLE public.comment_likes IS 'Người dùng thích bình luận (like)';

-- ============================================================
-- 11. BẢNG STORY_VIEWS (Lượt xem theo ngày - để bảng xếp hạng)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.story_views (
    id          BIGSERIAL    PRIMARY KEY,
    story_id    UUID         NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
    user_id     UUID         REFERENCES public.profiles(id) ON DELETE SET NULL, -- NULL = khách vãng lai
    chapter_id  UUID         REFERENCES public.chapters(id) ON DELETE SET NULL,
    ip_hash     VARCHAR(64),  -- Hash của IP để dedup khách vãng lai
    viewed_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.story_views IS 'Log từng lượt xem để tính bảng xếp hạng tuần/tháng';
COMMENT ON COLUMN public.story_views.ip_hash IS 'SHA-256 hash của IP, dùng để chống view ảo từ khách vãng lai';

CREATE INDEX IF NOT EXISTS idx_story_views_story_date ON public.story_views(story_id, viewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_story_views_date        ON public.story_views(viewed_at DESC);

-- ============================================================
-- 12. BẢNG NOTIFICATIONS (Thông báo)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id          UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID         NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type        VARCHAR(50)  NOT NULL
                    CHECK (type IN ('new_chapter', 'comment_reply', 'new_follower', 'story_completed', 'system')),
    title       VARCHAR(255) NOT NULL,
    body        TEXT,
    link_url    TEXT,         -- Đường dẫn khi bấm vào thông báo
    is_read     BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.notifications IS 'Thông báo gửi đến người dùng';
COMMENT ON COLUMN public.notifications.type IS
    'new_chapter: chương mới | comment_reply: có người reply | new_follower: theo dõi mới | story_completed: truyện hoàn | system: hệ thống';

CREATE INDEX IF NOT EXISTS idx_notifications_user     ON public.notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread   ON public.notifications(user_id) WHERE is_read = FALSE;

-- ============================================================
-- 12b. BẢNG REPORTS (Báo cáo vi phạm)
-- ============================================================
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

-- ============================================================
-- TRIGGERS & FUNCTIONS
-- ============================================================

-- Tự động cập nhật cột updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Gắn trigger updated_at cho các bảng cần thiết
DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOREACH tbl IN ARRAY ARRAY['profiles','stories','chapters','bookmarks','favorites','ratings','comments','reports']
    LOOP
        EXECUTE format(
            'CREATE OR REPLACE TRIGGER trg_%s_updated_at
             BEFORE UPDATE ON public.%s
             FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()',
            tbl, tbl
        );
    END LOOP;
END $$;

-- -----------------------------------------------
-- Tự động tạo profile khi user đăng ký (Auth hook)
-- -----------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_username VARCHAR(50);
    v_display_name VARCHAR(100);
BEGIN
    v_username := COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1), 'user_' || substr(NEW.id::text, 1, 8));
    v_display_name := COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1), 'User ' || substr(NEW.id::text, 1, 8));

    -- Truncate to fit VARCHAR limits
    v_username := substring(v_username from 1 for 50);
    v_display_name := substring(v_display_name from 1 for 100);

    BEGIN
        INSERT INTO public.profiles (id, username, display_name, avatar_url, role)
        VALUES (
            NEW.id,
            v_username,
            v_display_name,
            NEW.raw_user_meta_data->>'avatar_url',
            'reader'
        );
    EXCEPTION WHEN unique_violation THEN
        -- Fallback to a guaranteed unique username using UUID
        v_username := 'user_' || substr(NEW.id::text, 1, 8);
        INSERT INTO public.profiles (id, username, display_name, avatar_url, role)
        VALUES (
            NEW.id,
            v_username,
            v_display_name,
            NEW.raw_user_meta_data->>'avatar_url',
            'reader'
        );
    END;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


CREATE OR REPLACE TRIGGER trg_on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- -----------------------------------------------
-- Ngăn chặn thay đổi vai trò (role) hoặc trạng thái bị ban (is_banned) từ phía client
-- -----------------------------------------------
CREATE OR REPLACE FUNCTION public.protect_profile_roles()
RETURNS TRIGGER AS $$
BEGIN
    IF (NEW.role IS DISTINCT FROM OLD.role OR NEW.is_banned IS DISTINCT FROM OLD.is_banned) THEN
        -- Chỉ cho phép thay đổi nếu được thực hiện bởi superuser (postgres) hoặc qua service_role (bypassing RLS)
        IF NOT (
            current_user = 'postgres' OR
            current_setting('role', true) IN ('postgres', 'service_role') OR
            coalesce(current_setting('request.jwt.claims', true)::jsonb ->> 'role', '') = 'service_role' OR
            auth.role() = 'service_role'
        ) THEN
            RAISE EXCEPTION 'Bạn không có quyền thay đổi vai trò (role) hoặc trạng thái bị ban (is_banned)';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_protect_profile_roles ON public.profiles;
CREATE TRIGGER trg_protect_profile_roles
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.protect_profile_roles();

-- -----------------------------------------------
-- Cập nhật chapter_count khi thêm/xoá chương
-- -----------------------------------------------
CREATE OR REPLACE FUNCTION public.update_story_chapter_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.is_published THEN
        UPDATE public.stories
        SET chapter_count = chapter_count + 1,
            updated_at    = NOW()
        WHERE id = NEW.story_id;
    ELSIF TG_OP = 'DELETE' AND OLD.is_published THEN
        UPDATE public.stories
        SET chapter_count = GREATEST(chapter_count - 1, 0),
            updated_at    = NOW()
        WHERE id = OLD.story_id;
    ELSIF TG_OP = 'UPDATE' AND NEW.is_published <> OLD.is_published THEN
        UPDATE public.stories
        SET chapter_count = chapter_count + CASE WHEN NEW.is_published THEN 1 ELSE -1 END,
            updated_at    = NOW()
        WHERE id = NEW.story_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_chapter_count
    AFTER INSERT OR UPDATE OF is_published OR DELETE ON public.chapters
    FOR EACH ROW EXECUTE FUNCTION public.update_story_chapter_count();

-- -----------------------------------------------
-- Cập nhật rating_avg & rating_count khi có rating mới
-- -----------------------------------------------
CREATE OR REPLACE FUNCTION public.update_story_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.stories
    SET rating_avg   = (SELECT AVG(score)   FROM public.ratings WHERE story_id = COALESCE(NEW.story_id, OLD.story_id)),
        rating_count = (SELECT COUNT(*)      FROM public.ratings WHERE story_id = COALESCE(NEW.story_id, OLD.story_id))
    WHERE id = COALESCE(NEW.story_id, OLD.story_id);
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_story_rating
    AFTER INSERT OR UPDATE OR DELETE ON public.ratings
    FOR EACH ROW EXECUTE FUNCTION public.update_story_rating();

-- -----------------------------------------------
-- Cập nhật bookmark_count trên bảng stories
-- -----------------------------------------------
CREATE OR REPLACE FUNCTION public.update_story_bookmark_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.stories SET bookmark_count = bookmark_count + 1 WHERE id = NEW.story_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.stories SET bookmark_count = GREATEST(bookmark_count - 1, 0) WHERE id = OLD.story_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_bookmark_count
    AFTER INSERT OR DELETE ON public.bookmarks
    FOR EACH ROW EXECUTE FUNCTION public.update_story_bookmark_count();

-- -----------------------------------------------
-- Cập nhật like_count trên bảng comments
-- -----------------------------------------------
CREATE OR REPLACE FUNCTION public.update_comment_like_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.comments SET like_count = like_count + 1 WHERE id = NEW.comment_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.comments SET like_count = GREATEST(like_count - 1, 0) WHERE id = OLD.comment_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_comment_like_count
    AFTER INSERT OR DELETE ON public.comment_likes
    FOR EACH ROW EXECUTE FUNCTION public.update_comment_like_count();

-- ============================================================
-- VIEWS (Truy vấn thường dùng)
-- ============================================================

-- View bảng xếp hạng tuần
CREATE OR REPLACE VIEW public.v_rankings_weekly AS
SELECT
    s.id,
    s.title,
    s.slug,
    s.cover_url,
    s.status,
    s.chapter_count,
    s.rating_avg,
    COUNT(sv.id) AS views_this_week
FROM public.stories s
LEFT JOIN public.story_views sv
    ON sv.story_id = s.id
    AND sv.viewed_at >= (NOW() - INTERVAL '7 days')
WHERE s.is_published = TRUE
GROUP BY s.id
ORDER BY views_this_week DESC;

COMMENT ON VIEW public.v_rankings_weekly IS 'Bảng xếp hạng truyện theo lượt xem trong 7 ngày qua';

-- View bảng xếp hạng tháng
CREATE OR REPLACE VIEW public.v_rankings_monthly AS
SELECT
    s.id,
    s.title,
    s.slug,
    s.cover_url,
    s.status,
    s.chapter_count,
    s.rating_avg,
    COUNT(sv.id) AS views_this_month
FROM public.stories s
LEFT JOIN public.story_views sv
    ON sv.story_id = s.id
    AND sv.viewed_at >= (NOW() - INTERVAL '30 days')
WHERE s.is_published = TRUE
GROUP BY s.id
ORDER BY views_this_month DESC;

COMMENT ON VIEW public.v_rankings_monthly IS 'Bảng xếp hạng truyện theo lượt xem trong 30 ngày qua';

-- View thông tin truyện đầy đủ kèm thể loại
CREATE OR REPLACE VIEW public.v_story_detail AS
SELECT
    s.*,
    p.username      AS author_username,
    p.display_name  AS author_display_name,
    p.avatar_url    AS author_avatar_url,
    COALESCE(
        JSON_AGG(
            JSON_BUILD_OBJECT('id', g.id, 'name', g.name, 'slug', g.slug)
            ORDER BY g.name
        ) FILTER (WHERE g.id IS NOT NULL),
        '[]'
    ) AS genres
FROM public.stories s
LEFT JOIN public.profiles   p  ON p.id = s.author_id
LEFT JOIN public.story_genres sg ON sg.story_id = s.id
LEFT JOIN public.genres     g  ON g.id = sg.genre_id
GROUP BY s.id, p.username, p.display_name, p.avatar_url;

COMMENT ON VIEW public.v_story_detail IS 'Thông tin đầy đủ của truyện kèm tên tác giả và danh sách thể loại';

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Bật RLS
ALTER TABLE public.profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stories          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_history  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_likes    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_views      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genres           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_genres     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports          ENABLE ROW LEVEL SECURITY;

-- ---- PROFILES ----
DROP POLICY IF EXISTS "Ai cũng có thể xem profile công khai" ON public.profiles;
CREATE POLICY "Ai cũng có thể xem profile công khai"
    ON public.profiles FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Chỉ chủ sở hữu mới được sửa profile của mình" ON public.profiles;
CREATE POLICY "Chỉ chủ sở hữu mới được sửa profile của mình"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- ---- GENRES ----
DROP POLICY IF EXISTS "Ai cũng có thể xem thể loại" ON public.genres;
CREATE POLICY "Ai cũng có thể xem thể loại"
    ON public.genres FOR SELECT USING (TRUE);

-- ---- STORY_GENRES ----
DROP POLICY IF EXISTS "Ai cũng có thể xem thể loại của truyện" ON public.story_genres;
CREATE POLICY "Ai cũng có thể xem thể loại của truyện"
    ON public.story_genres FOR SELECT USING (TRUE);

-- ---- STORIES ----
DROP POLICY IF EXISTS "Ai cũng có thể xem truyện đã xuất bản" ON public.stories;
CREATE POLICY "Ai cũng có thể xem truyện đã xuất bản"
    ON public.stories FOR SELECT
    USING (is_published = TRUE OR auth.uid() = author_id);

DROP POLICY IF EXISTS "Tác giả có thể tạo truyện" ON public.stories;
CREATE POLICY "Tác giả có thể tạo truyện"
    ON public.stories FOR INSERT
    WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Tác giả có thể sửa truyện của mình" ON public.stories;
CREATE POLICY "Tác giả có thể sửa truyện của mình"
    ON public.stories FOR UPDATE
    USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Tác giả có thể xoá truyện của mình" ON public.stories;
CREATE POLICY "Tác giả có thể xoá truyện của mình"
    ON public.stories FOR DELETE
    USING (auth.uid() = author_id);

-- ---- CHAPTERS ----
DROP POLICY IF EXISTS "Ai cũng có thể xem chương đã xuất bản" ON public.chapters;
CREATE POLICY "Ai cũng có thể xem chương đã xuất bản"
    ON public.chapters FOR SELECT
    USING (is_published = TRUE OR EXISTS (
        SELECT 1 FROM public.stories s WHERE s.id = story_id AND s.author_id = auth.uid()
    ));

DROP POLICY IF EXISTS "Tác giả tạo chương" ON public.chapters;
CREATE POLICY "Tác giả tạo chương"
    ON public.chapters FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.stories s WHERE s.id = story_id AND s.author_id = auth.uid()
    ));

DROP POLICY IF EXISTS "Tác giả sửa chương" ON public.chapters;
CREATE POLICY "Tác giả sửa chương"
    ON public.chapters FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM public.stories s WHERE s.id = story_id AND s.author_id = auth.uid()
    ));

-- ---- BOOKMARKS ----
DROP POLICY IF EXISTS "Xem bookmark của chính mình" ON public.bookmarks;
CREATE POLICY "Xem bookmark của chính mình"
    ON public.bookmarks FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Tạo bookmark" ON public.bookmarks;
CREATE POLICY "Tạo bookmark"
    ON public.bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Xoá bookmark của chính mình" ON public.bookmarks;
CREATE POLICY "Xoá bookmark của chính mình"
    ON public.bookmarks FOR DELETE USING (auth.uid() = user_id);

-- ---- FAVORITES ----
DROP POLICY IF EXISTS "Xem favorite của chính mình" ON public.favorites;
CREATE POLICY "Xem favorite của chính mình"
    ON public.favorites FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Tạo favorite" ON public.favorites;
CREATE POLICY "Tạo favorite"
    ON public.favorites FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Xoá favorite của chính mình" ON public.favorites;
CREATE POLICY "Xoá favorite của chính mình"
    ON public.favorites FOR DELETE USING (auth.uid() = user_id);

-- ---- READING HISTORY ----
DROP POLICY IF EXISTS "Xem lịch sử đọc của chính mình" ON public.reading_history;
CREATE POLICY "Xem lịch sử đọc của chính mình"
    ON public.reading_history FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Tạo/cập nhật lịch sử đọc" ON public.reading_history;
CREATE POLICY "Tạo/cập nhật lịch sử đọc"
    ON public.reading_history FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Sửa tiến trình đọc" ON public.reading_history;
CREATE POLICY "Sửa tiến trình đọc"
    ON public.reading_history FOR UPDATE USING (auth.uid() = user_id);

-- ---- RATINGS ----
DROP POLICY IF EXISTS "Ai cũng có thể xem đánh giá" ON public.ratings;
CREATE POLICY "Ai cũng có thể xem đánh giá"
    ON public.ratings FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Người dùng tạo đánh giá" ON public.ratings;
CREATE POLICY "Người dùng tạo đánh giá"
    ON public.ratings FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Người dùng sửa đánh giá của mình" ON public.ratings;
CREATE POLICY "Người dùng sửa đánh giá của mình"
    ON public.ratings FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Người dùng xoá đánh giá của mình" ON public.ratings;
CREATE POLICY "Người dùng xoá đánh giá của mình"
    ON public.ratings FOR DELETE USING (auth.uid() = user_id);

-- ---- COMMENTS ----
DROP POLICY IF EXISTS "Ai cũng xem bình luận chưa bị ẩn" ON public.comments;
CREATE POLICY "Ai cũng xem bình luận chưa bị ẩn"
    ON public.comments FOR SELECT USING (is_hidden = FALSE);

DROP POLICY IF EXISTS "Đăng nhập mới được bình luận" ON public.comments;
CREATE POLICY "Đăng nhập mới được bình luận"
    ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Sửa bình luận của mình" ON public.comments;
CREATE POLICY "Sửa bình luận của mình"
    ON public.comments FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Xoá bình luận của mình" ON public.comments;
CREATE POLICY "Xoá bình luận của mình"
    ON public.comments FOR DELETE USING (auth.uid() = user_id);

-- ---- COMMENT LIKES ----
DROP POLICY IF EXISTS "Ai cũng xem lượt thích" ON public.comment_likes;
CREATE POLICY "Ai cũng xem lượt thích"
    ON public.comment_likes FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Đăng nhập mới được thích" ON public.comment_likes;
CREATE POLICY "Đăng nhập mới được thích"
    ON public.comment_likes FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Bỏ thích" ON public.comment_likes;
CREATE POLICY "Bỏ thích"
    ON public.comment_likes FOR DELETE USING (auth.uid() = user_id);

-- ---- STORY VIEWS ----
DROP POLICY IF EXISTS "Ai cũng có thể ghi lượt xem" ON public.story_views;
CREATE POLICY "Ai cũng có thể ghi lượt xem"
    ON public.story_views FOR INSERT WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Chỉ admin xem log lượt xem thô" ON public.story_views;
CREATE POLICY "Chỉ admin xem log lượt xem thô"
    ON public.story_views FOR SELECT
    USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

-- ---- NOTIFICATIONS ----
DROP POLICY IF EXISTS "Xem thông báo của chính mình" ON public.notifications;
CREATE POLICY "Xem thông báo của chính mình"
    ON public.notifications FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Đánh dấu đã đọc thông báo của mình" ON public.notifications;
CREATE POLICY "Đánh dấu đã đọc thông báo của mình"
    ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- ---- REPORTS ----
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

-- ============================================================
-- KẾT THÚC SCHEMA
-- ============================================================

-- ============================================================
-- ASYNC VIEW COUNT BATCHING
-- Thay vì UPDATE trực tiếp stories/chapters trong trigger (gây lock contention
-- dưới tải cao), chúng ta ghi vào bảng queue nhẹ rồi flush định kỳ.
-- Backend chỉ cần INSERT vào story_views — trigger ghi queue, pg_cron flush.
-- ============================================================

-- Bảng queue gom lượt xem chờ batch
CREATE TABLE IF NOT EXISTS public.view_count_queue (
    id          BIGSERIAL    PRIMARY KEY,
    story_id    UUID         NOT NULL REFERENCES public.stories(id)  ON DELETE CASCADE,
    chapter_id  UUID         REFERENCES public.chapters(id) ON DELETE SET NULL,
    queued_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vcq_story    ON public.view_count_queue(story_id);
CREATE INDEX IF NOT EXISTS idx_vcq_chapter  ON public.view_count_queue(chapter_id) WHERE chapter_id IS NOT NULL;

-- Trigger nhẹ: chỉ ghi vào queue, KHÔNG lock row stories/chapters
CREATE OR REPLACE FUNCTION public.enqueue_view_count()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.view_count_queue (story_id, chapter_id)
  VALUES (NEW.story_id, NEW.chapter_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS after_story_view_insert ON public.story_views;
CREATE TRIGGER after_story_view_insert
  AFTER INSERT ON public.story_views
  FOR EACH ROW
  EXECUTE FUNCTION public.enqueue_view_count();

-- Hàm flush: gom nhóm và cập nhật hàng loạt — gọi bằng pg_cron mỗi phút
-- Ví dụ: SELECT cron.schedule('flush-view-counts', '* * * * *', $$SELECT public.flush_view_count_queue()$$);
CREATE OR REPLACE FUNCTION public.flush_view_count_queue()
RETURNS void AS $$
BEGIN
  -- Toàn bộ logic nằm trong 1 câu lệnh SQL duy nhất với Writable CTE.
  -- Tất cả các CTE (deleted, story_agg, chapter_agg, update_stories) chia sẻ
  -- cùng 1 snapshot dữ liệu — đảm bảo không mất lượt xem chương.
  WITH deleted AS (
    DELETE FROM public.view_count_queue
    WHERE id = ANY (
      SELECT id FROM public.view_count_queue
      ORDER BY id
      LIMIT 10000  -- giới hạn batch tránh quá lớn
      FOR UPDATE SKIP LOCKED
    )
    RETURNING story_id, chapter_id
  )
  -- Gom nhóm lượt xem truyện theo batch
  , story_agg AS (
    SELECT story_id, COUNT(*) AS cnt
    FROM deleted
    GROUP BY story_id
  )
  -- Gom nhóm lượt xem chương theo batch
  , chapter_agg AS (
    SELECT chapter_id, COUNT(*) AS cnt
    FROM deleted
    WHERE chapter_id IS NOT NULL
    GROUP BY chapter_id
  )
  -- Cập nhật view_count truyện bên trong CTE (Writable CTE)
  , update_stories AS (
    UPDATE public.stories s
    SET view_count = s.view_count + sa.cnt
    FROM story_agg sa
    WHERE s.id = sa.story_id
  )
  -- Cập nhật view_count chương — dùng chung chapter_agg từ cùng snapshot deleted
  UPDATE public.chapters c
  SET view_count = c.view_count + ca.cnt
  FROM chapter_agg ca
  WHERE c.id = ca.chapter_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.flush_view_count_queue IS
  'Batch-flush view counts từ queue vào stories/chapters bằng Writable CTE đơn.
   Gọi định kỳ bằng pg_cron: SELECT cron.schedule(''flush-view-counts'', ''* * * * *'', $$SELECT public.flush_view_count_queue()$$);';
