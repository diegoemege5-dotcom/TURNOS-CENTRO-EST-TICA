import { Routes, Route, Navigate } from 'react-router-dom'
import PageShell from './components/layout/PageShell'
import Dashboard from './pages/Dashboard'
import Turnos from './pages/Turnos'
import Profesionales from './pages/Profesionales'
import Servicios from './pages/Servicios'
import Clientes from './pages/Clientes'
import Calculadora from './pages/Calculadora'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<PageShell />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="turnos" element={<Turnos />} />
        <Route path="profesionales" element={<Profesionales />} />
        <Route path="servicios" element={<Servicios />} />
        <Route path="clientes" element={<Clientes />} />
        <Route path="calculadora" element={<Calculadora />} />
      </Route>
    </Routes>
  )
}
