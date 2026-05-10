/**
 * Web 端组件测试 · vitest + @testing-library/react (UX A 版)
 *
 * 覆盖 acceptance:
 * - 渲染 props (name / role / tagline 引号包 / scenarios title + quote)
 * - onSelect 触发 (主按钮 [选 ta])
 * - onTry 触发 (副按钮 [先聊 5 分钟])
 * - 砍 onEdit · 真不渲 employee-card-edit-btn
 * - 砍 onSkip · 真不渲 employee-card-skip-btn
 * - promises 段真渲 (有数据时) / 不渲 (无 / 空)
 * - 主 TTS player 渲 (intro.tts_audio_url 存在时) · 副标 "听我自介" 真在
 * - 主 TTS 不渲 (intro.tts_audio_url 不存在时)
 * - 主 TTS play 切换 (Play → Pause icon · 调 audio.play)
 * - scenario mini TTS player 渲 / 不渲 / 点 ▶ 真触发 audio.play
 * - 真按钮 disabled (无 handler 时 disabled · disabled prop 时全禁)
 * - 砍 pricing 真不渲
 * - 共享 spec (validateScenarios / pickAvatarText / shouldRenderTts / shouldRenderScenarioTts / shouldRenderPromises)
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
  shouldRenderScenarioTts,
  shouldRenderPromises,
  isActionEnabled,
  sampleProps,
} from '../src/EmployeeCard.behavior'

function makeProps(overrides: Partial<EmployeeCardProps> = {}): EmployeeCardProps {
  return {
    ...sampleProps,
    onSelect: vi.fn(),
    onTry: vi.fn(),
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

describe('EmployeeCard · 渲染 props (A 版)', () => {
  it('渲染 name / role · tagline 真带引号 (访谈原话风)', () => {
    render(createElement(EmployeeCard, makeProps()))
    expect(screen.getByTestId('employee-card-name')).toHaveTextContent('阿空小研')
    expect(screen.getByTestId('employee-card-role')).toHaveTextContent('user_researcher')
    const tag = screen.getByTestId('employee-card-tagline')
    expect(tag).toHaveTextContent('你 12h 聊 12 用户挖 2 洞察 · 我帮你只挖 5 条')
    // 真包左右花引号 (“ ”)
    expect(tag.textContent).toContain('“')
    expect(tag.textContent).toContain('”')
  })

  it('渲染 1-3 条 scenarios · index 化 testid · title + quote 真分开', () => {
    render(createElement(EmployeeCard, makeProps()))
    // scenario 0
    expect(screen.getByTestId('employee-card-scenario-0')).toBeInTheDocument()
    expect(screen.getByTestId('employee-card-scenario-0-title')).toHaveTextContent(
      '上次帮美妆 DTC'
    )
    const q0 = screen.getByTestId('employee-card-scenario-0-quote')
    expect(q0).toHaveTextContent('聊 30 用户 · 挖 5 条洞察')
    expect(q0.textContent).toContain('“') // 左花引号
    // scenario 1 / 2
    expect(screen.getByTestId('employee-card-scenario-1-title')).toHaveTextContent(
      '按 Mom Test'
    )
    expect(screen.getByTestId('employee-card-scenario-1-quote')).toHaveTextContent(
      '不堆 ChatGPT 套话 · 不诱导'
    )
    expect(screen.getByTestId('employee-card-scenario-2-title')).toBeInTheDocument()
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

  it('砍 pricing · 真不渲 employee-card-pricing testid', () => {
    render(createElement(EmployeeCard, makeProps()))
    expect(screen.queryByTestId('employee-card-pricing')).toBeNull()
  })

  it('砍 edit / skip · 真不渲 edit-btn / skip-btn testid', () => {
    render(createElement(EmployeeCard, makeProps()))
    expect(screen.queryByTestId('employee-card-edit-btn')).toBeNull()
    expect(screen.queryByTestId('employee-card-skip-btn')).toBeNull()
  })
})

describe('EmployeeCard · promises 段', () => {
  it('promises 真传 · 真渲 "我不做" + quote (· 分隔多条)', () => {
    render(createElement(EmployeeCard, makeProps()))
    const seg = screen.getByTestId('employee-card-promises')
    expect(seg).toBeInTheDocument()
    expect(seg).toHaveTextContent('我不做')
    const quote = screen.getByTestId('employee-card-promises-quote')
    expect(quote).toHaveTextContent('不写周报 · 不画 PPT · 不替你拍板')
    expect(quote.textContent).toContain('“')
  })

  it('promises 不传 · 真不渲 "我不做" 段', () => {
    render(createElement(EmployeeCard, makeProps({ promises: undefined })))
    expect(screen.queryByTestId('employee-card-promises')).toBeNull()
  })

  it('promises 空数组 · 真不渲', () => {
    render(createElement(EmployeeCard, makeProps({ promises: [] })))
    expect(screen.queryByTestId('employee-card-promises')).toBeNull()
  })

  it('promises 全空字符串 · 真不渲', () => {
    render(createElement(EmployeeCard, makeProps({ promises: ['', ''] })))
    expect(screen.queryByTestId('employee-card-promises')).toBeNull()
  })
})

describe('EmployeeCard · 按钮回调 (A 版双按钮)', () => {
  it('onSelect 真触发 · 主按钮 [选 ta]', () => {
    const props = makeProps()
    render(createElement(EmployeeCard, props))
    const btn = screen.getByTestId('employee-card-select-btn')
    expect(btn).toHaveTextContent('选 ta')
    fireEvent.click(btn)
    expect(props.onSelect).toHaveBeenCalledTimes(1)
  })

  it('onTry 真触发 · 副按钮 [先聊 5 分钟]', () => {
    const props = makeProps()
    render(createElement(EmployeeCard, props))
    const btn = screen.getByTestId('employee-card-try-btn')
    expect(btn).toHaveTextContent('先聊 5 分钟')
    fireEvent.click(btn)
    expect(props.onTry).toHaveBeenCalledTimes(1)
  })

  it('无 handler · 按钮 disabled', () => {
    render(
      createElement(EmployeeCard, {
        ...sampleProps,
        // 不提供 onSelect / onTry
      })
    )
    expect(screen.getByTestId('employee-card-select-btn')).toBeDisabled()
    expect(screen.getByTestId('employee-card-try-btn')).toBeDisabled()
  })

  it('disabled prop · 真禁所有按钮', () => {
    const props = makeProps({ disabled: true })
    render(createElement(EmployeeCard, props))
    expect(screen.getByTestId('employee-card-select-btn')).toBeDisabled()
    expect(screen.getByTestId('employee-card-try-btn')).toBeDisabled()
    expect(screen.getByTestId('employee-card-tts-play')).toBeDisabled()
  })
})

describe('EmployeeCard · 主 TTS player', () => {
  it('intro.tts_audio_url 存在 · 真渲 player + 副标 "听我自介"', () => {
    render(createElement(EmployeeCard, makeProps()))
    const tts = screen.getByTestId('employee-card-tts')
    expect(tts).toBeInTheDocument()
    expect(tts).toHaveTextContent('听我自介')
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

  it('点主 ▶ · 真调 audio.play', () => {
    render(createElement(EmployeeCard, makeProps()))
    const btn = screen.getByTestId('employee-card-tts-play')
    fireEvent.click(btn)
    const playMock = (HTMLMediaElement.prototype as unknown as {
      play: ReturnType<typeof vi.fn>
    }).play
    expect(playMock).toHaveBeenCalled()
  })

  it('主 TTS 按钮真渲 SVG icon · 不是 unicode ▶', () => {
    render(createElement(EmployeeCard, makeProps()))
    const btn = screen.getByTestId('employee-card-tts-play')
    // 真渲 lucide Play SVG · 不应包含 unicode "▶" 字符
    expect(btn.textContent).not.toContain('▶')
    expect(btn.querySelector('svg')).not.toBeNull()
  })
})

describe('EmployeeCard · scenario mini TTS player', () => {
  it('scenario[0] 有 tts_audio_url · 真渲 mini player', () => {
    render(createElement(EmployeeCard, makeProps()))
    expect(screen.getByTestId('employee-card-scenario-0-tts')).toBeInTheDocument()
    expect(screen.getByTestId('employee-card-scenario-0-tts-play')).toBeInTheDocument()
  })

  it('scenario[1] / scenario[2] 无 tts_audio_url · 不渲 mini player', () => {
    render(createElement(EmployeeCard, makeProps()))
    expect(screen.queryByTestId('employee-card-scenario-1-tts')).toBeNull()
    expect(screen.queryByTestId('employee-card-scenario-1-tts-play')).toBeNull()
    expect(screen.queryByTestId('employee-card-scenario-2-tts')).toBeNull()
  })

  it('点 mini ▶ · 真调 audio.play', () => {
    render(createElement(EmployeeCard, makeProps()))
    const playMock = (HTMLMediaElement.prototype as unknown as {
      play: ReturnType<typeof vi.fn>
    }).play
    playMock.mockClear?.()
    const btn = screen.getByTestId('employee-card-scenario-0-tts-play')
    fireEvent.click(btn)
    expect(playMock).toHaveBeenCalled()
  })

  it('mini player 按钮真渲 SVG icon · 不是 unicode ▶', () => {
    render(createElement(EmployeeCard, makeProps()))
    const btn = screen.getByTestId('employee-card-scenario-0-tts-play')
    expect(btn.textContent).not.toContain('▶')
    expect(btn.querySelector('svg')).not.toBeNull()
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
      validateScenarios([
        { title: 'a', quote: 'q' },
        { title: 'b', quote: 'q' },
        { title: 'c', quote: 'q' },
        { title: 'd', quote: 'q' },
      ])
    ).toEqual({ ok: false, reason: 'scenarios 最多 3 条' })
  })
  it('validateScenarios · 1-3 条 · ok', () => {
    expect(validateScenarios([{ title: 'a', quote: 'q' }]).ok).toBe(true)
    expect(
      validateScenarios([
        { title: 'a', quote: 'q' },
        { title: 'b', quote: 'q' },
      ]).ok
    ).toBe(true)
    expect(
      validateScenarios([
        { title: 'a', quote: 'q' },
        { title: 'b', quote: 'q' },
        { title: 'c', quote: 'q' },
      ]).ok
    ).toBe(true)
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
  it('shouldRenderScenarioTts · url 存在 / 不存在', () => {
    expect(
      shouldRenderScenarioTts({ title: 't', quote: 'q', tts_audio_url: 'https://x' })
    ).toBe(true)
    expect(shouldRenderScenarioTts({ title: 't', quote: 'q' })).toBe(false)
    expect(
      shouldRenderScenarioTts({ title: 't', quote: 'q', tts_audio_url: '' })
    ).toBe(false)
  })
  it('shouldRenderPromises · 有 / 空数组 / undefined / 全空字符串', () => {
    expect(shouldRenderPromises(['a'])).toBe(true)
    expect(shouldRenderPromises(['a', 'b'])).toBe(true)
    expect(shouldRenderPromises([])).toBe(false)
    expect(shouldRenderPromises(undefined)).toBe(false)
    expect(shouldRenderPromises(['', ''])).toBe(false)
    expect(shouldRenderPromises(['', 'x'])).toBe(true) // 至少 1 条非空
  })
  it('isActionEnabled · disabled 时 ko', () => {
    expect(isActionEnabled(() => {}, false)).toBe(true)
    expect(isActionEnabled(() => {}, true)).toBe(false)
    expect(isActionEnabled(undefined, false)).toBe(false)
  })
})
