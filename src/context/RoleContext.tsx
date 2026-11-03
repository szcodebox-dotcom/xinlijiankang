import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { users } from '../data/seed'
import type { DemoUser } from '../types'

interface RoleContextValue {
  user: DemoUser
  setUserId: (id: number) => void
  allUsers: DemoUser[]
}

const RoleContext = createContext<RoleContextValue | null>(null)

export function RoleProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState(2) // 默认专职心理教师
  const user = useMemo(
    () => users.find((u) => u.id === userId) ?? users[1],
    [userId],
  )
  const value = useMemo(
    () => ({ user, setUserId, allUsers: users }),
    [user],
  )
  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>
}

export function useRole() {
  const ctx = useContext(RoleContext)
  if (!ctx) throw new Error('useRole must be used within RoleProvider')
  return ctx
}
