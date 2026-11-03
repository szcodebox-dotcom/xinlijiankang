import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { ArchiveDetailPage } from './pages/ArchiveDetail'
import { ArchivesPage } from './pages/Archives'
import { DashboardClassPage } from './pages/DashboardClass'
import { DashboardDistrictPage } from './pages/DashboardDistrict'
import { DashboardSchoolPage } from './pages/DashboardSchool'
import { HomeSchoolPage } from './pages/HomeSchool'
import { StudentPortalPage } from './pages/StudentPortal'
import { TicketDetailPage } from './pages/TicketDetail'
import { TicketsPage } from './pages/Tickets'
import { WelcomePage, homeFor } from './pages/Welcome'
import { useRole } from './context/RoleContext'

function WorkbenchHomeRedirect() {
  const { user } = useRole()
  return <Navigate to={homeFor(user.roleCode)} replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/welcome" element={<WelcomePage />} />
      <Route path="/" element={<Navigate to="/welcome" replace />} />

      <Route element={<Layout />}>
        <Route path="archives" element={<ArchivesPage />} />
        <Route path="archives/:studentId" element={<ArchiveDetailPage />} />
        <Route path="tickets" element={<TicketsPage />} />
        <Route path="tickets/:id" element={<TicketDetailPage />} />
        <Route path="home-school" element={<HomeSchoolPage />} />
        <Route path="dashboard/district" element={<DashboardDistrictPage />} />
        <Route path="dashboard/school" element={<DashboardSchoolPage />} />
        <Route path="dashboard/class" element={<DashboardClassPage />} />
        <Route path="student" element={<StudentPortalPage />} />
        <Route path="app" element={<WorkbenchHomeRedirect />} />
        <Route path="*" element={<Navigate to="/welcome" replace />} />
      </Route>
    </Routes>
  )
}
