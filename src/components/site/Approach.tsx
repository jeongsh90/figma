import './site-grid.css'
import './Approach.css'
import { ParticleReveal } from './ParticleReveal'

type ApproachItem = {
  label: string
  weight: string
  title: string
  desc: string
  image: string
}

// Small technical-drawing corner mark - reused at all 4 corners of each
// card's icon area, matching the reference's crosshair tick treatment.
function PlusMark() {
  return (
    <svg className="site-approach__plus" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M5.995 0V8V12" stroke="currentColor" />
      <path d="M12 5.995L4 5.99499L0 5.99499" stroke="currentColor" />
    </svg>
  )
}

const ITEMS: ApproachItem[] = [
  {
    label: '요구사항 정리',
    weight: '15%',
    title: '고객 요구사항 정리',
    desc: '기획서와 기능 정의서를 분석하고 반응형 요구사항, 일정을 검토합니다. 초기에 명확히 정의해야 하향식 수정을 막을 수 있습니다.',
    image: '/approach-1.svg',
  },
  {
    label: '디자인',
    weight: '20%',
    title: '디자인시스템 반영',
    desc: '컬러·타이포·스페이싱 토큰과 베이스 컴포넌트를 그리드 시스템 위에 구조화합니다. 사내 디자인 시스템 규칙을 엄격히 지켜 일관성을 유지합니다.',
    image: '/approach-2.svg',
  },
  {
    label: '화면구현',
    weight: '45%',
    title: '화면 구현 및 인터랙티브 반영',
    desc: '컴포넌트 기반으로 화면을 구현하고 GSAP·Swiper로 인터랙션을 붙입니다. 공수가 가장 큰 단계라 기능 단위로 나눠 점진적으로 완성합니다.',
    image: '/approach-3.svg',
  },
  {
    label: '검토',
    weight: '20%',
    title: '오류 검토 및 최적화',
    desc: '크로스 브라우징과 반응형, 렌더링 성능, 접근성을 전방위로 검증합니다. 배포 전 마지막 관문으로 시나리오별 테스트를 거칩니다.',
    image: '/approach-4.svg',
  },
]

export function Approach() {
  return (
    <section className="site-approach">
      <div className="site-container site-approach__head">
        <p className="site-approach__head-right">
          저는 요구사항 정리부터 디자인시스템 반영, 화면 구현, 오류 검토까지 각 단계에 실제
          소요되는 공수를 가중치로 나누어 관리하며 작업을 진행합니다. 가장 많은 공수가 필요한
          구현 단계는 단위 기능별로 나누어 점진적으로 완성도를 높입니다.
        </p>
        <div className="site-approach__head-left">
          <h2 className="site-approach__headline">How I Work</h2>
        </div>
      </div>
      <div className="site-container site-approach__grid">
        {ITEMS.map((item) => (
          <div key={item.label} className="site-approach__card">
            <div className="site-approach__card-head">
              <span className="site-approach__card-dot" aria-hidden="true" />
              <span className="site-approach__card-label">{item.label}</span>
              <span className="site-approach__card-weight">가중치 [{item.weight}]</span>
            </div>
            <div className="site-approach__card-icon">
              <PlusMark />
              <PlusMark />
              <PlusMark />
              <PlusMark />
              <div className="site-approach__card-icon-inner">
                <ParticleReveal src={item.image} />
              </div>
            </div>
            <div className="site-approach__card-body">
              <p className="site-approach__card-title">{item.title}</p>
              <p className="site-approach__card-desc">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
