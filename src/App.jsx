import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { PlatformProvider } from './context/PlatformContext'
import { Nav } from './components/Nav'
import { Hero } from './components/Hero'
import { Dashboard } from './components/Dashboard'
import { Features } from './components/Features'
import { Products } from './components/Products'
import { Process } from './components/Process'
import { Stats } from './components/Stats'
import { CTA } from './components/CTA'
import { Footer } from './components/Footer'
import { PlatformBoard } from './pages/PlatformBoard'

function Landing() {
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

export default function App() {
  return (
    <PlatformProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/platform" element={<PlatformBoard />} />
        </Routes>
      </BrowserRouter>
    </PlatformProvider>
  )
}
