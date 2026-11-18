import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import PawBotWidget from './components/PawBotWidget'
import { prefetch } from './lib/api'

// Importer tiap halaman disimpan agar bisa di-preload di background.
const pages = {
  Home: () => import('./pages/customer/Home'),
  Shop: () => import('./pages/customer/Shop'),
  Hotel: () => import('./pages/customer/Hotel'),
  PawBot: () => import('./pages/customer/PawBot'),
  CCTV: () => import('./pages/customer/CCTV'),
  Profile: () => import('./pages/customer/Profile'),
  Login: () => import('./pages/auth/Login'),
  Register: () => import('./pages/auth/Register'),
  AdminDashboard: () => import('./pages/admin/AdminDashboard'),
  OwnerDashboard: () => import('./pages/owner/OwnerDashboard'),
  Schedule: () => import('./pages/customer/Schedule'),
  PetTaxi: () => import('./pages/customer/PetTaxi'),
  Consult: () => import('./pages/customer/Consult'),
}

const Home = lazy(pages.Home)
const Shop = lazy(pages.Shop)
const Hotel = lazy(pages.Hotel)
const PawBot = lazy(pages.PawBot)
const CCTV = lazy(pages.CCTV)
const Profile = lazy(pages.Profile)
const Login = lazy(pages.Login)
const Register = lazy(pages.Register)
const AdminDashboard = lazy(pages.AdminDashboard)
const OwnerDashboard = lazy(pages.OwnerDashboard)
const Schedule = lazy(pages.Schedule)
const PetTaxi = lazy(pages.PetTaxi)
const Consult = lazy(pages.Consult)

const customerPages = ['Home', 'Shop', 'Hotel', 'Consult', 'CCTV', 'Schedule', 'PetTaxi', 'Profile', 'PawBot']

// Gambar utama tiap fitur, di-preload saat idle supaya langsung tampil.
const featureImages = [
  '/images/products/royal-canin.jpg',
  '/images/rooms/standard.jpg',
  '/images/rooms/deluxe.jpg',
  '/images/rooms/vip.jpg',
  '/images/health/basic.jpg',
  '/images/health/vaccine.jpg',
  '/images/health/dental.jpg',
  '/images/health/full-body.jpg',
]

const whenIdle = (fn) =>
  typeof window.requestIdleCallback === 'function'
    ? window.requestIdleCallback(fn, { timeout: 2000 })
    : window.setTimeout(fn, 300)

function PageLoader() {
  return (
    <div className="p-8 max-w-6xl mx-auto animate-pulse" aria-busy="true" aria-label="Memuat halaman">
      <div className="h-7 w-56 bg-slate-200 rounded mb-3" />
      <div className="h-4 w-80 bg-slate-100 rounded mb-8" />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-56 bg-slate-100 rounded-xl" />
        ))}
      </div>
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

  // Setelah halaman pertama tampil: preload kode semua halaman customer,
  // data yang sering dipakai, dan foto fitur -> pindah menu terasa instan.
  const role = JSON.parse(localStorage.getItem('user') || 'null')?.role
  const loggedIn = Boolean(localStorage.getItem('token'))
  useEffect(() => {
    if (!loggedIn) return
    const id = whenIdle(() => {
      if (role === 'admin') return void pages.AdminDashboard()
      if (role === 'owner') return void pages.OwnerDashboard()
      customerPages.forEach((name) => pages[name]().catch(() => {}))
      prefetch(['/products', '/pets', '/dashboard'])
      featureImages.forEach((src) => {
        const img = new Image()
        img.decoding = 'async'
        img.src = src
      })
    })
    return () => {
      if (typeof window.cancelIdleCallback === 'function') window.cancelIdleCallback(id)
      else window.clearTimeout(id)
    }
  }, [loggedIn, role])

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
