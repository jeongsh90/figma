import { Route, Routes } from 'react-router-dom'
import { PixelTransitionProvider } from './context/pixel-transition'
import { Home } from './pages/Home'
import { About } from './pages/About'
import './App.css'

function App() {
  return (
    <PixelTransitionProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>

      <div className="noise"></div>
    </PixelTransitionProvider>
  )
}

export default App
