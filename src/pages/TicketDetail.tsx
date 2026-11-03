import { FormEvent, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useRole } from '../context/RoleContext'
import {
  closeTicket,
  escalateTicket,
  getTicket,
  processTicket,
  riskClass,
  riskLabel,
} from '../mock/api'

const STATUS_LABEL: Record<string, string> = {
  pending: '待响应',
  processing: '处理中',
  overdue: '已逾期',
  escalated: '已升级',
  closed: '已关闭',
}

export function TicketDetailPage() {
  const { id = '' } = useParams()
  const { user } = useRole()
  const [, setTick] = useState(0)
  const [content, setContent] = useState('')
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  const refresh = () => setTick((n) => n + 1)
  const data = getTicket(user, Number(id))

  if ('error' in data) {
    return (
      <div className="panel">
        <div className="alert alert-err">{data.error}</div>
        <p><Link to="/tickets">返回待办</Link></p>
      </div>
    )
  }

  const { ticket, logs } = data

  const onProcess = (e: FormEvent) => {
    e.preventDefault()
    const res = processTicket(user, ticket.id, content)
    if ('error' in res) setMsg({ type: 'err', text: res.error ?? '处理失败' })
    else {
      setMsg({ type: 'ok', text: `已处理，状态：${STATUS_LABEL[res.status]}` })
      setContent('')
      refresh()
    }
  }

  const onClose = () => {
    const res = closeTicket(user, ticket.id, content || '演练关闭')
    if ('error' in res) setMsg({ type: 'err', text: res.error ?? '关闭失败' })
    else {
      setMsg({ type: 'ok', text: '工单已关闭' })
      refresh()
    }
  }

  const onEscalate = () => {
    const res = escalateTicket(user, ticket.id, content || '演练升级')
    if ('error' in res) setMsg({ type: 'err', text: res.error ?? '升级失败' })
    else {
      setMsg({ type: 'ok', text: `已升级至 ${res.assigneeRole}` })
      refresh()
    }
  }

  return (
    <>
      <div className="panel">
        <p><Link to="/tickets">← 返回待办</Link></p>
        <h2>
          {ticket.ticketNo}{' '}
          <span className={`badge ${riskClass(ticket.riskLevel)}`}>
            {riskLabel(ticket.riskLevel)}
          </span>
        </h2>
        <dl className="meta-row">
          <div>
            <dt>学生</dt>
            <dd>
              {ticket.studentName}（{ticket.studentId}）
            </dd>
          </div>
          <div>
            <dt>状态</dt>
            <dd>{STATUS_LABEL[ticket.status]}</dd>
          </div>
          <div>
            <dt>处理角色</dt>
            <dd>{ticket.assigneeRole}</dd>
          </div>
          <div>
            <dt>截止时间</dt>
            <dd>{ticket.deadline}</dd>
          </div>
          <div>
            <dt>升级次数</dt>
            <dd>{ticket.escalateCount}</dd>
          </div>
          <div>
            <dt>触发原因</dt>
            <dd>{ticket.triggerReason}</dd>
          </div>
        </dl>
      </div>

      <div className="panel">
        <h2>处理操作</h2>
        <p className="hint">演练：提交说明 → 处理；可关闭或升级（不改风险等级）。</p>
        {msg && (
          <div className={`alert ${msg.type === 'ok' ? 'alert-ok' : 'alert-err'}`} style={{ marginBottom: 12 }}>
            {msg.text}
          </div>
        )}
        {ticket.status === 'closed' ? (
          <div className="alert">工单已关闭，不可再操作。</div>
        ) : ticket.assigneeId !== user.id ? (
          <div className="alert">当前登录人不是本工单处理人，仅可查看。</div>
        ) : (
          <form onSubmit={onProcess}>
            <div className="field">
              <label htmlFor="content">处理说明</label>
              <textarea
                id="content"
                rows={3}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="填写观察或评估说明（写入流转日志）"
              />
            </div>
            <div className="actions">
              <button type="submit" className="btn btn-primary">
                提交处理
              </button>
              <button type="button" className="btn" onClick={onEscalate}>
                手动升级
              </button>
              <button type="button" className="btn btn-danger" onClick={onClose}>
                关闭工单
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="panel">
        <h2>流转日志</h2>
        <ul className="timeline">
          {logs.map((l) => (
            <li key={l.id}>
              <div className="time">
                {l.createTime} · {l.action}
              </div>
              <div className="summary">{l.content}</div>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
