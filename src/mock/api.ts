import {
  archives,
  behaviors,
  classes,
  helpRequests,
  homeSchoolRecords,
  nextIds,
  scaleResults,
  schools,
  stressEvents,
  students,
  ticketLogs,
  tickets,
  users,
} from '../data/seed'
import type {
  DemoUser,
  HomeSchoolRecord,
  TimelineItem,
  WarningTicket,
} from '../types'

function nowStr() {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
}

function studentName(studentId: string) {
  return students.find((s) => s.studentId === studentId)?.name ?? studentId
}

function schoolName(schoolId: number) {
  return schools.find((s) => s.id === schoolId)?.name ?? String(schoolId)
}

function className(classId: number) {
  return classes.find((c) => c.id === classId)?.name ?? String(classId)
}

function canSeeRiskColor(user: DemoUser) {
  return (
    user.roleCode === 'district_center' ||
    user.roleCode === 'psych_teacher'
  )
}

function inScopeStudent(user: DemoUser, studentId: string): boolean {
  const s = students.find((x) => x.studentId === studentId)
  if (!s) return false
  switch (user.roleCode) {
    case 'district_center':
      return true
    case 'psych_teacher':
      return s.schoolId === user.schoolId
    case 'head_teacher':
      return !!user.classIds?.includes(s.classId)
    case 'parent':
      return !!user.childStudentIds?.includes(studentId)
    case 'student':
      return user.studentId === studentId
    default:
      return false
  }
}

function canProcessLevel(user: DemoUser, level: 2 | 3 | 4): boolean {
  if (user.roleCode === 'head_teacher') return level === 2
  if (user.roleCode === 'psych_teacher') return true
  if (user.roleCode === 'district_center') return level === 3 || level === 4
  return false
}

export function listUsers() {
  return users
}

export function getSchools() {
  return schools
}

export function getClasses() {
  return classes
}

/** 一人一档列表（按角色范围 + 脱敏） */
export function listArchives(user: DemoUser) {
  const rows = students
    .filter((s) => inScopeStudent(user, s.studentId))
    .map((s) => {
      const a = archives.find((x) => x.studentId === s.studentId)!
      const base = {
        studentId: s.studentId,
        name: s.name,
        gender: s.gender,
        schoolId: s.schoolId,
        schoolName: schoolName(s.schoolId),
        classId: s.classId,
        className: className(s.classId),
        grade: s.grade,
        status: s.status,
        lastAssessTime: a.lastAssessTime,
        isActive: a.isActive,
      }
      if (user.roleCode === 'head_teacher') {
        return { ...base, currentRiskLevel: null as number | null, riskReason: null as string | null }
      }
      if (user.roleCode === 'parent' || user.roleCode === 'student') {
        return null
      }
      return {
        ...base,
        currentRiskLevel: a.currentRiskLevel,
        riskReason: a.riskReason,
      }
    })
    .filter(Boolean)
  return rows
}

export function getArchive(user: DemoUser, studentId: string) {
  if (user.roleCode === 'parent' || user.roleCode === 'student') {
    return { error: '当前角色无权查看一人一档' as const }
  }
  if (!inScopeStudent(user, studentId)) {
    return { error: '不在当前角色数据范围内' as const }
  }
  const s = students.find((x) => x.studentId === studentId)
  const a = archives.find((x) => x.studentId === studentId)
  if (!s || !a) return { error: '未找到档案' as const }

  const profile = {
    studentId: s.studentId,
    name: s.name,
    gender: s.gender,
    schoolId: s.schoolId,
    schoolName: schoolName(s.schoolId),
    classId: s.classId,
    className: className(s.classId),
    grade: s.grade,
    status: s.status,
    lastAssessTime: a.lastAssessTime,
    isActive: a.isActive,
  }

  if (user.roleCode === 'head_teacher') {
    return {
      ...profile,
      currentRiskLevel: undefined,
      riskReason: undefined,
      partial: true,
    }
  }
  return {
    ...profile,
    currentRiskLevel: a.currentRiskLevel,
    riskReason: a.riskReason,
    partial: false,
  }
}

