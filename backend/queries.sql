-- ============================================================
-- SQL QUERIES - TRUY VẤN DỮ LIỆU CRAWLER TRÊN SUPABASE
-- Sử dụng: Copy các câu lệnh dưới đây dán vào Supabase SQL Editor để chạy.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Xem tất cả các TRUYỆN đã cào được
-- Hiển thị: Tên truyện, Slug, Trạng thái, Số chương thực tế trong DB, Số chương (bộ đếm), và Ngày thêm.
-- ------------------------------------------------------------
SELECT 
    s.title AS "Tên truyện",
    s.slug AS "Slug",
    CASE 
        WHEN s.status = 'ongoing' THEN 'Đang ra'
        WHEN s.status = 'completed' THEN 'Hoàn thành'
        WHEN s.status = 'hiatus' THEN 'Tạm dừng'
        WHEN s.status = 'dropped' THEN 'Đã drop'
        ELSE s.status
    END AS "Trạng thái",
    (SELECT COUNT(*) FROM public.chapters c WHERE c.story_id = s.id) AS "Số chương thực tế",
    s.chapter_count AS "Số chương (bộ đếm)",
    TO_CHAR(s.created_at, 'DD/MM/YYYY HH24:MI:SS') AS "Ngày thêm"
FROM 
    public.stories s
ORDER BY 
    s.created_at DESC;


-- ------------------------------------------------------------
-- 2. Xem danh sách CHƯƠNG của một truyện cụ thể
-- Hướng dẫn: Thay thế 'kiem-lai' bên dưới bằng Slug truyện bạn muốn xem.
-- ------------------------------------------------------------
SELECT 
    s.title AS "Tên truyện",
    c.chapter_number AS "Chương số",
    c.title AS "Tên chương",
    c.word_count AS "Số chữ",
    TO_CHAR(c.created_at, 'DD/MM/YYYY HH24:MI:SS') AS "Ngày thêm"
FROM 
    public.chapters c
JOIN 
    public.stories s ON c.story_id = s.id
WHERE 
    s.slug = 'kiem-lai' -- <-- Thay thế slug truyện ở đây
ORDER BY 
    c.chapter_number ASC;


-- ------------------------------------------------------------
-- 3. Xem NỘI DUNG chi tiết của một chương cụ thể
-- Hướng dẫn: Thay thế 'kiem-lai' và số chương (VD: 1) tương ứng.
-- ------------------------------------------------------------
SELECT 
    s.title AS "Tên truyện",
    c.chapter_number AS "Chương số",
    c.title AS "Tên chương",
    c.word_count AS "Số chữ",
    c.content AS "Nội dung chương truyện" -- <-- Xem toàn bộ nội dung text ở đây
FROM 
    public.chapters c
JOIN 
    public.stories s ON c.story_id = s.id
WHERE 
    s.slug = 'kiem-lai'          -- <-- Thay thế slug truyện
    AND c.chapter_number = 1;    -- <-- Thay thế số chương cần đọc thử


-- ------------------------------------------------------------
-- 4. Thống kê nhanh TỔNG SỐ LƯỢNG dữ liệu trong hệ thống
-- ------------------------------------------------------------
SELECT 
    (SELECT COUNT(*) FROM public.stories) AS "Tổng số truyện",
    (SELECT COUNT(*) FROM public.chapters) AS "Tổng số chương",
    (SELECT COUNT(*) FROM public.genres) AS "Tổng số thể loại",
    (SELECT COUNT(*) FROM public.profiles) AS "Tổng số người dùng / bot";


-- ------------------------------------------------------------
-- 5. Tìm kiếm các chương BỊ LỖI nội dung (Nội dung rỗng hoặc quá ngắn dưới 100 chữ)
-- Hướng dẫn: Giúp bạn phát hiện chương nào bị cào thiếu để chạy cào lại.
-- ------------------------------------------------------------
SELECT 
    s.title AS "Tên truyện",
    c.chapter_number AS "Chương số",
    c.title AS "Tên chương",
    c.word_count AS "Số chữ",
    LENGTH(c.content) AS "Độ dài ký tự"
FROM 
    public.chapters c
JOIN 
    public.stories s ON c.story_id = s.id
WHERE 
    c.content IS NULL 
    OR LENGTH(TRIM(c.content)) < 100
ORDER BY 
    s.title, c.chapter_number;


-- ------------------------------------------------------------
-- 6. Xem NỘI DUNG toàn bộ các chương của một truyện
-- Hướng dẫn: Thay thế 'kiem-lai' bằng Slug truyện bạn muốn xem. 
-- Lệnh này sẽ trả về nội dung đầy đủ của tất cả các chương của truyện đó, sắp xếp từ chương 1 trở đi.
-- ------------------------------------------------------------
SELECT 
    s.title AS "Tên truyện",
    c.chapter_number AS "Chương số",
    c.title AS "Tên chương",
    c.word_count AS "Số chữ",
    c.content AS "Nội dung chi tiết chương"
FROM 
    public.chapters c
JOIN 
    public.stories s ON c.story_id = s.id
WHERE 
    s.slug = 'kiem-lai' -- <-- Thay thế slug truyện ở đây
ORDER BY 
    c.chapter_number ASC;


-- ------------------------------------------------------------
-- 7. Chỉ xem danh sách TÊN TRUYỆN đã lưu (Xem nhanh)
-- Lệnh này hiển thị nhanh danh sách tên, slug và ngày lưu của tất cả truyện.
-- ------------------------------------------------------------
SELECT 
    title AS "Tên truyện",
    slug AS "Slug truyện",
    TO_CHAR(created_at, 'DD/MM/YYYY HH24:MI:SS') AS "Ngày lưu"
FROM 
    public.stories
ORDER BY 
    created_at DESC;

