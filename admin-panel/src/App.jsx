import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Dashboard from './pages/Dashboard'
import Apresentacoes from './pages/Apresentacoes'
import Datas from './pages/Datas'
import Parcerias from './pages/Parcerias'
import EditarApresentacao from './pages/EditarApresentacao'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="apresentacoes" element={<Apresentacoes />} />
          <Route path="apresentacoes/:id" element={<EditarApresentacao />} />
          <Route path="datas" element={<Datas />} />
          <Route path="parcerias" element={<Parcerias />} />
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </Router>
  )
}

export default App