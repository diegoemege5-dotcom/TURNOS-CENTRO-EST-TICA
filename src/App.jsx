import { Routes, Route, Navigate } from 'react-router-dom'
import PageShell from './components/layout/PageShell'
import Dashboard from './pages/Dashboard'
import Platos from './pages/Platos'
import Calculadora from './pages/Calculadora'
import Menus from './pages/Menus'
import Agenda from './pages/Agenda'
import Presupuestos from './pages/Presupuestos'
import Configuracion from './pages/Configuracion'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<PageShell />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="platos" element={<Platos />} />
        <Route path="calculadora" element={<Calculadora />} />
        <Route path="menus" element={<Menus />} />
        <Route path="agenda" element={<Agenda />} />
        <Route path="presupuestos" element={<Presupuestos />} />
        <Route path="configuracion" element={<Configuracion />} />
      </Route>
    </Routes>
  )
}
