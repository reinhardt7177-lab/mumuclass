import { useState } from 'react'
import { Footer } from './Footer'

// 최신 AI 테크 뉴스 데이터 (하드코딩 — 추후 Supabase 테이블로 전환 가능)
const AI_ARTICLES = [
  {
    id: 1,
    category: 'LLM',
    title: 'GPT-5 출시 — 멀티모달 추론과 코드 생성 능력 대폭 향상',
    summary: 'OpenAI가 GPT-5를 정식 공개. 복잡한 수학 문제 해결 능력이 90% 이상 향상되었으며, 교육 분야에서의 활용 가능성을 시사합니다.',
    source: 'OpenAI Blog',
    date: '2026-03-28',
    tags: ['GPT-5', 'LLM', '멀티모달'],
    hot: true,
  },
  {
    id: 2,
    category: 'AI Agent',
    title: 'Claude 4.6 Opus: 에이전트 코딩의 새 표준',
    summary: 'Anthropic의 Claude 4.6 Opus가 자율 코딩 에이전트 벤치마크에서 1위를 기록. 바이브 코딩 워크플로우에 최적화된 모델로 교사들의 앱 개발을 돕습니다.',
    source: 'Anthropic',
    date: '2026-03-25',
    tags: ['Claude', 'AI Agent', '바이브코딩'],
    hot: true,
  },
  {
    id: 3,
    category: '에듀테크',
    title: '교육부, AI 디지털 교과서 전면 도입 확정',
    summary: '2026년 2학기부터 전국 초·중·고교에 AI 기반 디지털 교과서가 도입됩니다. 개인 맞춤형 학습 경로를 AI가 설계합니다.',
    source: '교육부 공식 발표',
    date: '2026-03-22',
    tags: ['디지털교과서', 'AI교육', '정책'],
    hot: false,
  },
  {
    id: 4,
    category: 'AI 도구',
    title: 'Google Gemini 3.1 Pro — 교육 콘텐츠 생성 특화',
    summary: 'Google의 Gemini 3.1 Pro가 교육 콘텐츠 생성에 특화된 기능을 탑재. 문제 출제, 설명 자동 생성, 학습 피드백 작성 등이 가능합니다.',
    source: 'Google DeepMind',
    date: '2026-03-20',
    tags: ['Gemini', 'Google', '콘텐츠생성'],
    hot: false,
  },
  {
    id: 5,
    category: '바이브 코딩',
    title: '바이브 코딩이란? — 교사를 위한 AI 앱 개발 가이드',
    summary: 'AI와 대화하면서 코드를 생성하는 "바이브 코딩"의 개념과 교사가 활용할 수 있는 실전 가이드를 정리했습니다.',
    source: '무궁무진 클래스',
    date: '2026-03-18',
    tags: ['바이브코딩', '가이드', '무코딩'],
    hot: false,
  },
  {
    id: 6,
    category: 'AI Agent',
    title: 'Cursor AI + Windsurf: 교사를 위한 코딩 도구 비교',
    summary: '바이브 코딩에 가장 적합한 AI 에이전트 IDE를 비교 분석합니다. Cursor, Windsurf, Replit Agent 중 교사에게 최적의 도구는?',
    source: '무궁무진 클래스',
    date: '2026-03-15',
    tags: ['CursorAI', 'Windsurf', '비교분석'],
    hot: false,
  },
  {
    id: 7,
    category: '에듀테크',
    title: 'OECD 보고서: AI가 바꾸는 교실의 미래',
    summary: 'OECD가 발표한 보고서에 따르면, AI 도입 학교의 학업 성취도가 평균 23% 향상되었으며, 교사의 업무 부담은 40% 감소했습니다.',
    source: 'OECD Education',
    date: '2026-03-12',
    tags: ['OECD', 'AI교육', '리포트'],
    hot: false,
  },
  {
    id: 8,
    category: 'LLM',
    title: '오픈소스 LLM 시대 — Llama 4가 교육 현장에 미치는 영향',
    summary: 'Meta의 Llama 4 오픈소스 모델이 등장하면서 교육 현장에서 자체 AI 서비스 구축이 가능해졌습니다. 개인정보 보호와 비용 절감 관점에서 분석합니다.',
    source: 'Meta AI',
    date: '2026-03-10',
    tags: ['Llama4', '오픈소스', '자체구축'],
    hot: false,
  },
]

