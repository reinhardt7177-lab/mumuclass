-- ============================================
-- 무무클래스 카테고리 시스템 전면 개편 SQL
-- Supabase SQL Editor에 전체 복붙 후 Run
-- ============================================

-- 1) app_number 컬럼 + 시퀀스
ALTER TABLE public.apps
  ADD COLUMN IF NOT EXISTS app_number integer;

CREATE SEQUENCE IF NOT EXISTS apps_app_number_seq;

CREATE UNIQUE INDEX IF NOT EXISTS idx_apps_app_number
  ON public.apps (app_number)
  WHERE app_number IS NOT NULL;

-- 2) 기존 앱에 등록순 번호 부여
WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) AS rn
  FROM public.apps
)
UPDATE public.apps
SET app_number = numbered.rn
FROM numbered
WHERE apps.id = numbered.id;

SELECT setval('apps_app_number_seq', COALESCE((SELECT MAX(app_number) FROM public.apps), 0));

-- 3) 새 앱 등록 시 자동 번호 부여 트리거
CREATE OR REPLACE FUNCTION assign_app_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.app_number IS NULL THEN
    NEW.app_number := nextval('apps_app_number_seq');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_assign_app_number ON public.apps;
CREATE TRIGGER trg_assign_app_number
  BEFORE INSERT ON public.apps
  FOR EACH ROW
  EXECUTE FUNCTION assign_app_number();

-- 4) featured_tags 테이블 (관리자 고정 태그)
CREATE TABLE IF NOT EXISTS public.featured_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tag_name text NOT NULL UNIQUE,
  sort_order integer DEFAULT 0,
  is_pinned boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.featured_tags ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'featured_tags' AND policyname = 'featured_tags read') THEN
    CREATE POLICY "featured_tags read" ON public.featured_tags FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'featured_tags' AND policyname = 'featured_tags modify') THEN
    CREATE POLICY "featured_tags modify" ON public.featured_tags FOR ALL USING (auth.uid() IS NOT NULL);
  END IF;
END $$;

-- 5) tag_usage 뷰 (태그 사용 집계)
CREATE OR REPLACE VIEW public.tag_usage AS
SELECT
  tag_value AS tag,
  COUNT(*) AS usage_count
FROM public.apps,
  LATERAL jsonb_array_elements_text(
    CASE
      WHEN tags IS NULL THEN '[]'::jsonb
      WHEN jsonb_typeof(tags::jsonb) = 'array' THEN tags::jsonb
      ELSE '[]'::jsonb
    END
  ) AS tag_value
WHERE approved = true
GROUP BY tag_value
ORDER BY usage_count DESC;

-- 6) 카테고리 테이블 갱신 (기존 삭제 → 새로 삽입)
DELETE FROM public.app_categories;

INSERT INTO public.app_categories (id, label, emoji, sort_order, parent_id) VALUES
  ('수업진행', '수업 진행', '📚', 0, NULL),
  ('학급운영', '학급 운영', '🏫', 1, NULL),
  ('퀴즈평가', '퀴즈/평가', '📝', 2, NULL),
  ('놀이게임', '놀이/게임', '🎮', 3, NULL),
  ('AI코딩',  'AI/코딩',   '🤖', 4, NULL),
  ('기타',    '기타',       '📁', 5, NULL);

-- 7) 기존 앱 카테고리 매핑
UPDATE public.apps SET category = '학급 운영'  WHERE category = '학급관리';
UPDATE public.apps SET category = '놀이/게임'  WHERE category IN ('게임', '퍼즐');
UPDATE public.apps SET category = 'AI/코딩'    WHERE category = '에듀테크';

UPDATE public.apps
SET tags = CASE
    WHEN tags IS NULL OR tags::text = '[]' OR tags::text = 'null'
      THEN ('["' || category || '"]')::jsonb
    ELSE tags::jsonb || ('["' || category || '"]')::jsonb
  END,
  category = '수업 진행'
WHERE category IN ('수학', '국어', '사회', '체육', '교과');

-- 8) app_requests 카테고리도 동일 매핑
UPDATE public.app_requests SET category = '학급 운영'  WHERE category = '학급관리';
UPDATE public.app_requests SET category = '놀이/게임'  WHERE category IN ('게임', '퍼즐');
UPDATE public.app_requests SET category = 'AI/코딩'    WHERE category = '에듀테크';
UPDATE public.app_requests SET category = '수업 진행'  WHERE category IN ('수학', '국어', '사회', '체육', '교과');

-- 9) 추천 태그 시드
INSERT INTO public.featured_tags (tag_name, sort_order, is_pinned) VALUES
  ('수학', 0, true),
  ('국어', 1, true),
  ('사회', 2, true),
  ('체육', 3, true),
  ('1학년', 4, true),
  ('AI', 5, true)
ON CONFLICT (tag_name) DO NOTHING;

-- 완료!
