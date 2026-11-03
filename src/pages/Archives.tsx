import { Link } from 'react-router-dom'
import { useRole } from '../context/RoleContext'
import { listArchives, riskClass, riskLabel } from '../mock/api'

export function ArchivesPage() {
  const { user } = useRole()
  const rows = listArchives(user)

  if (user.roleCode === 'parent' || user.roleCode === 'student') {
    return (
      <div className="panel">
        <div className="alert">当前角色无权查看一人一档。请切换到专职心理教师、班主任或区心理中心。</div>
      </div>
    )
  }

  return (
    <div className="panel">
      <h2>关注对象列表</h2>
      <p className="hint">
        {user.roleCode === 'head_teacher'
          ? '班主任视角：仅本班，不显示风险颜色与成因摘要。'
          : user.roleCode === 'psych_teacher'
            ? '专职心理教师视角：本校完整档案（含风险颜色）。'
            : '区心理中心视角：全区学生档案。'}
      </p>
      <table className="data">
        <thead>
          <tr>
            <th>学籍号</th>
            <th>姓名</th>
            <th>学校 / 班级</th>
            <th>关注中</th>
            {user.roleCode !== 'head_teacher' && <th>风险</th>}
            <th>最近评估</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) =>
            r ? (
              <tr key={r.studentId}>
                <td>{r.studentId}</td>
                <td>{r.name}</td>
                <td>
                  {r.schoolName}
                  <br />
                  <span className="status-tag">{r.className}</span>
                </td>
                <td>{r.isActive ? '是' : '否'}</td>
                {user.roleCode !== 'head_teacher' && (
                  <td>
                    {r.currentRiskLevel != null ? (
                      <span className={`badge ${riskClass(r.currentRiskLevel)}`}>
                        {riskLabel(r.currentRiskLevel)}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                )}
                <td>{r.lastAssessTime}</td>
                <td>
                  <Link to={`/archives/${r.studentId}`}>详情</Link>
                </td>
              </tr>
            ) : null,
          )}
        </tbody>
      </table>
    </div>
  )
}
