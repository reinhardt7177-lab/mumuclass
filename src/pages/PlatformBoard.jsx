import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './PlatformBoard.css'

const CATEGORIES = [
  { id: 'webapp', label: '웹앱', icon: '⚡', color: '#6C3CE0' },
  { id: 'classroom', label: '학급경영도구', icon: '🏫', color: '#5DCAA5' },
  { id: 'template', label: '템플릿마켓', icon: '📄', color: '#F9CB42' },
  { id: 'api', label: '교육 API', icon: '🔗', color: '#E24B4A' },
]

const ITEMS = {
  webapp: [
    {
      id: 1,
      title: '출석체크 앱',
      desc: 'NFC 태그 하나로 학생 출석을 자동 기록. 실시간 현황판과 통계를 제공합니다.',
      author: '김지우 선생님',
      school: '서울 한강초',
      tags: ['NFC', '출석관리', 'React'],
      downloads: 1243,
      views: 5820,
      status: 'Live',
      statusColor: '#5DCAA5',
    },
    {
      id: 2,
      title: '모둠편성기',
      desc: '성별·번호·능력별 조건을 설정하면 최적의 모둠을 자동으로 편성해 드립니다.',
      author: '이성민 선생님',
      school: '경기 별빛초',
      tags: ['알고리즘', '학급관리', 'Vue'],
      downloads: 856,
      views: 3200,
      status: 'Live',
      statusColor: '#5DCAA5',
    },
    {
      id: 3,
      title: '수업 타이머',
      desc: '활동별 맞춤 타이머. 전환 효과와 알람음으로 수업 흐름을 부드럽게 조절합니다.',
      author: '박수현 선생님',
      school: '부산 해운대중',
      tags: ['타이머', 'PWA', 'TypeScript'],
      downloads: 2107,
      views: 9430,
      status: 'Live',
      statusColor: '#5DCAA5',
    },
    {
      id: 4,
      title: '발표자 뽑기 룰렛',
      desc: '공정하고 신나는 발표자 랜덤 선택. 학생 이름을 입력하면 룰렛이 돌아갑니다.',
      author: '정다은 선생님',
      school: '인천 송도고',
      tags: ['랜덤', 'Canvas', 'JavaScript'],
      downloads: 3451,
      views: 14200,
      status: 'Beta',
      statusColor: '#F9CB42',
    },
    {
      id: 5,
      title: '학급 포인트 관리',
      desc: '모둠별·개인별 포인트를 시각적으로 관리. 행동 강화와 보상 시스템을 지원합니다.',
      author: '최현준 선생님',
      school: '대전 유성초',
      tags: ['보상시스템', '학급경영', 'Svelte'],
      downloads: 678,
      views: 2900,
      status: 'Beta',
      statusColor: '#F9CB42',
    },
    {
      id: 6,
      title: '디지털 교실 배치도',
      desc: '드래그앤드롭으로 자리 배치를 편집하고 PNG/PDF로 내보낼 수 있습니다.',
      author: '강민서 선생님',
      school: '광주 첨단중',
      tags: ['좌석배치', 'Drag&Drop', 'React'],
      downloads: 1890,
      views: 7600,
      status: 'Live',
      statusColor: '#5DCAA5',
    },
  ],
  classroom: [
    {
      id: 1,
      title: '학급 규칙 생성기',
      desc: 'AI가 학년·학교급에 맞는 학급 규칙 초안을 작성해 줍니다. 수정 후 바로 출력 가능.',
      author: '최예진 선생님',
      school: '서울 마포초',
      tags: ['AI', '학급규칙', '자동생성'],
      downloads: 934,
      views: 4120,
      status: 'Live',
      statusColor: '#5DCAA5',
    },
    {
      id: 2,
      title: '주간 알림장 자동화',
      desc: '일주일 수업 일정을 입력하면 학부모용 알림장을 자동으로 생성합니다.',
      author: '정소연 선생님',
      school: '경기 분당초',
      tags: ['알림장', '자동화', 'Google Sheets'],
      downloads: 1402,
      views: 6080,
      status: 'Live',
      statusColor: '#5DCAA5',
    },
    {
      id: 3,
      title: '행동 관찰 기록지',
      desc: '학생별 행동 관찰 사항을 빠르게 기록하고 학기말 생활기록부 작성에 활용하세요.',
      author: '강태양 선생님',
      school: '충남 천안중',
      tags: ['생활기록부', '관찰기록', '생기부'],
      downloads: 678,
      views: 3450,
      status: 'Live',
      statusColor: '#5DCAA5',
    },
    {
      id: 4,
      title: '상담 일지 관리앱',
      desc: '학생·학부모 상담 내용을 암호화하여 안전하게 기록. 상담 이력 조회 기능 탑재.',
      author: '윤미래 선생님',
      school: '경북 포항고',
      tags: ['상담기록', '암호화', '이력관리'],
      downloads: 512,
      views: 2300,
      status: 'Beta',
      statusColor: '#F9CB42',
    },
    {
      id: 5,
      title: '독서기록 트래커',
      desc: '학생들의 독서 활동을 시각화. 책 목록 관리부터 감상문 작성 가이드까지.',
      author: '임나연 선생님',
      school: '부산 해성초',
      tags: ['독서교육', '독서기록', '시각화'],
      downloads: 1123,
      views: 4890,
      status: 'Live',
      statusColor: '#5DCAA5',
    },
    {
      id: 6,
      title: '급식 알레르기 체크',
      desc: '학생별 알레르기 정보를 등록하면 급식 메뉴 제공 시 자동으로 위험 알림을 표시합니다.',
      author: '한동욱 선생님',
      school: '서울 노원초',
      tags: ['급식', '알레르기', '안전'],
      downloads: 2340,
      views: 8900,
      status: 'Live',
      statusColor: '#5DCAA5',
    },
  ],
  template: [
    {
      id: 1,
      title: '수업 계획서 템플릿',
      desc: '교육과정 성취기준과 연계된 수업 계획서 양식. 한글·PDF 모두 지원합니다.',
      author: '윤재현 선생님',
      school: '서울 마포중',
      tags: ['수업계획', '교육과정', 'HWP'],
      downloads: 3201,
      views: 12800,
      status: 'Live',
      statusColor: '#5DCAA5',
    },
    {
      id: 2,
      title: '성적 통지표 디자인',
      desc: '깔끔하고 전문적인 성적 통지표 템플릿 10종. 학교 로고 삽입 가능.',
      author: '임서연 선생님',
      school: '경기 수원초',
      tags: ['성적통지표', 'Canva', '디자인'],
      downloads: 2815,
      views: 11200,
      status: 'Live',
      statusColor: '#5DCAA5',
    },
    {
      id: 3,
      title: '학부모 상담 기록 양식',
      desc: '상담 내용을 체계적으로 정리할 수 있는 기록 양식. 후속 조치 칸 포함.',
      author: '한수진 선생님',
      school: '충북 청주고',
      tags: ['상담', '학부모', '기록'],
      downloads: 1134,
      views: 5600,
      status: 'Live',
      statusColor: '#5DCAA5',
    },
    {
      id: 4,
      title: '프로젝트 수업 계획 카드',
      desc: '프로젝트 기반 학습(PBL)을 위한 단계별 계획 카드 세트. 학생용·교사용 분리.',
      author: '오민준 선생님',
      school: '전남 여수중',
      tags: ['PBL', '프로젝트수업', '카드'],
      downloads: 987,
      views: 4300,
      status: 'Beta',
      statusColor: '#F9CB42',
    },
    {
      id: 5,
      title: '학급 신문 레이아웃',
      desc: '학생들이 직접 만드는 학급 신문 레이아웃 템플릿. 인디자인·한글 버전 제공.',
      author: '서진아 선생님',
      school: '대구 달서초',
      tags: ['학급신문', '레이아웃', '미디어교육'],
      downloads: 765,
      views: 3200,
      status: 'Live',
      statusColor: '#5DCAA5',
    },
    {
      id: 6,
      title: '가정통신문 템플릿 모음',
      desc: '현장 체험학습, 방학식, 개학 등 연간 필수 가정통신문 30종 패키지.',
      author: '문지혜 선생님',
      school: '경남 창원초',
      tags: ['가정통신문', '연간계획', '30종'],
      downloads: 4560,
      views: 18900,
      status: 'Live',
      statusColor: '#5DCAA5',
    },
  ],
  api: [
    {
      id: 1,
      title: 'NEIS 공공데이터 API 래퍼',
      desc: '교육행정정보시스템(NEIS)의 학교 정보, 급식, 시간표 데이터를 쉽게 연동하는 래퍼.',
      author: '오현석 선생님',
      school: '서울대학교 사범대',
      tags: ['NEIS', '공공데이터', 'REST API'],
      downloads: 456,
      views: 2890,
      status: 'Live',
      statusColor: '#5DCAA5',
    },
    {
      id: 2,
      title: '교육부 교육통계 API',
      desc: '전국 학교 현황, 학생 수, 교원 수 등 교육부 공공데이터를 쿼리하는 SDK.',
      author: '서도윤 선생님',
      school: '한국교원대학교',
      tags: ['교육통계', '공공데이터', 'Python'],
      downloads: 312,
      views: 1760,
      status: 'Beta',
      statusColor: '#F9CB42',
    },
    {
      id: 3,
      title: '수학 문제 자동 생성 API',
      desc: 'AI가 학년별·단원별 수학 문제를 자동 생성. 난이도 조절과 정답지 함께 제공.',
      author: '문상훈 선생님',
      school: '수학교육 연구소',
      tags: ['AI', '수학', '문제생성'],
      downloads: 789,
      views: 4120,
      status: 'Live',
      statusColor: '#5DCAA5',
    },
    {
      id: 4,
      title: '한국어 맞춤법 교육 API',
      desc: '초등·중등 수준별 한국어 맞춤법 교육을 위한 문장 분석 및 교정 API.',
      author: '박언어 선생님',
      school: '국립국어원 협력',
      tags: ['맞춤법', '국어교육', 'NLP'],
      downloads: 623,
      views: 3400,
      status: 'Live',
      statusColor: '#5DCAA5',
    },
    {
      id: 5,
      title: '교육용 지도 API',
      desc: '사회·지리 수업에 특화된 지도 API. 역사 지도, 지형도, 인구 분포 레이어 제공.',
      author: '권지리 선생님',
      school: '경기 지리교육연구회',
      tags: ['지도', '사회교육', 'GIS'],
      downloads: 234,
      views: 1450,
      status: 'Beta',
      statusColor: '#F9CB42',
    },
    {
      id: 6,
      title: '학생 감정 분석 API',
      desc: '학생 작성 글에서 감정 상태를 분석하여 위기 징후를 조기에 파악하는 교육 복지 API.',
      author: '조상담 선생님',
      school: '서울 Wee센터',
      tags: ['감정분석', 'AI', '학생복지'],
      downloads: 178,
      views: 1200,
      status: 'Beta',
      statusColor: '#F9CB42',
    },
  ],
}

