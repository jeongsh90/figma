import type { ReactElement } from 'react'
import './site-grid.css'
import './Approach.css'

type ApproachItem = {
  label: string
  weight: string
  title: string
  desc: string
  Icon: () => ReactElement
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

function ManualIcon() {
  return (
    <svg viewBox="0 0 200 200" fill="none" aria-hidden="true">
      <path
        className="site-approach__icon-guide"
        d="M183.574 121.794L99.787 73.1054 M16 121.794L99.787 73.1054 M99.787 39.5125V73.1054 M124.5 55.5L99.787 39.5125L74.5 55.5"
        stroke="currentColor"
        strokeDasharray="0.93 2.8 9.35 2.8"
      />
      <ellipse cx="99.0227" cy="18.0954" rx="24.4748" ry="14.0954" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M123.498 18.0954C123.498 19.9583 122.87 21.7368 121.73 23.3646C118.106 28.539 109.305 32.1907 99.0227 32.1907C88.7404 32.1907 79.939 28.539 76.3154 23.3646C75.1754 21.7368 74.5479 19.9583 74.5479 18.0954"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M74.5479 18.0954V94.701" stroke="currentColor" strokeWidth="1.5" />
      <path d="M123.498 18.0954V94.701" stroke="currentColor" strokeWidth="1.5" />
      <line
        className="site-approach__icon-guide"
        x1="74.5679"
        y1="97.1006"
        x2="74.5679"
        y2="151.809"
        stroke="currentColor"
        strokeDasharray="0.93 2.8 9.35 2.8"
      />
      <line
        className="site-approach__icon-guide"
        x1="123.518"
        y1="97.1006"
        x2="123.518"
        y2="153.729"
        stroke="currentColor"
        strokeDasharray="0.93 2.8 9.35 2.8"
      />
      <path d="M74.5479 157.168V180.905" stroke="currentColor" strokeWidth="1.5" />
      <path d="M123.498 158.128V180.905" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M123.498 180.905C123.498 188.689 112.54 195 99.0227 195C85.5056 195 74.5479 188.689 74.5479 180.905"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M99.787 140.494V171.817" stroke="currentColor" strokeWidth="1.5" />
      <path d="M99.787 140.494L16 90.4708" stroke="currentColor" strokeWidth="1.5" />
      <path d="M99.787 140.494L183.574 90.4708" stroke="currentColor" strokeWidth="1.5" />
      <path d="M16 90.4708C16.254 90.6224 47.2614 71.7089 74.539 55.0002" stroke="currentColor" strokeWidth="1.5" />
      <path d="M123.5 53.9346L183.574 90.4708" stroke="currentColor" strokeWidth="1.5" />
      <path d="M183.574 90.4708V121.794L160.865 135.351L99.787 171.817" stroke="currentColor" strokeWidth="1.5" />
      <path d="M99.787 171.817L38.7086 135.351L16 121.794V90.4708" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function DisjointedIcon() {
  return (
    <svg viewBox="0 0 200 200" fill="none" aria-hidden="true">
      <path
        className="site-approach__icon-guide"
        d="M170.702 154.097L99.9215 113.508 M29.5215 154.097L99.9215 113.508 M99.9215 113.508V32.7083 M122.395 45.9027L99.9215 32.7083L77.5343 45.9027"
        stroke="currentColor"
        strokeDasharray="0.93 2.8 9.35 2.8"
      />
      <ellipse cx="100" cy="32" rx="27.25" ry="26.25" stroke="currentColor" strokeWidth="1.5" />
      <path d="M77.083 45.9028L29.5215 73.3805" stroke="currentColor" strokeWidth="1.5" />
      <path d="M29.5215 73.3805V154.636" stroke="currentColor" strokeWidth="1.5" />
      <path d="M29.5215 154.636L99.9215 195" stroke="currentColor" strokeWidth="1.5" />
      <path d="M122.883 45.9028L170.702 73.3805" stroke="currentColor" strokeWidth="1.5" />
      <path d="M170.702 73.3805V154.636" stroke="currentColor" strokeWidth="1.5" />
      <path d="M170.702 154.636L99.9215 195" stroke="currentColor" strokeWidth="1.5" />
      <path d="M99.9215 114.273L29.5215 73.3805" stroke="currentColor" strokeWidth="1.5" />
      <path d="M99.9215 114.273L170.702 73.3805" stroke="currentColor" strokeWidth="1.5" />
      <path d="M99.9215 114.273V195" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function BlindIcon() {
  return (
    <svg viewBox="0 0 188 188" fill="none" aria-hidden="true">
      <path
        className="site-approach__icon-guide"
        d="M176.115 140.46L93.7784 93.5164 M11.8848 140.46L93.7784 93.5164 M93.7784 93.5164V0.540283"
        stroke="currentColor"
        strokeDasharray="0.93 2.8 9.35 2.8"
      />
      <circle cx="94" cy="94" r="93.25" stroke="currentColor" strokeWidth="1.5" />
      <path
        className="site-approach__icon-guide"
        d="M93.866 151.264V94.2951M44.2988 65.4378L93.866 36.7356L143.701 65.4378V122.78L93.866 151.264L44.2988 122.78V65.4378ZM93.866 94.2951L143.701 65.4378M93.866 94.2951L44.2988 65.4378"
        stroke="currentColor"
        strokeDasharray="0.93 2.8 9.35 2.8"
      />
    </svg>
  )
}

function SlowIcon() {
  return (
    <svg viewBox="0 0 200 200" fill="none" aria-hidden="true">
      <path
        className="site-approach__icon-guide"
        d="M13.5 146.5L100.733 94.982M100.733 94.982L186.5 146.5M100.733 94.982V62.8343M38 100L100.733 62.8343L163.5 99.5M100.733 33.609V0M100.733 33.609L13.5 85.5M100.733 33.609L186.5 85"
        stroke="currentColor"
        strokeDasharray="0.78 2.34 7.81 2.34"
      />
      <path d="M100.298 0.878906L14.5264 53.1299" stroke="currentColor" strokeWidth="1.5" />
      <path d="M100.298 0.878906L186.139 53.0859" stroke="currentColor" strokeWidth="1.5" />
      <path d="M14.5264 53.1299L13.75 85.3008" stroke="currentColor" strokeWidth="1.5" />
      <path d="M186.139 53.0859L186.843 85.3008" stroke="currentColor" strokeWidth="1.5" />
      <path d="M13.75 85.3008L38.1035 99.8418L99.9121 137" stroke="currentColor" strokeWidth="1.5" />
      <path d="M186.843 85.3008L163.549 99.209L99.9121 137" stroke="currentColor" strokeWidth="1.5" />
      <path d="M100.296 104.338L14.5264 53.1299" stroke="currentColor" strokeWidth="1.5" />
      <path d="M100.296 104.338L186.139 53.0859" stroke="currentColor" strokeWidth="1.5" />
      <path d="M99.9121 137L100.296 104.338" stroke="currentColor" strokeWidth="1.5" />
      <path d="M38.1035 99.8418L13.75 115.786" stroke="currentColor" strokeWidth="1.5" />
      <path d="M163.549 99.209L186.843 113.98" stroke="currentColor" strokeWidth="1.5" />
      <path d="M13.75 115.786V146.674L100 198.356" stroke="currentColor" strokeWidth="1.5" />
      <path d="M186.843 113.98V146.674L100 198.356" stroke="currentColor" strokeWidth="1.5" />
      <path d="M13.75 115.786L100 166.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M186.843 113.98L100 166.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M100 166.5V198.356" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

const ITEMS: ApproachItem[] = [
  {
    label: '요구사항',
    weight: '15%',
    title: '고객 요구사항 정리',
    desc: '기획서와 기능 정의서를 분석하고 반응형 요구사항, 일정을 검토합니다. 초기에 명확히 정의해야 하향식 수정을 막을 수 있습니다.',
    Icon: ManualIcon,
  },
  {
    label: '디자인시스템',
    weight: '20%',
    title: '디자인시스템 반영',
    desc: '컬러·타이포·스페이싱 토큰과 베이스 컴포넌트를 그리드 시스템 위에 구조화합니다. 사내 디자인 시스템 규칙을 엄격히 지켜 일관성을 유지합니다.',
    Icon: DisjointedIcon,
  },
  {
    label: '화면구현',
    weight: '45%',
    title: '화면 구현 및 인터랙티브 반영',
    desc: '컴포넌트 기반으로 화면을 구현하고 GSAP·Swiper로 인터랙션을 붙입니다. 공수가 가장 큰 단계라 기능 단위로 나눠 점진적으로 완성합니다.',
    Icon: BlindIcon,
  },
  {
    label: '오류검토',
    weight: '20%',
    title: '오류 검토 및 최적화',
    desc: '크로스 브라우징과 반응형, 렌더링 성능, 접근성을 전방위로 검증합니다. 배포 전 마지막 관문으로 시나리오별 테스트를 거칩니다.',
    Icon: SlowIcon,
  },
]

export function Approach() {
  return (
    <section className="site-approach">
      <div className="site-container site-approach__head">
        <div className="site-approach__head-left">
          <span className="site-approach__eyebrow">PROCESS</span>
          <h2 className="site-approach__headline">
            UI/UX 퍼블리싱 워크플로우,
            <br />
            WBS 가중치로 나눈 4단계
          </h2>
        </div>
        <p className="site-approach__head-right">
          요구사항 정리부터 디자인시스템 반영, 화면 구현, 오류 검토까지 — 각 단계에 실제 소요되는
          공수를 가중치로 나누어 관리하며, 가장 많은 공수가 필요한 구현 단계는 단위 기능별로
          나누어 점진적으로 완성도를 높입니다.
        </p>
      </div>
      <div className="site-container site-approach__grid">
        {ITEMS.map((item) => (
          <div key={item.label} className="site-approach__card">
            <div className="site-approach__card-head">
              <span className="site-approach__card-dot" aria-hidden="true" />
              <span className="site-approach__card-label">{item.label}</span>
              <span className="site-approach__card-weight">[{item.weight}]</span>
            </div>
            <div className="site-approach__card-icon">
              <PlusMark />
              <PlusMark />
              <PlusMark />
              <PlusMark />
              <div className="site-approach__card-icon-inner">
                <item.Icon />
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
