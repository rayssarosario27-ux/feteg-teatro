import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Details from './pages/Details'

function ScrollToTop() {
  const location = useLocation()

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [location.pathname])

  return null
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/detalhes/:id" element={<Details />} />
      </Routes>
    </Router>
  )
}

export default App