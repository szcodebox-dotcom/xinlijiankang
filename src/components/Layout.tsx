import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useRole } from '../context/RoleContext'
import type { RoleCode } from '../types'

interface NavItem {
  to: string
  label: string
  roles: RoleCode[]
}

const NAV: NavItem[] = [
  { to: '/archives', label: '一人一档', roles: ['district_center', 'psych_teacher', 'head_teacher'] },
  { to: '/tickets', label: '预警工单', roles: ['district_center', 'psych_teacher', 'head_teacher'] },
  { to: '/home-school', label: '家校建议书', roles: ['psych_teacher', 'parent'] },
  { to: '/dashboard/district', label: '区级看板', roles: ['district_center'] },
  { to: '/dashboard/school', label: '校级台账', roles: ['district_center', 'psych_teacher'] },
  { to: '/dashboard/class', label: '班级波动', roles: ['district_center', 'psych_teacher', 'head_teacher'] },
  { to: '/student', label: '学生测评/求助', roles: ['student'] },
]

const PAGE_TITLES: Record<string, string> = {
  '/archives': '一人一档',
  '/tickets': '预警工单待办',
  '/home-school': '家校建议书',
  '/dashboard/district': '区级态势看板',
  '/dashboard/school': '校级重点关注台账',
  '/dashboard/class': '班级波动',
  '/student': '学生测评与求助',
}

export function Layout() {
  const { user, setUserId, allUsers } = useRole()
  const loc = useLocation()
  const base = loc.pathname.startsWith('/archives/')
    ? '/archives'
    : loc.pathname.startsWith('/tickets/')
      ? '/tickets'
      : loc.pathname
  const title = PAGE_TITLES[base] ?? '演练首页'

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <p className="brand-name">心联</p>
          <p className="brand-sub">区心理健康监测平台<br />演练版</p>
        </div>
        <nav className="nav">
          {NAV.map((item) => {
            const allowed = item.roles.includes(user.roleCode)
            return (
              <NavLink
                key={item.to}
                to={allowed ? item.to : '#'}
                className={({ isActive }) =>
                  `${isActive && allowed ? 'active' : ''} ${allowed ? '' : 'disabled'}`
                }
                onClick={(e) => {
                  if (!allowed) e.preventDefault()
                }}
              >
                {item.label}
              </NavLink>
            )
          })}
        </nav>
      </aside>
      <div className="main">
        <div className="banner-demo">
          演练版 · 无真实登录鉴权 · 数据为内存种子 · 切换右上角角色即可体验权限与脱敏差异
        </div>
        <header className="topbar">
          <h1 className="topbar-title">{title}</h1>
          <div className="role-switch">
            <span>当前角色</span>
            <select
              value={user.id}
              onChange={(e) => setUserId(Number(e.target.value))}
              aria-label="切换角色"
            >
              {allUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.roleName} · {u.name}
                </option>
              ))}
            </select>
          </div>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
