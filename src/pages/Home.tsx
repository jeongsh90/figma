import { Header } from '../components/site/Header'
import { Hero } from '../components/site/Hero'
import { Intro } from '../components/site/Intro'
import { Skills } from '../components/site/Skills'
import { Process } from '../components/site/Process'
import { Services } from '../components/site/Services'
import { Why } from '../components/site/Why'
import { Projects } from '../components/site/Projects'
import { CTA } from '../components/site/CTA'
import { Footer } from '../components/site/Footer'

export function Home() {
  return (
    <>
      <Header />
      <Hero />
      <Intro />
      <Skills />
      <Process />
      <Services />
      <Why />
      <Projects />
      <CTA />
      <Footer />
    </>
  )
}
