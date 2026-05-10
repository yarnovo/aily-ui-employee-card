/** EmployeeCard · agent 员工求职简历卡片 · interviewer 真挑选员工时真渲
 *
 * 真定位: interviewer 真访谈真用户后 · 真生成 1-3 张候选员工卡片 · 真用户真挑 1 张 → 闭单。
 * 真组件 only · 不接 db / 不写死 endpoint · 真上层接入 props (含 TTS url) 即可。
 */

/** intro · agent 真自介数据 (slug + name + role + tagline + 头像 + TTS url) */
export interface EmployeeCardIntro {
  /** agent 英文 slug · 例 "xiaoyan" / "dayan" */
  slug: string
  /** agent 中文名 · 例 "阿空小研" */
  name: string
  /** 角色 (内部代号 / 英文 role) · 例 "user_researcher" */
  role: string
  /** tagline · 一句话定位 · 例 "真懂消费品 · 真挖真痛" */
  tagline: string
  /** 头像 url · 没就用 avatar_text fallback */
  avatar_url?: string
  /** 头像 fallback 文字 · 例 "研" (1 个汉字 / 1-2 字符) */
  avatar_text?: string
  /** 真 TTS mp3 url · minimax 等真生成 · 不在 props 里就不渲 player */
  tts_audio_url?: string
}

/** 单个 scenario · 真过往案例条目 */
export interface EmployeeCardScenario {
  /** 案例标题 · 例 "真聊 30 个真用户 · 真给 5 条真洞察" */
  title: string
  /** BDD 简短描述 · ≤ 50 字 · 可选 */
  bdd?: string
}

/** EmployeeCard Props · 跨端共用 (Web + RN 同 shape) */
export interface EmployeeCardProps {
  /** agent intro (自介 + 头像 + TTS) */
  intro: EmployeeCardIntro
  /** 1-3 条真过往案例 (scenarios) */
  scenarios: EmployeeCardScenario[]
  /** 定价 hint · 例 "¥800/月 · 真含 80 真聊" */
  pricing_hint: string

  /** 真用户真选这个员工 · 闭单触发 */
  onSelect?: () => void
  /** 真用户真跳过这个员工 (看下一个候选) */
  onSkip?: () => void
  /** 真用户真改改 prompt 重新生成 (老板真不喜欢这个 default) */
  onEdit?: () => void

  /** 真禁用所有按钮 · 用于 loading / 已选状态 */
  disabled?: boolean

  /** 外层 className · 包到 ak-employee-card 根 */
  className?: string
  /** 顶层 data-testid override · 默认 "employee-card" */
  'data-testid'?: string
}
