import { Link } from 'react-router-dom'
import { useRole } from '../context/RoleContext'
import { listMyTickets, riskClass, riskLabel } from '../mock/api'

const STATUS_LABEL: Record<string, string> = {
  pending: '待响应',
  processing: '处理中',
  overdue: '已逾期',
  escalated: '已升级',
  closed: '已关闭',
}

export function TicketsPage() {
  const { user } = useRole()
  const rows = listMyTickets(user)

  if (user.roleCode === 'parent' || user.roleCode === 'student') {
    return (
      <div className="panel">
        <div className="alert">家长与学生无工单处理权限。</div>
      </div>
    )
  }

  return (
    <div className="panel">
      <h2>我的待办工单</h2>
      <p className="hint">
        按当前处理人过滤；黄 / 橙 / 红以色块区分。班主任仅黄；区中心看橙红；专职可处理各级。
      </p>
      {rows.length === 0 ? (
        <div className="alert">当前角色暂无待办工单。可切换其他角色查看种子数据。</div>
      ) : (
        <table className="data">
          <thead>
            <tr>
              <th>编号</th>
              <th>学生</th>
              <th>等级</th>
              <th>状态</th>
              <th>截止</th>
              <th>触发原因</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((t) => (
              <tr key={t.id}>
                <td>{t.ticketNo}</td>
                <td>
                  {t.studentName}
                  <br />
                  <span className="status-tag">{t.studentId}</span>
                </td>
                <td>
                  <span className={`badge ${riskClass(t.riskLevel)}`}>
                    {riskLabel(t.riskLevel)}
                  </span>
                </td>
                <td>{STATUS_LABEL[t.status] ?? t.status}</td>
                <td>{t.deadline}</td>
                <td>{t.triggerReason}</td>
                <td>
                  <Link to={`/tickets/${t.id}`}>处理</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
