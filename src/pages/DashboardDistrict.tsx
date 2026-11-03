import { useRole } from '../context/RoleContext'
import { districtDashboard, riskClass, riskLabel } from '../mock/api'

export function DashboardDistrictPage() {
  const { user } = useRole()
  const data = districtDashboard(user)

  if ('error' in data) {
    return (
      <div className="panel">
        <div className="alert alert-err">{data.error}</div>
      </div>
    )
  }

  return (
    <>
      <div className="panel">
        <h2>东城区 · 态势概览</h2>
        <p className="hint">只读看板。指标为演练假设计数，非生产口径。</p>
        <div className="grid-stats">
          <div className="stat">
            <div className="label">学校数</div>
            <div className="value">{data.schoolCount}</div>
          </div>
          <div className="stat">
            <div className="label">学生数</div>
            <div className="value">{data.studentCount}</div>
          </div>
          <div className="stat">
            <div className="label">关注中档案</div>
            <div className="value">{data.activeArchiveCount}</div>
          </div>
          <div className="stat">
            <div className="label">未关闭工单</div>
            <div className="value">{data.ticketOpenCount}</div>
          </div>
          <div className="stat">
            <div className="label">逾期工单</div>
            <div className="value">{data.ticketOverdueCount}</div>
          </div>
        </div>
      </div>

      <div className="panel">
        <h2>档案风险分布</h2>
        <div className="grid-stats">
          {([1, 2, 3, 4] as const).map((lv) => (
            <div className="stat" key={lv}>
              <div className="label">
                <span className={`badge ${riskClass(lv)}`}>{riskLabel(lv)}</span>
              </div>
              <div className="value">{data.archiveRiskCounts[lv]}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="panel">
        <h2>未关闭工单等级</h2>
        <div className="grid-stats">
          {([2, 3, 4] as const).map((lv) => (
            <div className="stat" key={lv}>
              <div className="label">
                <span className={`badge ${riskClass(lv)}`}>{riskLabel(lv)}</span>
              </div>
              <div className="value">{data.ticketRiskCounts[lv]}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