function formatNumber(n) {
  return n >= 1000 ? (n / 1000).toFixed(1) + 'k' : String(n)
}

export function PlatformBoard() {
  const [activeTab, setActiveTab] = useState('webapp')
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  const activeCat = CATEGORIES.find((c) => c.id === activeTab)
  const items = ITEMS[activeTab].filter(
    (item) =>
      search === '' ||
      item.title.includes(search) ||
      item.desc.includes(search) ||
      item.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="pb">
      {/* Header */}
      <header className="pb__header">
        <div className="pb__header-inner">
          <button className="pb__back" onClick={() => navigate('/')}>
            <span className="pb__back-icon">←</span>
            <div className="pb__logo-mark">∞</div>
            <span className="pb__logo-text">
              <span className="pb__logo-accent">mumu</span>class
            </span>
          </button>

          <div className="pb__header-center">
            <h1 className="pb__title">플랫폼 게시판</h1>
            <p className="pb__subtitle">선생님이 만든 에듀테크를 자유롭게 공유하고 발견하세요</p>
          </div>

          <button className="pb__publish-btn">+ 공유하기</button>
        </div>
      </header>

      {/* Tabs */}
      <div className="pb__tabs-wrap">
        <div className="pb__tabs">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              className={`pb__tab ${activeTab === cat.id ? 'pb__tab--active' : ''}`}
              style={activeTab === cat.id ? { '--tab-color': cat.color } : {}}
              onClick={() => setActiveTab(cat.id)}
            >
              <span className="pb__tab-icon">{cat.icon}</span>
              {cat.label}
              <span className="pb__tab-count">{ITEMS[cat.id].length}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="pb__toolbar">
        <div className="pb__search-wrap">
          <span className="pb__search-icon">🔍</span>
          <input
            className="pb__search"
            type="text"
            placeholder={`${activeCat.label} 검색...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="pb__stats-bar">
          <span style={{ color: activeCat.color }}>{activeCat.icon}</span>
          <span>{items.length}개 리소스</span>
        </div>
      </div>

      {/* Cards Grid */}
      <main className="pb__main">
        {items.length === 0 ? (
          <div className="pb__empty">
            <div className="pb__empty-icon">🔍</div>
            <p>검색 결과가 없습니다</p>
          </div>
        ) : (
          <div className="pb__grid">
            {items.map((item) => (
              <div key={item.id} className="pb-card">
                <div className="pb-card__top">
                  <div
                    className="pb-card__cat-dot"
                    style={{ background: activeCat.color }}
                  />
                  <span
                    className="pb-card__status"
                    style={{
                      color: item.statusColor,
                      background: item.statusColor + '18',
                    }}
                  >
                    {item.status}
                  </span>
                </div>

                <h3 className="pb-card__title">{item.title}</h3>
                <p className="pb-card__desc">{item.desc}</p>

                <div className="pb-card__tags">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="pb-card__tag"
                      style={{
                        color: activeCat.color,
                        background: activeCat.color + '18',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="pb-card__footer">
                  <div className="pb-card__author">
                    <div
                      className="pb-card__avatar"
                      style={{ background: activeCat.color + '30', color: activeCat.color }}
                    >
                      {item.author[0]}
                    </div>
                    <div className="pb-card__author-info">
                      <span className="pb-card__author-name">{item.author}</span>
                      <span className="pb-card__school">{item.school}</span>
                    </div>
                  </div>

                  <div className="pb-card__stats">
                    <span className="pb-card__stat">
                      <span className="pb-card__stat-icon">⬇</span>
                      {formatNumber(item.downloads)}
                    </span>
                    <span className="pb-card__stat">
                      <span className="pb-card__stat-icon">👁</span>
                      {formatNumber(item.views)}
                    </span>
                  </div>
                </div>

                <button
                  className="pb-card__btn"
                  style={{ '--btn-color': activeCat.color }}
                >
                  자세히 보기 →
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