export function getTimeline(user: DemoUser, studentId: string) {
  if (user.roleCode === 'parent' || user.roleCode === 'student') {
    return { error: '无权查看时间线' as const }
  }
  if (!inScopeStudent(user, studentId)) {
    return { error: '不在数据范围内' as const }
  }

  const items: TimelineItem[] = []
  for (const b of behaviors.filter((x) => x.studentId === studentId)) {
    items.push({
      time: b.recordTime,
      source: 'behavior',
      summary: `行为观察：${b.tags} — ${b.description}`,
      refId: b.id,
    })
  }
  for (const e of stressEvents.filter((x) => x.studentId === studentId)) {
    items.push({
      time: e.occurTime,
      source: 'stress',
      summary: `应激事件：${e.eventType} — ${e.description}`,
      refId: e.id,
    })
  }
  for (const t of tickets.filter((x) => x.studentId === studentId)) {
    const levelPart =
      user.roleCode === 'head_teacher'
        ? ''
        : `（${riskLabel(t.riskLevel)}）`
    items.push({
      time: t.createTime,
      source: 'ticket',
      summary: `预警工单 ${t.ticketNo}${levelPart}：${t.triggerReason}`,
      refId: t.id,
    })
  }
  if (user.roleCode !== 'head_teacher') {
    for (const h of homeSchoolRecords.filter((x) => x.studentId === studentId)) {
      items.push({
        time: h.createTime,
        source: 'home_school',
        summary: `家校协同（${h.recordType}）已生成`,
        refId: h.id,
      })
    }
    for (const sc of scaleResults.filter((x) => x.studentId === studentId)) {
      items.push({
        time: sc.assessTime,
        source: 'scale',
        summary: `测评完成：${sc.scaleType}${canSeeRiskColor(user) ? `（总分 ${sc.totalScore}）` : ''}`,
        refId: sc.id,
      })
    }
  }

  items.sort((a, b) => (a.time < b.time ? 1 : -1))
  return { items }
}

export function listMyTickets(user: DemoUser) {
  if (
    user.roleCode === 'parent' ||
    user.roleCode === 'student'
  ) {
    return [] as Array<WarningTicket & { studentName: string }>
  }
  return tickets
    .filter((t) => t.assigneeId === user.id && t.status !== 'closed')
    .filter((t) => canProcessLevel(user, t.riskLevel))
    .map((t) => ({ ...t, studentName: studentName(t.studentId) }))
}

export function getTicket(user: DemoUser, id: number) {
  const t = tickets.find((x) => x.id === id)
  if (!t) return { error: '工单不存在' as const }
  if (!canProcessLevel(user, t.riskLevel) && user.roleCode !== 'district_center') {
    // 区中心可看橙红；其余按处理权限
    if (!canProcessLevel(user, t.riskLevel)) {
      return { error: '无权查看该等级工单' as const }
    }
  }
  if (user.roleCode === 'district_center' && t.riskLevel === 2) {
    return { error: '区心理中心不处理黄色工单（演练规则）' as const }
  }
  if (!inScopeStudent(user, t.studentId) && user.roleCode !== 'district_center') {
    return { error: '不在数据范围内' as const }
  }
  const logs = ticketLogs
    .filter((l) => l.ticketId === id)
    .sort((a, b) => (a.createTime < b.createTime ? -1 : 1))
  return {
    ticket: { ...t, studentName: studentName(t.studentId) },
    logs,
  }
}

export function processTicket(
  user: DemoUser,
  id: number,
  content: string,
) {
  const t = tickets.find((x) => x.id === id)
  if (!t) return { error: '工单不存在' as const }
  if (t.assigneeId !== user.id) return { error: '仅当前处理人可处理' as const }
  if (!canProcessLevel(user, t.riskLevel)) return { error: '无权处理该等级' as const }
  if (t.status === 'closed') return { error: '已关闭' as const }
  if (t.status === 'pending') t.status = 'processing'
  if (!t.respondTime) t.respondTime = nowStr()
  t.updateTime = nowStr()
  ticketLogs.push({
    id: nextIds.ticketLog++,
    ticketId: id,
    action: 'process',
    operatorId: user.id,
    content: content || '提交处理记录',
    createTime: nowStr(),
  })
  return { id: t.id, status: t.status, respondTime: t.respondTime }
}

