import { Link, useParams } from 'react-router-dom'
import { useRole } from '../context/RoleContext'
import { getArchive, getTimeline, riskClass, riskLabel } from '../mock/api'

export function ArchiveDetailPage() {
  const { studentId = '' } = useParams()
  const { user } = useRole()
  const archive = getArchive(user, studentId)
  const timeline = getTimeline(user, studentId)

  if ('error' in archive) {
    return (
      <div className="panel">
        <div className="alert alert-err">{archive.error}</div>
        <p><Link to="/archives">返回列表</Link></p>
      </div>
    )
  }

  return (
    <>
      <div className="panel">
        <p><Link to="/archives">← 返回列表</Link></p>
        <h2>{archive.name}</h2>
        <p className="hint">
          {archive.partial
            ? '班主任「部分」档案：无风险颜色、无成因摘要。'
            : '完整一人一档（演练脱敏规则已按角色过滤）。'}
        </p>
        <dl className="meta-row">
          <div>
            <dt>学籍号</dt>
            <dd>{archive.studentId}</dd>
          </div>
          <div>
            <dt>性别</dt>
            <dd>{archive.gender === 1 ? '男' : '女'}</dd>
          </div>
          <div>
            <dt>学校</dt>
            <dd>{archive.schoolName}</dd>
          </div>
          <div>
            <dt>班级</dt>
            <dd>{archive.className}</dd>
          </div>
          <div>
            <dt>在读状态</dt>
            <dd>{archive.status === 1 ? '在读' : '其他'}</dd>
          </div>
          <div>
            <dt>关注中</dt>
            <dd>{archive.isActive ? '是' : '否'}</dd>
          </div>
          <div>
            <dt>最近评估</dt>
            <dd>{archive.lastAssessTime}</dd>
          </div>
          {!archive.partial && (
            <>
              <div>
                <dt>风险等级</dt>
                <dd>
                  <span className={`badge ${riskClass(archive.currentRiskLevel)}`}>
                    {riskLabel(archive.currentRiskLevel!)}
                  </span>
                </dd>
              </div>
              <div>
                <dt>成因摘要</dt>
                <dd>{archive.riskReason}</dd>
              </div>
            </>
          )}
        </dl>
      </div>

      <div className="panel">
        <h2>动态时间线</h2>
        <p className="hint">聚合行为、应激、工单等（班主任不含家校与量表分）。</p>
        {'error' in timeline ? (
          <div className="alert alert-err">{timeline.error}</div>
        ) : (
          <ul className="timeline">
            {timeline.items.map((item, i) => (
              <li key={`${item.source}-${item.refId}-${i}`}>
                <div className="time">{item.time} · {item.source}</div>
                <div className="summary">{item.summary}</div>
              </li>
            ))}
            {timeline.items.length === 0 && (
              <li>
                <div className="summary">暂无动态</div>
              </li>
            )}
          </ul>
        )}
      </div>
    </>
  )
}
