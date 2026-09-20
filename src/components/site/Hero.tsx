import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import './site-grid.css'
import './Hero.css'
import { BgLine } from './BgLine'
import { BgMark } from './BgMark'
import { PixelLink } from '../PixelLink'
import { PixelHoverBackground } from './PixelHoverBackground'
import { TetrisBoard } from './TetrisBoard'
import { SkillsMarquee } from './SkillsMarquee'

export function Hero() {
  const [aboutHovered, setAboutHovered] = useState(false)

  return (
    <section className="site-hero">
      <div className="site-frame">
        <BgLine orientation="horizontal" position="top" />
        <BgLine orientation="horizontal" position="bottom" />
        <BgLine orientation="vertical" position="left" />
        <BgLine orientation="vertical" position="right" />
        <BgMark corner="top-left" />
        <BgMark corner="top-right" />
        <BgMark corner="bottom-left" />
        <BgMark corner="bottom-right" />
        <div className="site-hero__visual">
          <TetrisBoard />
        </div>
      </div>
      <div className="site-container site-hero__foot">
        <div className="site-hero__area site-hero__area--left">
          <div className="site-hero__title-block">
            <h1 className="site-hero__title">Sanghun Jeong</h1>
            <p className="site-hero__subtitle">
              <span className="site-hero__title-strong">UX·UI Design</span>{' '}
              <span className="site-hero__title-x">x</span>{' '}
              <span className="site-hero__title-strong">Publishing</span>
            </p>
          </div>
        </div>
        <div className="site-hero__area site-hero__area--top-right">
          <div className="site-hero__blurb-col site-hero__blurb-col--text">
            <p className="site-hero__blurb">
              저는 4년간의 편집 디자인 경험과 8년간의 UI/UX 디자인 경력을 바탕으로, 시각 언어의 본질을 이해하는 디자이너입니다. 편집
              디자인에서 익힌 그리드 시스템과 타이포그래피 감각은 지금도 웹·앱 환경에서 정보를 가장 효율적으로 전달하는 설계의
              기본기가 되고 있습니다. 테트리스가 한 조각도 허투루 놓지 않고 빈틈없이 맞춰갈 때 가장 완성도 높은 판이 되듯,
              저 역시 경험 하나하나를 정교하게 쌓아 최고의 결과물을 만들기위해 노력합니다.
            </p>
          </div>
          <PixelLink
            to="/about"
            className="site-hero__blurb-col site-hero__blurb-col--link"
            onMouseEnter={() => setAboutHovered(true)}
            onMouseLeave={() => setAboutHovered(false)}
          >
            <PixelHoverBackground active={aboutHovered} color="var(--color-accent)" />
            <span className="site-hero__blurb-link-label-mask">
              <span className="site-hero__blurb-link-label site-hero__blurb-link-label--top">ABOUT ME</span>
              <span className="site-hero__blurb-link-label site-hero__blurb-link-label--bottom">ABOUT ME</span>
            </span>
            <span className="site-hero__blurb-link-arrow-mask" aria-hidden="true">
              <ArrowRight
                className="site-hero__blurb-link-arrow site-hero__blurb-link-arrow--current"
                strokeWidth={1.5}
              />
              <ArrowRight
                className="site-hero__blurb-link-arrow site-hero__blurb-link-arrow--next"
                strokeWidth={1.5}
              />
            </span>
          </PixelLink>
        </div>
        <div className="site-hero__area site-hero__area--bottom-right">
          <SkillsMarquee />
        </div>
      </div>
    </section>
  )
}
