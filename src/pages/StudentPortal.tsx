import { FormEvent, useState } from 'react'
import { useRole } from '../context/RoleContext'
import { submitHelp, submitScale } from '../mock/api'

export function StudentPortalPage() {
  const { user } = useRole()
  const [scaleType, setScaleType] = useState('PHQ9')
  const [help, setHelp] = useState('')
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  if (user.roleCode !== 'student') {
    return (
      <div className="panel">
        <div className="alert">请切换到「学生 · 王浩然」体验测评与求助入口。</div>
      </div>
    )
  }

  const onScale = (e: FormEvent) => {
    e.preventDefault()
    const res = submitScale(user, scaleType)
    if ('error' in res) setMsg({ type: 'err', text: res.error ?? '提交失败' })
    else setMsg({ type: 'ok', text: res.message })
  }

  const onHelp = (e: FormEvent) => {
    e.preventDefault()
    const res = submitHelp(user, help.trim() || '希望有人和我聊聊近况。')
    if ('error' in res) setMsg({ type: 'err', text: res.error ?? '发送失败' })
    else {
      setMsg({ type: 'ok', text: res.message })
      setHelp('')
    }
  }

  return (
    <>
      <div className="panel">
        <h2>你好，{user.name}</h2>
        <p className="hint">
          学籍号 {user.studentId}。学生端不展示风险等级、量表分数或病理术语。
        </p>
        {msg && (
          <div className={`alert ${msg.type === 'ok' ? 'alert-ok' : 'alert-err'}`}>
            {msg.text}
          </div>
        )}
      </div>

      <div className="panel">
        <h2>心理测评（Mock）</h2>
        <p className="hint">提交后仅确认已收到，不回真实常模分数。</p>
        <form onSubmit={onScale}>
          <div className="field">
            <label htmlFor="scale">量表类型</label>
            <select
              id="scale"
              value={scaleType}
              onChange={(e) => setScaleType(e.target.value)}
            >
              <option value="PHQ9">PHQ9（演练）</option>
              <option value="MHT">MHT（演练）</option>
              <option value="SCL90">SCL90（演练）</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary">
            提交测评
          </button>
        </form>
      </div>

      <div className="panel">
        <h2>求助</h2>
        <p className="hint">写入求助记录，演练版不自动创建预警工单。</p>
        <form onSubmit={onHelp}>
          <div className="field">
            <label htmlFor="help">想说的话</label>
            <textarea
              id="help"
              rows={3}
              value={help}
              onChange={(e) => setHelp(e.target.value)}
              placeholder="例如：最近压力有点大，想找老师聊聊。"
            />
          </div>
          <button type="submit" className="btn btn-primary">
            发送求助
          </button>
        </form>
      </div>
    </>
  )
}
