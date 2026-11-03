import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useRole } from '../context/RoleContext'
import { getSchools, riskClass, riskLabel, schoolDashboard } from '../mock/api'

export function DashboardSchoolPage() {
  const { user } = useRole()
  const schools = getSchools()
  const [schoolId, setSchoolId] = useState(1)
  const data = schoolDashboard(
    user,
    user.roleCode === 'district_center' ? schoolId : undefined,
  )

  if ('error' in data) {
    return (
      <div className="panel">
        <div className="alert alert-err">{data.error}</div>
      </div>
    )
  }

  return (
    <div className="panel">
      <h2>{data.schoolName} · 重点关注台账</h2>
      <p className="hint">仅展示 is_active=1 的学生。含风险颜色（本页角色均有颜色权限）。</p>
      {user.roleCode === 'district_center' && (
        <div className="field">
          <label htmlFor="school">选择学校</label>
          <select
            id="school"
            value={schoolId}
            onChange={(e) => setSchoolId(Number(e.target.value))}
          >
            {schools.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      )}
      <table className="data">
        <thead>
          <tr>
            <th>姓名</th>
            <th>班级</th>
            <th>风险</th>
            <th>最近评估</th>
            <th>未关闭工单</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {data.students.map((s) => (
            <tr key={s.studentId}>
              <td>{s.name}</td>
              <td>{s.className}</td>
              <td>
                <span className={`badge ${riskClass(s.currentRiskLevel)}`}>
                  {riskLabel(s.currentRiskLevel)}
                </span>
              </td>
              <td>{s.lastAssessTime}</td>
              <td>{s.openTicketCount}</td>
              <td>
                <Link to={`/archives/${s.studentId}`}>档案</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