export function closeTicket(user: DemoUser, id: number, content: string) {
  const t = tickets.find((x) => x.id === id)
  if (!t) return { error: '工单不存在' as const }
  if (t.assigneeId !== user.id) return { error: '仅当前处理人可关闭' as const }
  if (t.status === 'pending') return { error: '待响应状态不可直接关闭，请先处理' as const }
  if (t.status === 'closed') return { error: '已关闭' as const }
  t.status = 'closed'
  t.closeTime = nowStr()
  t.updateTime = nowStr()
  ticketLogs.push({
    id: nextIds.ticketLog++,
    ticketId: id,
    action: 'close',
    operatorId: user.id,
    content: content || '关闭工单',
    createTime: nowStr(),
  })
  return { id: t.id, status: t.status, closeTime: t.closeTime }
}

export function escalateTicket(user: DemoUser, id: number, content: string) {
  const t = tickets.find((x) => x.id === id)
  if (!t) return { error: '工单不存在' as const }
  if (t.assigneeId !== user.id) return { error: '仅当前处理人可升级' as const }
  const nextRole =
    t.assigneeRole === '班主任'
      ? '专职心理教师'
      : t.assigneeRole === '专职心理教师'
        ? t.riskLevel === 2
          ? '专职心理教师'
          : '区心理中心'
        : t.assigneeRole
  if (nextRole === t.assigneeRole && t.status === 'escalated') {
    return { error: '已在升级阶梯顶端' as const }
  }
  t.status = 'escalated'
  t.escalateCount += 1
  t.assigneeRole = nextRole
  t.assigneeId =
    nextRole === '专职心理教师'
      ? 2
      : nextRole === '区心理中心'
        ? 1
        : t.assigneeId
  t.updateTime = nowStr()
  ticketLogs.push({
    id: nextIds.ticketLog++,
    ticketId: id,
    action: 'escalate',
    operatorId: user.id,
    content: content || `升级至${nextRole}`,
    createTime: nowStr(),
  })
  return {
    id: t.id,
    status: t.status,
    assigneeRole: t.assigneeRole,
    assigneeId: t.assigneeId,
    escalateCount: t.escalateCount,
  }
}

export function listHomeSchoolReports(user: DemoUser, studentId?: string) {
  let list = homeSchoolRecords.filter((r) => r.recordType === '建议书')
  if (user.roleCode === 'parent') {
    list = list.filter((r) => user.childStudentIds?.includes(r.studentId))
  } else if (user.roleCode === 'psych_teacher') {
    list = list.filter((r) => {
      const s = students.find((x) => x.studentId === r.studentId)
      return s && s.schoolId === user.schoolId
    })
  } else {
    return { error: '当前角色无权查看建议书' as const }
  }
  if (studentId) list = list.filter((r) => r.studentId === studentId)
  return {
    items: list
      .map((r) => ({
        ...r,
        studentName: studentName(r.studentId),
      }))
      .sort((a, b) => (a.createTime < b.createTime ? 1 : -1)),
  }
}

export function signHomeSchool(user: DemoUser, recordId: number) {
  if (user.roleCode !== 'parent') return { error: '仅家长可签收' as const }
  const r = homeSchoolRecords.find((x) => x.id === recordId)
  if (!r) return { error: '记录不存在' as const }
  if (!user.childStudentIds?.includes(r.studentId)) {
    return { error: '非绑定学生' as const }
  }
  if (r.recordType !== '建议书') return { error: '演练版仅允许签收建议书' as const }
  if (!r.parentSigned) {
    r.parentSigned = 1
    r.signTime = nowStr()
  }
  return { id: r.id, parentSigned: r.parentSigned, signTime: r.signTime }
}

export function districtDashboard(user: DemoUser) {
  if (user.roleCode !== 'district_center') {
    return { error: '仅区心理中心可查看区级看板' as const }
  }
  const open = tickets.filter((t) => t.status !== 'closed')
  const riskCounts = { 1: 0, 2: 0, 3: 0, 4: 0 }
  for (const a of archives) riskCounts[a.currentRiskLevel]++
  const ticketRisk = { 2: 0, 3: 0, 4: 0 }
  for (const t of open) ticketRisk[t.riskLevel]++
  return {
    schoolCount: schools.length,
    studentCount: students.length,
    activeArchiveCount: archives.filter((a) => a.isActive === 1).length,
    ticketOpenCount: open.length,
    ticketOverdueCount: tickets.filter((t) => t.status === 'overdue').length,
    archiveRiskCounts: riskCounts,
    ticketRiskCounts: ticketRisk,
  }
}

