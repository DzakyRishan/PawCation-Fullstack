import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import PawBotWidget from './components/PawBotWidget'

const Home = lazy(() => import('./pages/customer/Home'))
const Shop = lazy(() => import('./pages/customer/Shop'))
const Hotel = lazy(() => import('./pages/customer/Hotel'))
const PawBot = lazy(() => import('./pages/customer/PawBot'))
const CCTV = lazy(() => import('./pages/customer/CCTV'))
const Profile = lazy(() => import('./pages/customer/Profile'))
const Login = lazy(() => import('./pages/auth/Login'))
const Register = lazy(() => import('./pages/auth/Register'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const OwnerDashboard = lazy(() => import('./pages/owner/OwnerDashboard'))
const Schedule = lazy(() => import('./pages/customer/Schedule'))
const PetTaxi = lazy(() => import('./pages/customer/PetTaxi'))
const Consult = lazy(() => import('./pages/customer/Consult'))

function PageLoader() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      color: '#888',
      fontFamily: 'system-ui, sans-serif',
      fontSize: '14px',
    }}>
      Loading…
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

function AppContent() {
  const location = useLocation()
  const hideNavbar = location.pathname === '/login' || location.pathname === '/register'
  // Bubble PawBot hanya di halaman customer (bukan login, admin, owner, atau halaman /pawbot itu sendiri)
  const showPawBot =
    !hideNavbar &&
    !['/admin', '/owner', '/pawbot'].some((p) => location.pathname.startsWith(p))

  return (
    <>
      {!hideNavbar && <Navbar />}
      {showPawBot && <PawBotWidget />}
      <Suspense fallback={<PageLoader />}>
        <Routes>
        <Route path="/" element={
          <ProtectedRoute allowedRoles={['customer']}>
            <Home />
          </ProtectedRoute>
        } />
        <Route path="/shop" element={
          <ProtectedRoute allowedRoles={['customer']}>
            <Shop />
          </ProtectedRoute>
        } />
        <Route path="/hotel" element={
          <ProtectedRoute allowedRoles={['customer']}>
            <Hotel />
          </ProtectedRoute>
        } />
        <Route path="/pawbot" element={
          <ProtectedRoute allowedRoles={['customer']}>
            <PawBot />
          </ProtectedRoute>
        } />
        <Route path="/cctv" element={
          <ProtectedRoute allowedRoles={['customer']}>
            <CCTV />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute allowedRoles={['customer']}>
            <Profile />
          </ProtectedRoute>
        } />

        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />

        <Route path="/owner" element={
          <ProtectedRoute allowedRoles={['owner']}>
            <OwnerDashboard />
          </ProtectedRoute>
        } />
        <Route path="/schedule" element={
          <ProtectedRoute allowedRoles={['customer']}>
            <Schedule />
          </ProtectedRoute>
        } />

        <Route path="/pet-taxi" element={
          <ProtectedRoute allowedRoles={['customer']}>
            <PetTaxi />
          </ProtectedRoute>
        } />

        <Route path="/consult" element={
          <ProtectedRoute allowedRoles={['customer']}>
            <Consult />
          </ProtectedRoute>
        } />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        </Routes>
      </Suspense>
    </>
  )
}

export default App