const CATEGORIES = ['전체', 'LLM', 'AI Agent', 'AI 도구', '에듀테크', '바이브 코딩']

const CAT_CLASSES = {
  'LLM': 'llm',
  'AI Agent': 'aiagent',
  'AI 도구': 'aitool',
  '에듀테크': 'edutech',
  '바이브 코딩': 'vibecoding'
}

export default function AITechBoard() {
  const [activeCategory, setActiveCategory] = useState('전체')
  const [search, setSearch] = useState('')

  const filtered = AI_ARTICLES.filter((a) => {
    const matchCat = activeCategory === '전체' || a.category === activeCategory
    const matchSearch =
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.summary.toLowerCase().includes(search.toLowerCase()) ||
      a.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
    return matchCat && matchSearch
  })

  const formatDate = (dateStr) => {
    const d = new Date(dateStr)
    const now = new Date()
    const diff = Math.floor((now - d) / (1000 * 60 * 60 * 24))
    if (diff === 0) return '오늘'
    if (diff === 1) return '어제'
    if (diff < 7) return `${diff}일 전`
    return `${d.getMonth() + 1}월 ${d.getDate()}일`
  }

  return (
    <>
      <div className="aitech-page">
        {/* 헤더 배너 */}
        <div className="aitech-hero">
          <div className="aitech-hero__content">
            <span className="aitech-hero__badge">🤖 AI TECH NEWS</span>
            <h1 className="aitech-hero__title">최신 AI 테크 소식</h1>
            <p className="aitech-hero__desc">
              교육과 AI의 최전선 — LLM, 에이전트, 바이브 코딩의 최신 트렌드를 한눈에
            </p>
            <div className="aitech-hero__search">
              <span className="aitech-hero__search-icon">🔍</span>
              <input
                type="text"
                placeholder="기사 검색..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* 카테고리 탭 */}
        <div className="aitech-tabs">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`aitech-tab ${activeCategory === cat ? 'aitech-tab--active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 게시판 리스트 */}
        <div className="aitech-board">
          <div className="aitech-board__header">
            <h2>{activeCategory === '전체' ? '📰 전체 기사' : `📂 ${activeCategory}`}</h2>
            <span className="aitech-board__count">{filtered.length}건</span>
          </div>

          {filtered.length === 0 ? (
            <div className="board__empty">
              <div className="board__empty-icon">🔎</div>
              <p>검색 결과가 없습니다</p>
            </div>
          ) : (
            <div className="aitech-list">
              {filtered.map((article) => (
                <article key={article.id} className="aitech-item">
                  <div className="aitech-item__left">
                    <div className="aitech-item__top-row">
                      <span className={`aitech-item__category aitech-item__category--${CAT_CLASSES[article.category] || 'default'}`}>
                        {article.category}
                      </span>
                      {article.hot && <span className="aitech-item__hot">🔥 HOT</span>}
                    </div>
                    <h3 className="aitech-item__title">{article.title}</h3>
                    <p className="aitech-item__summary">{article.summary}</p>
                    <div className="aitech-item__tags">
                      {article.tags.map((tag) => (
                        <span key={tag} className="aitech-item__tag">#{tag}</span>
                      ))}
                    </div>
                  </div>
                  <div className="aitech-item__right">
                    <span className="aitech-item__source">{article.source}</span>
                    <span className="aitech-item__date">{formatDate(article.date)}</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}
