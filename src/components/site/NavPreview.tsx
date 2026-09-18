import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { PixelImage } from '../ui/pixel-image'
import './NavPreview.css'

const BG_TRANSITION_MS = 550

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
      <PixelImage
        src="/nav-placeholder.svg"
        customGrid={{ rows: 3, cols: 12 }}
        active={hovered}
        grayscaleAnimation={false}
        pixelFadeInDuration={BG_TRANSITION_MS}
        maxAnimationDelay={220}
        className="nav-preview__pixels [&_img]:rounded-none [&_img]:object-cover"
      />
      <span className="nav-preview__label-mask">
        <span className="nav-preview__label nav-preview__label--top">{label}</span>
        <span className="nav-preview__label nav-preview__label--bottom">{label}</span>
      </span>
      <ArrowRight className="nav-preview__arrow" strokeWidth={1.5} aria-hidden="true" />
    </a>
  )
}
