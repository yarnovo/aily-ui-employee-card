import { useEffect, useRef, useState } from 'react'
import { Play, Pause } from '@aily-ui/icons'
import type { EmployeeCardProps, EmployeeCardScenario } from './EmployeeCard.types'
import {
  pickAvatarText,
  shouldRenderTts,
  shouldRenderScenarioTts,
  shouldRenderPromises,
} from './EmployeeCard.behavior'
import './EmployeeCard.css'

/** 秒 → "0:32" / "1:05" 字符串 */
function formatSec(s: number): string {
  if (!isFinite(s) || s < 0) return '0:00'
  const m = Math.floor(s / 60)
  const r = Math.floor(s % 60)
  return `${m}:${r.toString().padStart(2, '0')}`
}

/** scenario mini TTS player · 单条 scenario 真自介音频
 *
 * 跟主 TTS player 同行为 · 但更小:
 * - 14px Play / Pause icon (不带进度 + 不带秒数)
 * - 跟 scenario quote 真同行 · 内联在 quote 末尾
 */
function ScenarioTtsPlayer(props: {
  url: string
  testId: string
  disabled?: boolean
}) {
  const { url, testId, disabled = false } = props
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const a = audioRef.current
    if (!a) return
    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    const onEnded = () => {
      setPlaying(false)
      a.currentTime = 0
    }
    a.addEventListener('play', onPlay)
    a.addEventListener('pause', onPause)
    a.addEventListener('ended', onEnded)
    return () => {
      a.removeEventListener('play', onPlay)
      a.removeEventListener('pause', onPause)
      a.removeEventListener('ended', onEnded)
    }
  }, [])

  const toggle = () => {
    const a = audioRef.current
    if (!a) return
    if (playing) {
      a.pause()
      a.currentTime = 0
    } else {
      const p = a.play()
      if (p && typeof p.catch === 'function') p.catch(() => setPlaying(false))
    }
  }

  return (
    <span
      className="ak-employee-card__scenario-tts"
      data-testid={testId}
    >
      <audio ref={audioRef} src={url} preload="metadata" />
      <button
        type="button"
        className="ak-employee-card__scenario-tts-btn"
        onClick={toggle}
        disabled={disabled}
        data-testid={`${testId}-play`}
        aria-label={playing ? '停止播放' : '播放案例音频'}
      >
        {playing ? <Pause size={14} /> : <Play size={14} />}
      </button>
    </span>
  )
}

/** akong EmployeeCard · Web · agent 员工求职简历卡片 (UX A 版)
 *
 * 视觉:
 *   ┌──────────────────────────────────────┐
 *   │ 头像  阿空小研 · user_researcher      │
 *   │       "你 12h 聊 12 用户挖 2 洞察 ·   │
 *   │        我帮你只挖 5 条" (访谈原话)    │
 *   │                                       │
 *   │  [▶] ━━━━━ 0:30           听我自介  │
 *   │ ─────────────────────────────────────│
 *   │  上次帮美妆 DTC                       │
 *   │  "聊 30 用户 · 挖 5 条洞察"  [▶]     │
 *   │                                       │
 *   │  按 Mom Test                          │
 *   │  "不堆 ChatGPT 套话 · 不诱导"        │
 *   │                                       │
 *   │  我不做                               │
 *   │  "不写周报 · 不画 PPT · 不替你拍板"  │
 *   │ ─────────────────────────────────────│
 *   │  [先聊 5 分钟]   [选 ta]              │
 *   └──────────────────────────────────────┘
 *
 * data-testid 全 (e2e 真用):
 *   - employee-card (root · 默认 · 可 props 覆盖)
 *   - employee-card-name / employee-card-role / employee-card-tagline
 *   - employee-card-avatar
 *   - employee-card-tts-play  (主 ▶ icon 按钮)
 *   - employee-card-tts-time
 *   - employee-card-scenario-{i}  (i: 0/1/2)
 *   - employee-card-scenario-{i}-title
 *   - employee-card-scenario-{i}-quote
 *   - employee-card-scenario-{i}-tts (整段 mini player wrapper · 有 url 才存)
 *   - employee-card-scenario-{i}-tts-play (mini ▶ icon 按钮)
 *   - employee-card-promises (整段 wrapper · 有 promises 才渲)
 *   - employee-card-promises-quote
 *   - employee-card-try-btn  (副按钮 [先聊 5 分钟])
 *   - employee-card-select-btn (主按钮 [选 ta])
 */
export function EmployeeCard(props: EmployeeCardProps) {
  const {
    intro,
    scenarios,
    promises,
    onSelect,
    onTry,
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
  const renderPromises = shouldRenderPromises(promises)
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
          <p
            className="ak-employee-card__tagline"
            data-testid="employee-card-tagline"
          >
            &ldquo;{intro.tagline}&rdquo;
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
            {playing ? <Pause size={20} /> : <Play size={20} />}
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
          <span className="ak-employee-card__tts-label" aria-hidden="true">
            听我自介
          </span>
        </div>
      )}

      <div className="ak-employee-card__scenarios" data-testid="employee-card-scenarios">
        {scenarios.map((sc: EmployeeCardScenario, i: number) => (
          <div
            key={i}
            className="ak-employee-card__scenario"
            data-testid={`employee-card-scenario-${i}`}
          >
            <p
              className="ak-employee-card__scenario-title"
              data-testid={`employee-card-scenario-${i}-title`}
            >
              {sc.title}
            </p>
            <p
              className="ak-employee-card__scenario-quote"
              data-testid={`employee-card-scenario-${i}-quote`}
            >
              <span className="ak-employee-card__scenario-quote-text">
                &ldquo;{sc.quote}&rdquo;
              </span>
              {shouldRenderScenarioTts(sc) && (
                <ScenarioTtsPlayer
                  url={sc.tts_audio_url!}
                  testId={`employee-card-scenario-${i}-tts`}
                  disabled={disabled}
                />
              )}
            </p>
          </div>
        ))}
      </div>

      {renderPromises && (
        <div
          className="ak-employee-card__promises"
          data-testid="employee-card-promises"
        >
          <p className="ak-employee-card__scenario-title">我不做</p>
          <p
            className="ak-employee-card__scenario-quote"
            data-testid="employee-card-promises-quote"
          >
            <span className="ak-employee-card__scenario-quote-text">
              &ldquo;{promises!.filter((p) => p && p.length > 0).join(' · ')}&rdquo;
            </span>
          </p>
        </div>
      )}

      <div className="ak-employee-card__actions">
        <button
          type="button"
          className="ak-employee-card__btn"
          onClick={onTry}
          disabled={disabled || !onTry}
          data-testid="employee-card-try-btn"
        >
          先聊 5 分钟
        </button>
        <button
          type="button"
          className="ak-employee-card__btn ak-employee-card__btn--primary"
          onClick={onSelect}
          disabled={disabled || !onSelect}
          data-testid="employee-card-select-btn"
        >
          选 ta
        </button>
      </div>
    </div>
  )
}

export default EmployeeCard
