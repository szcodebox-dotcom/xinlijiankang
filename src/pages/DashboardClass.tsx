import { useMemo, useState } from 'react'
import { useRole } from '../context/RoleContext'
import { classDashboard, getClasses, riskClass, riskLabel } from '../mock/api'

export function DashboardClassPage() {
  const { user } = useRole()
  const allClasses = getClasses()
  const options = useMemo(() => {
    if (user.roleCode === 'head_teacher') {
      return allClasses.filter((c) => user.classIds?.includes(c.id))
    }
    if (user.roleCode === 'psych_teacher') {
      return allClasses.filter((c) => c.schoolId === user.schoolId)
    }
    return allClasses
  }, [user, allClasses])

  const [classId, setClassId] = useState(options[0]?.id ?? 101)
  const effectiveId = options.some((c) => c.id === classId)
    ? classId
    : options[0]?.id ?? classId
  const data = classDashboard(user, effectiveId)

  if ('error' in data) {
    return (
      <div className="panel">
        <div className="alert alert-err">{data.error}</div>
      </div>
    )
  }

  return (
    <div className="panel">
      <h2>班级波动 · {data.className}</h2>
      <p className="hint">
        只读。班主任无颜色计数；专职与区中心可见档案风险分布。
      </p>
      <div className="field">
        <label htmlFor="cls">选择班级</label>
        <select
          id="cls"
          value={effectiveId}
          onChange={(e) => setClassId(Number(e.target.value))}
        >
          {options.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div className="grid-stats">
        <div className="stat">
          <div className="label">在读人数</div>
          <div className="value">{data.studentCount}</div>
        </div>
        <div className="stat">
          <div className="label">行为记录数</div>
          <div className="value">{data.behaviorCount}</div>
        </div>
        <div className="stat">
          <div className="label">未关闭工单</div>
          <div className="value">{data.openTicketCount}</div>
        </div>
      </div>
      {data.archiveRiskCounts && (
        <>
          <h2 style={{ marginTop: 20, fontSize: '1rem' }}>本班风险分布</h2>
          <div className="grid-stats">
            {([1, 2, 3, 4] as const).map((lv) => (
              <div className="stat" key={lv}>
                <div className="label">
                  <span className={`badge ${riskClass(lv)}`}>{riskLabel(lv)}</span>
                </div>
                <div className="value">{data.archiveRiskCounts![lv]}</div>
              </div>
            ))}
          </div>
        </>
      )}
      {!data.archiveRiskCounts && (
        <p className="hint" style={{ marginTop: 16 }}>
          当前角色不返回风险颜色分布（班主任脱敏）。
        </p>
      )}
    </div>
  )
}
