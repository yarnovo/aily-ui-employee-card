/**
 * EmployeeCard · 跨端行为契约 · Web + RN 都遵循
 *
 * 把"给定 props · 期望渲染 / 触发什么"的纯描述抽出来 ·
 * 各端测试 import 跑同一份 spec · 行为强一致。
 */

import type { EmployeeCardProps, EmployeeCardScenario } from './EmployeeCard.types'

/** TTS player 状态 (内部 state · 测试用) */
export type TtsPlayState = 'idle' | 'playing'

/** props validation: 至少 1 条 scenario · 不超过 3 条 (产品规约) */
export function validateScenarios(scenarios: EmployeeCardProps['scenarios']): {
  ok: boolean
  reason?: string
} {
  if (!scenarios || scenarios.length === 0) return { ok: false, reason: 'scenarios 不能为空' }
  if (scenarios.length > 3) return { ok: false, reason: 'scenarios 最多 3 条' }
  return { ok: true }
}

/** 头像渲染选择: 有 url 用 url · 否则用 avatar_text · 都没就 name 第 1 字 */
export function pickAvatarText(intro: EmployeeCardProps['intro']): string {
  if (intro.avatar_text && intro.avatar_text.length > 0) return intro.avatar_text
  if (intro.name && intro.name.length > 0) {
    // 取最后 1 字 · 中文名 "阿空小研" → "研" (skip "阿空" 前缀)
    return intro.name.slice(-1)
  }
  return '?'
}

/** TTS player 是否真渲 · intro.tts_audio_url 存在才渲 */
export function shouldRenderTts(intro: EmployeeCardProps['intro']): boolean {
  return !!intro.tts_audio_url && intro.tts_audio_url.length > 0
}

/** 单条 scenario mini TTS player 是否真渲 · scenario.tts_audio_url 存在才渲 */
export function shouldRenderScenarioTts(scenario: EmployeeCardScenario): boolean {
  return !!scenario.tts_audio_url && scenario.tts_audio_url.length > 0
}

/** promises 段是否真渲 · 数组存在 + 至少 1 条非空才渲 */
export function shouldRenderPromises(promises?: string[]): boolean {
  if (!promises) return false
  return promises.some((p) => p && p.length > 0)
}

/** 按钮可用性 · disabled prop + handler 是否提供 */
export function isActionEnabled(
  handler: (() => void) | undefined,
  disabled?: boolean
): boolean {
  return !!handler && !disabled
}

/** 测试 fixture · 标准案例 (A 版 quote 风) */
export const sampleProps: EmployeeCardProps = {
  intro: {
    slug: 'xiaoyan',
    name: '阿空小研',
    role: 'user_researcher',
    tagline: '你 12h 聊 12 用户挖 2 洞察 · 我帮你只挖 5 条',
    avatar_text: '研',
    tts_audio_url: 'https://example.com/xiaoyan-intro.mp3',
  },
  scenarios: [
    {
      title: '上次帮美妆 DTC',
      quote: '聊 30 用户 · 挖 5 条洞察',
      tts_audio_url: 'https://example.com/xiaoyan-scenario-0.mp3',
    },
    {
      title: '按 Mom Test',
      quote: '不堆 ChatGPT 套话 · 不诱导',
    },
    {
      title: '真情绪 capture',
      quote: 'sigh / curse 都记 · 真听细节',
    },
  ],
  promises: ['不写周报', '不画 PPT', '不替你拍板'],
}
