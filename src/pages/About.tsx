import { PixelLink } from '../components/PixelLink'

export function About() {
  return (
    <section id="about">
      <h1>About</h1>
      <p>
        Navigating here plays the pixel-grid wipe from{' '}
        <a href="https://tympanus.net/Development/PixelTransition/index.html" target="_blank">
          Codrops&rsquo; Pixel Transition
        </a>
        .
      </p>
      <PixelLink to="/" className="hover-line">
        Back to home
      </PixelLink>
    </section>
  )
}
