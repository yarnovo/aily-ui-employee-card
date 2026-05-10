/**
 * Web 端组件测试 · vitest + @testing-library/react
 *
 * 覆盖 acceptance #3 (≥ 6 case):
 * - 渲染 props (name / role / tagline / pricing / scenarios)
 * - onSelect / onSkip / onEdit 触发
 * - TTS player 渲 (intro.tts_audio_url 存在时)
 * - TTS 不渲 (intro.tts_audio_url 不存在时)
 * - TTS play 切换 (▶ → ■ · 调 audio.play)
 * - 真按钮 disabled (无 handler 时 disabled · disabled prop 时全禁)
 * - 共享 spec (validateScenarios / pickAvatarText / shouldRenderTts)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createElement } from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { EmployeeCard } from '../src/EmployeeCard'
import type { EmployeeCardProps } from '../src/EmployeeCard.types'
import {
  validateScenarios,
  pickAvatarText,
  shouldRenderTts,
  isActionEnabled,
  sampleProps,
} from '../src/EmployeeCard.behavior'

function makeProps(overrides: Partial<EmployeeCardProps> = {}): EmployeeCardProps {
  return {
    ...sampleProps,
    onSelect: vi.fn(),
    onSkip: vi.fn(),
    onEdit: vi.fn(),
    ...overrides,
  }
}

beforeEach(() => {
  // jsdom 不真支持 HTMLMediaElement.play · stub 成 resolved promise
  if (!('play' in HTMLMediaElement.prototype)) return
  ;(HTMLMediaElement.prototype as unknown as { play: () => Promise<void> }).play = vi.fn(
    () => Promise.resolve()
  )
  ;(HTMLMediaElement.prototype as unknown as { pause: () => void }).pause = vi.fn(() => undefined)
})

describe('EmployeeCard · 渲染 props', () => {
  it('渲染 name / role / tagline / pricing', () => {
    render(createElement(EmployeeCard, makeProps()))
    expect(screen.getByTestId('employee-card-name')).toHaveTextContent('阿空小研')
    expect(screen.getByTestId('employee-card-role')).toHaveTextContent('user_researcher')
    expect(screen.getByTestId('employee-card-tagline')).toHaveTextContent('真懂消费品 · 真挖真痛')
    expect(screen.getByTestId('employee-card-pricing')).toHaveTextContent('¥800/月')
  })

  it('渲染 1-3 条 scenarios · index 化 testid', () => {
    render(createElement(EmployeeCard, makeProps()))
    expect(screen.getByTestId('employee-card-scenario-0')).toHaveTextContent(
      '真聊 30 个真用户 · 真给 5 条真洞察'
    )
    expect(screen.getByTestId('employee-card-scenario-1')).toBeInTheDocument()
    expect(screen.getByTestId('employee-card-scenario-2')).toBeInTheDocument()
  })

  it('avatar 没 url · 渲 fallback 文字', () => {
    render(
      createElement(
        EmployeeCard,
        makeProps({
          intro: {
            slug: 'xy',
            name: '阿空小研',
            role: 'user_researcher',
            tagline: 't',
            avatar_text: '研',
          },
        })
      )
    )
    expect(screen.getByTestId('employee-card-avatar')).toHaveTextContent('研')
  })

  it('avatar 有 url · 渲 <img>', () => {
    render(
      createElement(
        EmployeeCard,
        makeProps({
          intro: {
            slug: 'xy',
            name: '阿空小研',
            role: 'user_researcher',
            tagline: 't',
            avatar_url: 'https://example.com/x.png',
          },
        })
      )
    )
    const avatarBox = screen.getByTestId('employee-card-avatar')
    const img = avatarBox.querySelector('img')
    expect(img).not.toBeNull()
    expect(img?.getAttribute('src')).toBe('https://example.com/x.png')
  })
})

describe('EmployeeCard · 按钮回调', () => {
  it('onSelect 真触发', () => {
    const props = makeProps()
    render(createElement(EmployeeCard, props))
    fireEvent.click(screen.getByTestId('employee-card-select-btn'))
    expect(props.onSelect).toHaveBeenCalledTimes(1)
  })

  it('onSkip 真触发', () => {
    const props = makeProps()
    render(createElement(EmployeeCard, props))
    fireEvent.click(screen.getByTestId('employee-card-skip-btn'))
    expect(props.onSkip).toHaveBeenCalledTimes(1)
  })

  it('onEdit 真触发', () => {
    const props = makeProps()
    render(createElement(EmployeeCard, props))
    fireEvent.click(screen.getByTestId('employee-card-edit-btn'))
    expect(props.onEdit).toHaveBeenCalledTimes(1)
  })

  it('无 handler · 按钮 disabled', () => {
    render(
      createElement(EmployeeCard, {
        ...sampleProps,
        // 不提供 onSelect / onSkip / onEdit
      })
    )
    expect(screen.getByTestId('employee-card-select-btn')).toBeDisabled()
    expect(screen.getByTestId('employee-card-skip-btn')).toBeDisabled()
    expect(screen.getByTestId('employee-card-edit-btn')).toBeDisabled()
  })

  it('disabled prop · 真禁所有按钮', () => {
    const props = makeProps({ disabled: true })
    render(createElement(EmployeeCard, props))
    expect(screen.getByTestId('employee-card-select-btn')).toBeDisabled()
    expect(screen.getByTestId('employee-card-skip-btn')).toBeDisabled()
    expect(screen.getByTestId('employee-card-edit-btn')).toBeDisabled()
    expect(screen.getByTestId('employee-card-tts-play')).toBeDisabled()
  })
})

describe('EmployeeCard · TTS player', () => {
  it('intro.tts_audio_url 存在 · 真渲 player', () => {
    render(createElement(EmployeeCard, makeProps()))
    expect(screen.getByTestId('employee-card-tts')).toBeInTheDocument()
    expect(screen.getByTestId('employee-card-tts-play')).toBeInTheDocument()
    expect(screen.getByTestId('employee-card-tts-time')).toHaveTextContent('0:00 / 0:00')
  })

  it('intro.tts_audio_url 不存在 · 不渲 player', () => {
    render(
      createElement(
        EmployeeCard,
        makeProps({
          intro: {
            slug: 'xy',
            name: '阿空小研',
            role: 'user_researcher',
            tagline: 't',
            avatar_text: '研',
            // 无 tts_audio_url
          },
        })
      )
    )
    expect(screen.queryByTestId('employee-card-tts')).toBeNull()
    expect(screen.queryByTestId('employee-card-tts-play')).toBeNull()
  })

  it('点 ▶ · 真调 audio.play', () => {
    render(createElement(EmployeeCard, makeProps()))
    const btn = screen.getByTestId('employee-card-tts-play')
    fireEvent.click(btn)
    // play 已 stub · 至少调 1 次
    const playMock = (HTMLMediaElement.prototype as unknown as {
      play: ReturnType<typeof vi.fn>
    }).play
    expect(playMock).toHaveBeenCalled()
  })
})

describe('EmployeeCard · 自定义 testid', () => {
  it('props["data-testid"] 真覆盖 root testid', () => {
    render(createElement(EmployeeCard, makeProps({ 'data-testid': 'card-1' })))
    expect(screen.getByTestId('card-1')).toBeInTheDocument()
    expect(screen.queryByTestId('employee-card')).toBeNull()
  })
})

describe('behavior spec · 跨端共用', () => {
  it('validateScenarios · 空数组 · ko', () => {
    expect(validateScenarios([])).toEqual({ ok: false, reason: 'scenarios 不能为空' })
  })
  it('validateScenarios · 4 条 · ko', () => {
    expect(
      validateScenarios([{ title: 'a' }, { title: 'b' }, { title: 'c' }, { title: 'd' }])
    ).toEqual({ ok: false, reason: 'scenarios 最多 3 条' })
  })
  it('validateScenarios · 1-3 条 · ok', () => {
    expect(validateScenarios([{ title: 'a' }]).ok).toBe(true)
    expect(validateScenarios([{ title: 'a' }, { title: 'b' }]).ok).toBe(true)
    expect(validateScenarios([{ title: 'a' }, { title: 'b' }, { title: 'c' }]).ok).toBe(true)
  })
  it('pickAvatarText · 优先 avatar_text', () => {
    expect(
      pickAvatarText({
        slug: 'x',
        name: '阿空小研',
        role: 'r',
        tagline: 't',
        avatar_text: '研',
      })
    ).toBe('研')
  })
  it('pickAvatarText · fallback name 最后 1 字', () => {
    expect(
      pickAvatarText({ slug: 'x', name: '阿空小研', role: 'r', tagline: 't' })
    ).toBe('研')
  })
  it('shouldRenderTts · url 存在 / 不存在', () => {
    expect(
      shouldRenderTts({
        slug: 'x',
        name: 'n',
        role: 'r',
        tagline: 't',
        tts_audio_url: 'https://x',
      })
    ).toBe(true)
    expect(
      shouldRenderTts({ slug: 'x', name: 'n', role: 'r', tagline: 't' })
    ).toBe(false)
  })
  it('isActionEnabled · disabled 时 ko', () => {
    expect(isActionEnabled(() => {}, false)).toBe(true)
    expect(isActionEnabled(() => {}, true)).toBe(false)
    expect(isActionEnabled(undefined, false)).toBe(false)
  })
})
