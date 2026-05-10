import { useEffect, useRef, useState } from 'react'
import type { EmployeeCardProps } from './EmployeeCard.types'
import { pickAvatarText, shouldRenderTts } from './EmployeeCard.behavior'
import './EmployeeCard.css'

/** 秒 → "0:32" / "1:05" 字符串 */
function formatSec(s: number): string {
  if (!isFinite(s) || s < 0) return '0:00'
  const m = Math.floor(s / 60)
  const r = Math.floor(s % 60)
  return `${m}:${r.toString().padStart(2, '0')}`
}

/** akong EmployeeCard · Web · agent 员工求职简历卡片
 *
 * 视觉:
 *   ┌──┐  阿空小研 · user_researcher
 *   │研│  真懂消费品 · 真挖真痛
 *   └──┘  ▶ 30s 真音频自介
 *   真过往案例:
 *   ✓ 真聊 30 个真用户 · 真给 5 条真洞察
 *   ✓ 真按 Mom Test · 不堆 ChatGPT 套话
 *   真月费 ¥800 · 真含 80 真聊
 *   [选这个] [跳过] [改改]
 *
 * data-testid 全 (e2e 真用):
 *   - employee-card (root · 默认 · 可 props 覆盖)
 *   - employee-card-name / employee-card-role / employee-card-tagline
 *   - employee-card-avatar
 *   - employee-card-tts-play  (▶ 按钮)
 *   - employee-card-tts-time
 *   - employee-card-scenario-{i}  (i: 0/1/2)
 *   - employee-card-pricing
 *   - employee-card-select-btn / employee-card-skip-btn / employee-card-edit-btn
 */
export function EmployeeCard(props: EmployeeCardProps) {
  const {
    intro,
    scenarios,
    pricing_hint,
    onSelect,
    onSkip,
    onEdit,
    disabled = false,
    className,
    'data-testid': testId = 'employee-card',
  } = props

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)
  const [current, setCurrent] = useState(0)
  const [duration, setDuration] = useState(0)

  // 同步真 audio 元素的事件 → react state (受控 player)
  useEffect(() => {
    const a = audioRef.current
    if (!a) return
    const onTime = () => setCurrent(a.currentTime)
    const onLoaded = () => setDuration(isFinite(a.duration) ? a.duration : 0)
    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    const onEnded = () => {
      setPlaying(false)
      setCurrent(0)
      a.currentTime = 0
    }
    a.addEventListener('timeupdate', onTime)
    a.addEventListener('loadedmetadata', onLoaded)
    a.addEventListener('durationchange', onLoaded)
    a.addEventListener('play', onPlay)
    a.addEventListener('pause', onPause)
    a.addEventListener('ended', onEnded)
    return () => {
      a.removeEventListener('timeupdate', onTime)
      a.removeEventListener('loadedmetadata', onLoaded)
      a.removeEventListener('durationchange', onLoaded)
      a.removeEventListener('play', onPlay)
      a.removeEventListener('pause', onPause)
      a.removeEventListener('ended', onEnded)
    }
  }, [])

  const togglePlay = () => {
    const a = audioRef.current
    if (!a) return
    if (playing) {
      a.pause()
      a.currentTime = 0
      setCurrent(0)
    } else {
      const p = a.play()
      if (p && typeof p.catch === 'function') p.catch(() => setPlaying(false))
    }
  }

  const renderTts = shouldRenderTts(intro)
  const avatarText = pickAvatarText(intro)
  const progressPct = duration > 0 ? Math.min(100, (current / duration) * 100) : 0

  return (
    <div
      className={['ak-employee-card', className].filter(Boolean).join(' ')}
      data-testid={testId}
    >
      <div className="ak-employee-card__header">
        <div className="ak-employee-card__avatar" data-testid="employee-card-avatar">
          {intro.avatar_url ? (
            <img src={intro.avatar_url} alt={intro.name} />
          ) : (
            <span>{avatarText}</span>
          )}
        </div>
        <div className="ak-employee-card__heading">
          <h3 className="ak-employee-card__name">
            <span data-testid="employee-card-name">{intro.name}</span>
            <span className="ak-employee-card__role" data-testid="employee-card-role">
              · {intro.role}
            </span>
          </h3>
          <p className="ak-employee-card__tagline" data-testid="employee-card-tagline">
            {intro.tagline}
          </p>
        </div>
      </div>

      {renderTts && (
        <div className="ak-employee-card__tts" data-testid="employee-card-tts">
          <audio ref={audioRef} src={intro.tts_audio_url} preload="metadata" />
          <button
            type="button"
            className="ak-employee-card__tts-btn"
            onClick={togglePlay}
            disabled={disabled}
            data-testid="employee-card-tts-play"
            aria-label={playing ? '停止播放' : '播放自介音频'}
          >
            {playing ? '■' : '▶'}
          </button>
          <div className="ak-employee-card__tts-progress" aria-hidden="true">
            <div
              className="ak-employee-card__tts-bar"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="ak-employee-card__tts-time" data-testid="employee-card-tts-time">
            {formatSec(current)} / {formatSec(duration)}
          </span>
        </div>
      )}

      <div>
        <p className="ak-employee-card__section-title">真过往案例</p>
        <ul className="ak-employee-card__scenarios">
          {scenarios.map((sc, i) => (
            <li
              key={i}
              className="ak-employee-card__scenario"
              data-testid={`employee-card-scenario-${i}`}
            >
              <span className="ak-employee-card__scenario-check">✓</span>
              <span>
                {sc.title}
                {sc.bdd && (
                  <span className="ak-employee-card__scenario-bdd"> — {sc.bdd}</span>
                )}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <p className="ak-employee-card__pricing" data-testid="employee-card-pricing">
        {pricing_hint}
      </p>

      <div className="ak-employee-card__actions">
        <button
          type="button"
          className="ak-employee-card__btn ak-employee-card__btn--primary"
          onClick={onSelect}
          disabled={disabled || !onSelect}
          data-testid="employee-card-select-btn"
        >
          选这个
        </button>
        <button
          type="button"
          className="ak-employee-card__btn"
          onClick={onSkip}
          disabled={disabled || !onSkip}
          data-testid="employee-card-skip-btn"
        >
          跳过
        </button>
        <button
          type="button"
          className="ak-employee-card__btn"
          onClick={onEdit}
          disabled={disabled || !onEdit}
          data-testid="employee-card-edit-btn"
        >
          改改
        </button>
      </div>
    </div>
  )
}

export default EmployeeCard
