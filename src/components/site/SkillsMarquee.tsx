import type { ComponentType } from 'react'
import {
  SiFigma,
  SiHtml5,
  SiTailwindcss,
  SiJavascript,
  SiReact,
  SiGreensock,
  SiJquery,
  SiGit,
  SiGithub,
  SiCursor,
  SiClaude,
} from 'react-icons/si'
import { TbBrandAdobePhotoshop, TbBrandAdobeIllustrator } from 'react-icons/tb'
import { Palette, FileCode, LayoutTemplate, Bot } from 'lucide-react'
import './SkillsMarquee.css'

type IconComponent = ComponentType<{ className?: string }>

type Skill = {
  label: string
  Icon: IconComponent
}

const SKILLS: Skill[] = [
  { label: 'Figma', Icon: SiFigma },
  { label: 'Adobe Photoshop', Icon: TbBrandAdobePhotoshop },
  { label: 'Adobe Illustrator', Icon: TbBrandAdobeIllustrator },
  { label: 'HTML5', Icon: SiHtml5 },
  { label: 'Tailwind CSS', Icon: SiTailwindcss },
  { label: 'JavaScript', Icon: SiJavascript },
  { label: 'ReactJS', Icon: SiReact },
  { label: 'gsapJS', Icon: SiGreensock },
  { label: 'jQuery', Icon: SiJquery },
  { label: 'UI·UX', Icon: Palette },
  { label: 'Publisher', Icon: FileCode },
  { label: 'Frontend', Icon: LayoutTemplate },
  { label: 'Git', Icon: SiGit },
  { label: 'GitHub', Icon: SiGithub },
  { label: 'Cursor AI', Icon: SiCursor },
  { label: 'Claude', Icon: SiClaude },
  { label: 'AI Agent', Icon: Bot },
]

export function SkillsMarquee() {
  return (
    <div className="skills-marquee">
      <div className="skills-marquee__track">
        {[0, 1].map((rep) => (
          <div className="skills-marquee__group" key={rep} aria-hidden={rep === 1}>
            {SKILLS.map(({ label, Icon }) => (
              <span className="skills-marquee__item" key={`${rep}-${label}`}>
                <Icon className="skills-marquee__icon" />
                {label}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
