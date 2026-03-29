-- 무무클래스 플랫폼 게시판 테이블
-- Supabase > SQL Editor 에서 실행하세요

create table if not exists platform_posts (
  id         bigserial primary key,
  title      text not null,
  description text not null,
  author     text not null,
  school     text not null,
  category   text not null check (category in ('webapp', 'classroom', 'template', 'api')),
  tags       text[] default '{}',
  downloads  integer default 0,
  views      integer default 0,
  status     text default 'Beta' check (status in ('Live', 'Beta', 'Dev', 'Funding')),
  created_at timestamptz default now()
);

-- Row Level Security 활성화
alter table platform_posts enable row level security;

-- 누구나 읽기 가능
create policy "public_read"
  on platform_posts for select
  using (true);

-- 누구나 게시 가능 (추후 인증 추가 권장)
create policy "public_insert"
  on platform_posts for insert
  with check (true);

-- 샘플 데이터 (선택 사항)
insert into platform_posts (title, description, author, school, category, tags, downloads, views, status)
values
  ('출석체크 앱', 'NFC 태그 하나로 학생 출석을 자동 기록. 실시간 현황판과 통계를 제공합니다.', '김지우 선생님', '서울 한강초', 'webapp', array['NFC','출석관리','React'], 1243, 5820, 'Live'),
  ('모둠편성기', '성별·번호·능력별 조건을 설정하면 최적의 모둠을 자동으로 편성해 드립니다.', '이성민 선생님', '경기 별빛초', 'webapp', array['알고리즘','학급관리','Vue'], 856, 3200, 'Live'),
  ('학급 규칙 생성기', 'AI가 학년·학교급에 맞는 학급 규칙 초안을 작성해 줍니다.', '최예진 선생님', '서울 마포초', 'classroom', array['AI','학급규칙','자동생성'], 934, 4120, 'Live'),
  ('수업 계획서 템플릿', '교육과정 성취기준과 연계된 수업 계획서 양식. 한글·PDF 모두 지원합니다.', '윤재현 선생님', '서울 마포중', 'template', array['수업계획','교육과정','HWP'], 3201, 12800, 'Live'),
  ('NEIS 공공데이터 API 래퍼', '교육행정정보시스템(NEIS)의 학교 정보, 급식, 시간표 데이터를 쉽게 연동하는 래퍼.', '오현석 선생님', '서울대학교 사범대', 'api', array['NEIS','공공데이터','REST API'], 456, 2890, 'Live');
