import './BgMark.css'

type BgMarkProps = {
  corner: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
}

export function BgMark({ corner }: BgMarkProps) {
  return <span className={`bg-mark bg-mark--${corner}`} aria-hidden="true" />
}
