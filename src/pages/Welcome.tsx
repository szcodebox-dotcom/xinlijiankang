import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useRole } from '../context/RoleContext'
import type { RoleCode } from '../types'
import './Welcome.css'

/** 工作台默认落地（与 App 侧栏路由对齐） */
export function homeFor(role: RoleCode) {
  switch (role) {
    case 'parent':
      return '/home-school'
    case 'student':
      return '/student'
    case 'district_center':
      return '/dashboard/district'
    case 'head_teacher':
      return '/tickets'
    default:
      return '/tickets'
  }
}

const FLOW = [
  { label: '一人一档', to: '/archives', hint: '风险成因与关注状态' },
  { label: '预警工单', to: '/tickets', hint: '黄橙红分级响应' },
  { label: '家校留痕', to: '/home-school', hint: '建议书与签收' },
] as const

export function WelcomePage() {
  const { user, setUserId, allUsers } = useRole()
  const navigate = useNavigate()
  const [entered, setEntered] = useState(false)
  const [reduced, setReduced] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  const [sectionIn, setSectionIn] = useState(false)

  const canDistrict = user.roleCode === 'district_center'
  const workbenchPath = homeFor(user.roleCode)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const apply = () => setReduced(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  useEffect(() => {
    if (reduced) {
      setEntered(true)
      return
    }
    const id = requestAnimationFrame(() => setEntered(true))
    return () => cancelAnimationFrame(id)
  }, [reduced])

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    if (reduced) {
      setSectionIn(true)
      return
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSectionIn(true)
          io.disconnect()
        }
      },
      { threshold: 0.28 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [reduced])

  return (
    <div className={`welcome ${entered ? 'is-entered' : ''}${reduced ? ' is-reduced' : ''}`}>
      <header className="welcome-top">
        <Link to="/welcome" className="welcome-top-brand" aria-label="心联首页">
          心联
        </Link>
        <div className="welcome-top-role">
          <label htmlFor="welcome-role">体验角色</label>
          <select
            id="welcome-role"
            value={user.id}
            onChange={(e) => setUserId(Number(e.target.value))}
          >
            {allUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.roleName} · {u.name}
              </option>
            ))}
          </select>
        </div>
      </header>

      <section className="welcome-hero" aria-label="品牌主视觉">
        <div
          className="welcome-hero-media"
          style={{ backgroundImage: 'url(/hero-campus.jpg)' }}
          role="img"
          aria-label="清晨校园操场与教学楼侧光"
        />
        <div className="welcome-hero-veil" />
        <div className="welcome-hero-copy">
          <p className="welcome-brand-mark welcome-anim" data-i="0">
            心联
          </p>
          <p className="welcome-brand-sub welcome-anim" data-i="1">
            全区中小学心理健康数字化监测与协同干预平台 · 演练版
          </p>
          <h1 className="welcome-headline welcome-anim" data-i="2">
            把每一名学生的心理风险，接到可响应的协同链路上。
          </h1>
          <p className="welcome-support welcome-anim" data-i="3">
            监测 · 预警工单 · 一人一档 · 家校留痕——区校一体，职责可追踪。
          </p>
          <div className="welcome-cta welcome-anim" data-i="4">
            <Link to={workbenchPath} className="welcome-btn welcome-btn-primary">
              进入工作台
            </Link>
            {canDistrict ? (
              <Link to="/dashboard/district" className="welcome-btn welcome-btn-secondary">
                查看区级态势
              </Link>
            ) : (
              <button
                type="button"
                className="welcome-btn welcome-btn-secondary is-disabled"
                title="请切换为「区心理中心」角色后查看"
                disabled
              >
                查看区级态势
              </button>
            )}
          </div>
          {!canDistrict && (
            <p className="welcome-cta-hint welcome-anim" data-i="5">
              「区级态势」需区心理中心角色；可在右上角切换后重试。
            </p>
          )}
        </div>
      </section>

      <section
        ref={sectionRef}
        className={`welcome-section welcome-flow-section${sectionIn ? ' is-in' : ''}`}
        aria-labelledby="flow-heading"
      >
        <div className="welcome-section-inner">
          <h2 id="flow-heading">三道闭环</h2>
          <p className="welcome-section-lead">
            档案立得住、工单跟得上、家校留得下——产品骨架就这三道。
          </p>
          <ol className="welcome-flow" aria-label="闭环流程">
            {FLOW.map((step, i) => (
              <li key={step.to} style={{ ['--i' as string]: i }}>
                <button
                  type="button"
                  className="welcome-flow-node"
                  onClick={() => navigate(step.to)}
                >
                  <span className="welcome-flow-index">{String(i + 1).padStart(2, '0')}</span>
                  <span className="welcome-flow-label">{step.label}</span>
                  <span className="welcome-flow-hint">{step.hint}</span>
                </button>
                {i < FLOW.length - 1 && (
                  <span className="welcome-flow-rail" aria-hidden="true" />
                )}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="welcome-section welcome-start">
        <div className="welcome-section-inner">
          <h2>开始使用</h2>
          <p className="welcome-section-lead">
            当前体验为「{user.roleName} · {user.name}」。进入工作台后可通过侧栏切换业务模块。
          </p>
          <Link to={workbenchPath} className="welcome-btn welcome-btn-primary">
            进入工作台
          </Link>
        </div>
      </section>

      <footer className="welcome-footer">
        <p>全区中小学心理健康数字化监测与协同干预平台 · 心联</p>
        <p>演练版 · 无真实登录鉴权 · 数据为内存种子 · 不展示可识别学生隐私列表</p>
      </footer>
    </div>
  )
}
