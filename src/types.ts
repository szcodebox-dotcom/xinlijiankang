/** 演练版角色（覆盖核心路径） */
export type RoleCode =
  | 'district_center'
  | 'psych_teacher'
  | 'head_teacher'
  | 'parent'
  | 'student'

export type RoleName =
  | '区心理中心'
  | '专职心理教师'
  | '班主任'
  | '家长'
  | '学生'

export interface DemoUser {
  id: number
  name: string
  roleCode: RoleCode
  roleName: RoleName
  schoolId?: number
  classIds?: number[]
  studentId?: string
  childStudentIds?: string[]
}

export interface School {
  id: number
  name: string
  districtName: string
}

export interface SchoolClass {
  id: number
  schoolId: number
  name: string
  grade: string
}

export interface StudentProfile {
  id: number
  studentId: string
  name: string
  gender: 1 | 2
  schoolId: number
  classId: number
  grade: string
  status: 1 | 2 | 3 | 4
}

export interface MentalHealthArchive {
  id: number
  studentId: string
  currentRiskLevel: 1 | 2 | 3 | 4
  riskReason: string
  lastAssessTime: string
  isActive: 0 | 1
}

export type TicketStatus =
  | 'pending'
  | 'processing'
  | 'overdue'
  | 'closed'
  | 'escalated'

export interface WarningTicket {
  id: number
  ticketNo: string
  studentId: string
  riskLevel: 2 | 3 | 4
  status: TicketStatus
  assigneeRole: RoleName | string
  assigneeId: number | null
  triggerReason: string
  deadline: string
  respondTime: string | null
  closeTime: string | null
  escalateCount: number
  createTime: string
  updateTime: string
}

export interface TicketLog {
  id: number
  ticketId: number
  action: 'create' | 'assign' | 'process' | 'escalate' | 'close'
  operatorId: number
  content: string
  createTime: string
}

export interface HomeSchoolRecord {
  id: number
  studentId: string
  ticketId: number | null
  recordType: '建议书' | '告知书' | '面谈'
  content: string
  parentSigned: 0 | 1
  signTime: string | null
  createTime: string
}

export interface BehaviorRecord {
  id: number
  studentId: string
  recorderId: number
  tags: string
  description: string
  recordTime: string
}

export interface StressEvent {
  id: number
  studentId: string
  eventType: string
  severity: 1 | 2 | 3
  description: string
  occurTime: string
}

export interface ScaleResult {
  id: number
  studentId: string
  scaleType: string
  totalScore: number
  riskFlag: 0 | 1
  isValid: 0 | 1
  assessTime: string
}

export interface HelpRequest {
  id: number
  studentId: string
  content: string
  status: string
  createTime: string
}

export interface TimelineItem {
  time: string
  source: 'behavior' | 'stress' | 'ticket' | 'home_school' | 'scale'
  summary: string
  refId: number
}
