import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import { useAuthStore } from './store/authStore'
import Login from './features/auth/Login'
import DashboardLayout from './components/layout/DashboardLayout'
import ProtectedRoute from './components/layout/ProtectedRoute'
import Dashboard from './features/dashboard/Dashboard'
import EventsPage from './features/dashboard/EventsPage'
import EventForm from './features/editor/EventForm'
import InvitationView from './features/public/InvitationView'

function App() {
  const { setSession, setUser, setIsLoading } = useAuthStore()

  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }: any) => {
      setSession(session)
      setUser(session?.user || null)
      setIsLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setSession(session)
      setUser(session?.user || null)
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [setSession, setUser, setIsLoading])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Public Routes */}
        <Route path="/invitacion/:id" element={<InvitationView />} />
        
        {/* Protected Dashboard Routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          {/* Default dashboard view */}
          <Route index element={<Dashboard />} />
          {/* Event views */}
          <Route path="events" element={<EventsPage />} />
          {/* Event editor routes */}
          <Route path="event/new" element={<EventForm />} />
          <Route path="event/:id" element={<EventForm />} />
        </Route>

        {/* Redirect root to dashboard (which will redirect to login if not authenticated) */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