export function schoolDashboard(user: DemoUser, schoolId?: number) {
  if (
    user.roleCode !== 'district_center' &&
    user.roleCode !== 'psych_teacher'
  ) {
    return { error: '无权查看校级台账' as const }
  }
  const sid =
    user.roleCode === 'psych_teacher'
      ? user.schoolId!
      : schoolId ?? 1
  if (user.roleCode === 'psych_teacher' && schoolId && schoolId !== user.schoolId) {
    return { error: '专职心理教师仅可查看本校' as const }
  }
  const list = students
    .filter((s) => s.schoolId === sid)
    .map((s) => {
      const a = archives.find((x) => x.studentId === s.studentId)!
      return {
        studentId: s.studentId,
        name: s.name,
        classId: s.classId,
        className: className(s.classId),
        grade: s.grade,
        currentRiskLevel: a.currentRiskLevel,
        lastAssessTime: a.lastAssessTime,
        isActive: a.isActive,
        openTicketCount: tickets.filter(
          (t) => t.studentId === s.studentId && t.status !== 'closed',
        ).length,
      }
    })
    .filter((x) => x.isActive === 1)
  return {
    schoolId: sid,
    schoolName: schoolName(sid),
    students: list,
  }
}

export function classDashboard(user: DemoUser, classId: number) {
  const cls = classes.find((c) => c.id === classId)
  if (!cls) return { error: '班级不存在' as const }

  if (user.roleCode === 'parent' || user.roleCode === 'student') {
    return { error: '无权查看班级波动' as const }
  }
  if (user.roleCode === 'head_teacher' && !user.classIds?.includes(classId)) {
    return { error: '班主任仅可查看本班' as const }
  }
  if (
    user.roleCode === 'psych_teacher' &&
    cls.schoolId !== user.schoolId
  ) {
    return { error: '专职心理教师仅可查看本校班级' as const }
  }

  const classStudents = students.filter((s) => s.classId === classId && s.status === 1)
  const ids = new Set(classStudents.map((s) => s.studentId))
  const behaviorCount = behaviors.filter((b) => ids.has(b.studentId)).length
  const openTicketCount = tickets.filter(
    (t) => ids.has(t.studentId) && t.status !== 'closed',
  ).length

  const result: {
    classId: number
    className: string
    studentCount: number
    behaviorCount: number
    openTicketCount: number
    archiveRiskCounts?: Record<number, number>
  } = {
    classId,
    className: cls.name,
    studentCount: classStudents.length,
    behaviorCount,
    openTicketCount,
  }

  if (canSeeRiskColor(user)) {
    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0 }
    for (const s of classStudents) {
      const a = archives.find((x) => x.studentId === s.studentId)
      if (a) counts[a.currentRiskLevel]++
    }
    result.archiveRiskCounts = counts
  }
  return result
}

export function submitScale(user: DemoUser, scaleType: string) {
  if (user.roleCode !== 'student' || !user.studentId) {
    return { error: '仅学生本人可提交测评' as const }
  }
  const id = nextIds.scale++
  // 演练：内部写入 mock 分，但不回传分数/风险
  scaleResults.push({
    id,
    studentId: user.studentId,
    scaleType,
    totalScore: 8,
    riskFlag: 0,
    isValid: 1,
    assessTime: nowStr(),
  })
  const a = archives.find((x) => x.studentId === user.studentId)
  if (a) a.lastAssessTime = nowStr()
  return {
    id,
    scaleType,
    assessTime: nowStr(),
    isValid: 1 as const,
    message: '测评已提交。演练版不返回量表分数与风险判断。',
  }
}

export function submitHelp(user: DemoUser, content: string) {
  if (user.roleCode !== 'student' || !user.studentId) {
    return { error: '仅学生本人可求助' as const }
  }
  const id = nextIds.help++
  const row = {
    id,
    studentId: user.studentId,
    content,
    status: 'received',
    createTime: nowStr(),
  }
  helpRequests.push(row)
  return { id, createTime: row.createTime, message: '已收到求助，演练版不自动创建工单。' }
}

export function riskLabel(level: number) {
  return ({ 1: '绿', 2: '黄', 3: '橙', 4: '红' } as Record<number, string>)[level] ?? String(level)
}

export function riskClass(level: number | null | undefined) {
  if (!level) return ''
  return ({ 1: 'risk-green', 2: 'risk-yellow', 3: 'risk-orange', 4: 'risk-red' } as Record<number, string>)[level] ?? ''
}

export type SignedReport = HomeSchoolRecord & { studentName: string }
