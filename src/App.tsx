import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { useRole } from './context/RoleContext'
import { ArchiveDetailPage } from './pages/ArchiveDetail'
import { ArchivesPage } from './pages/Archives'
import { DashboardClassPage } from './pages/DashboardClass'
import { DashboardDistrictPage } from './pages/DashboardDistrict'
import { DashboardSchoolPage } from './pages/DashboardSchool'
import { HomeSchoolPage } from './pages/HomeSchool'
import { StudentPortalPage } from './pages/StudentPortal'
import { TicketDetailPage } from './pages/TicketDetail'
import { TicketsPage } from './pages/Tickets'
import type { RoleCode } from './types'

function homeFor(role: RoleCode) {
  switch (role) {
    case 'parent':
      return '/home-school'
    case 'student':
      return '/student'
    case 'district_center':
      return '/dashboard/district'
    default:
      return '/tickets'
  }
}

function HomeRedirect() {
  const { user } = useRole()
  return <Navigate to={homeFor(user.roleCode)} replace />
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomeRedirect />} />
        <Route path="archives" element={<ArchivesPage />} />
        <Route path="archives/:studentId" element={<ArchiveDetailPage />} />
        <Route path="tickets" element={<TicketsPage />} />
        <Route path="tickets/:id" element={<TicketDetailPage />} />
        <Route path="home-school" element={<HomeSchoolPage />} />
        <Route path="dashboard/district" element={<DashboardDistrictPage />} />
        <Route path="dashboard/school" element={<DashboardSchoolPage />} />
        <Route path="dashboard/class" element={<DashboardClassPage />} />
        <Route path="student" element={<StudentPortalPage />} />
        <Route path="*" element={<HomeRedirect />} />
      </Route>
    </Routes>
  )
}
