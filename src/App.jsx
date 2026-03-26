import { Nav } from './components/Nav'
import { Hero } from './components/Hero'
import { Dashboard } from './components/Dashboard'
import { Features } from './components/Features'
import { Products } from './components/Products'
import { Process } from './components/Process'
import { Stats } from './components/Stats'
import { CTA } from './components/CTA'
import { Footer } from './components/Footer'

export default function App() {
  return (
    <>
      <Nav />
      <Hero />
      <Dashboard />
      <Features />
      <Products />
      <Process />
      <Stats />
      <CTA />
      <Footer />
    </>
  )
}
