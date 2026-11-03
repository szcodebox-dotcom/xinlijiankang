import { useState } from 'react'
import { useRole } from '../context/RoleContext'
import { listHomeSchoolReports, signHomeSchool } from '../mock/api'

export function HomeSchoolPage() {
  const { user } = useRole()
  const [, setTick] = useState(0)
  const [msg, setMsg] = useState<string | null>(null)
  const data = listHomeSchoolReports(user)

  if ('error' in data) {
    return (
      <div className="panel">
        <div className="alert alert-err">{data.error}</div>
        <p className="hint">请切换到「家长」或「专职心理教师」。</p>
      </div>
    )
  }

  const onSign = (id: number) => {
    const res = signHomeSchool(user, id)
    if ('error' in res) setMsg(res.error ?? '签收失败')
    else {
      setMsg(`已签收（记录 #${res.id}，时间 ${res.signTime ?? '—'}）`)
      setTick((n) => n + 1)
    }
  }

  return (
    <div className="panel">
      <h2>脱敏成长建议书</h2>
      <p className="hint">
        {user.roleCode === 'parent'
          ? '家长视角：仅显示绑定子女的建议书，可签收。不含风险等级与病理术语。'
          : '专职心理教师视角：本校学生建议书列表（只读演示）。'}
      </p>
      {msg && <div className="alert alert-ok" style={{ marginBottom: 12 }}>{msg}</div>}
      {data.items.length === 0 ? (
        <div className="alert">暂无建议书。</div>
      ) : (
        data.items.map((r) => (
          <div className="report-card" key={r.id}>
            <div className="meta-row">
              <div>
                <dt>学生</dt>
                <dd>
                  {r.studentName}（{r.studentId}）
                </dd>
              </div>
              <div>
                <dt>生成时间</dt>
                <dd>{r.createTime}</dd>
              </div>
              <div>
                <dt>签收状态</dt>
                <dd>
                  {r.parentSigned
                    ? `已签收 · ${r.signTime}`
                    : '未签收'}
                </dd>
              </div>
            </div>
            <p style={{ margin: '12px 0', lineHeight: 1.65 }}>{r.content}</p>
            {user.roleCode === 'parent' && !r.parentSigned && (
              <button type="button" className="btn btn-primary" onClick={() => onSign(r.id)}>
                确认签收
              </button>
            )}
          </div>
        ))
      )}
    </div>
  )
}
