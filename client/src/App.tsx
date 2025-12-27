import React from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Pricing from './pages/Pricing'
import Projects from './pages/Projects'
import MyProjects from './pages/MyProjects'
import Preview from './pages/Preview'
import Community from './pages/Community'
import View from './pages/View'
import Navbar from './components/Navbar'
import { Toaster, toast } from 'sonner'
import AuthPage from './pages/auth/AuthPage'
import SettingsPage from './pages/Settings'

const App = () => {
  const {pathname} = useLocation();
  const hideNavbar = pathname.startsWith('/projects/') && pathname !== '/projects' || pathname.startsWith('/view/') || pathname.startsWith('/preview/');
  return (
    <>
      {!hideNavbar && <Navbar />}
      <Toaster/>
      <div className={!hideNavbar ? 'py-20' : ''}>
        <Routes>
        <Route path="/auth/:pathname" element={<AuthPage />} />
        <Route path='/' element={<Home/>} />
        <Route path='/pricing' element={<Pricing/>} />
        <Route path='/projects' element={<MyProjects/>} />
        <Route path='/community' element={<Community/>} />
        <Route path='/view/:projectId' element={<View/>} />
        <Route path='/projects/:projectId' element={<Projects/>} />
        <Route path='/preview/:projectId' element={<Preview/>} />
        <Route path='/account/settings' element={<SettingsPage/>} />
        <Route path='/preview/:projectId/:versionId' element={<Preview/>} />
      </Routes>
      </div>
    </>
  )
}

export default App
