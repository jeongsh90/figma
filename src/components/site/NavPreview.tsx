import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { PixelHoverBackground } from './PixelHoverBackground'
import './NavPreview.css'

type NavPreviewProps = {
  label: string
}

export function NavPreview({ label }: NavPreviewProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <a
      href="#"
      className="nav-preview"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <PixelHoverBackground active={hovered} />
      <span className="nav-preview__label-mask">
        <span className="nav-preview__label nav-preview__label--top">{label}</span>
        <span className="nav-preview__label nav-preview__label--bottom">{label}</span>
      </span>
      <span className="nav-preview__arrow-mask" aria-hidden="true">
        <ArrowRight className="nav-preview__arrow nav-preview__arrow--current" strokeWidth={1.5} />
        <ArrowRight className="nav-preview__arrow nav-preview__arrow--next" strokeWidth={1.5} />
      </span>
    </a>
  )
}
