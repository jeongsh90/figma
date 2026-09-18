import type { AnchorHTMLAttributes, MouseEvent } from 'react'
import { usePixelTransition } from '../context/pixel-transition'

type PixelLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }

export function PixelLink({ to, onClick, children, ...rest }: PixelLinkProps) {
  const { navigate } = usePixelTransition()

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event)
    if (event.defaultPrevented) return
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return
    }
    event.preventDefault()
    navigate(to)
  }

  return (
    <a href={to} onClick={handleClick} {...rest}>
      {children}
    </a>
  )
}
