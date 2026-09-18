import './BgLine.css'

type BgLineProps = {
  orientation: 'horizontal' | 'vertical'
  position: 'top' | 'bottom' | 'left' | 'right'
}

export function BgLine({ orientation, position }: BgLineProps) {
  return <div className={`bg-line bg-line--${orientation} bg-line--${position}`} aria-hidden="true" />
}
