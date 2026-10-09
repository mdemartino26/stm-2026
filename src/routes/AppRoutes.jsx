import { Route, Routes } from 'react-router-dom'
import AppShell from '../layouts/AppShell/AppShell.jsx'
import AuthCallback from '../pages/AuthCallback/AuthCallback.jsx'
import Dashboard from '../pages/Dashboard/Dashboard.jsx'
import Landing from '../pages/Landing/Landing.jsx'
import Mix from '../pages/Mix/Mix.jsx'
import Mood from '../pages/Mood/Mood.jsx'
import NotFound from '../pages/NotFound/NotFound.jsx'
import Search from '../pages/Search/Search.jsx'
import Similar from '../pages/Similar/Similar.jsx'
import RequireSession from './RequireSession.jsx'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/callback" element={<AuthCallback />} />

      {/* Pantallas con sesión: comparten barra superior y navegación */}
      <Route
        element={
          <RequireSession>
            <AppShell />
          </RequireSession>
        }
      >
        <Route path="/mood" element={<Mood />} />
        <Route path="/mezclar" element={<Mix />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/buscar" element={<Search />} />
        <Route path="/similares" element={<Similar />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
