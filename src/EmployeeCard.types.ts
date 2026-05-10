/** EmployeeCard · agent 员工求职简历卡片 · interviewer 真挑选员工时真渲
 *
 * 真定位: interviewer 真访谈真用户后 · 真生成 1-3 张候选员工卡片 · 真用户真挑 1 张 → 闭单。
 * 真组件 only · 不接 db / 不写死 endpoint · 真上层接入 props (含 TTS url) 即可。
 *
 * UX A 版 (老板 5-10 拍):
 *   - tagline 真引访谈原话 (例 "你 12h 聊 12 用户挖 2 洞察 · 我帮你只挖 5 条")
 *   - scenarios 用 title + quote 两段式 (不再 BDD · 真用引号包 quote)
 *   - + promises (string[]) · 真"我不做" list
 *   - 双按钮: [先聊 5 分钟] (onTry) + [选 ta] (onSelect) · 砍 onEdit
 */

/** intro · agent 真自介数据 (slug + name + role + tagline + 头像 + TTS url) */
export interface EmployeeCardIntro {
  /** agent 英文 slug · 例 "xiaoyan" / "dayan" */
  slug: string
  /** agent 中文名 · 例 "阿空小研" */
  name: string
  /** 角色 (内部代号 / 英文 role) · 例 "user_researcher" */
  role: string
  /** tagline · 真引访谈原话 · 例 "你 12h 聊 12 用户挖 2 洞察 · 我帮你只挖 5 条" */
  tagline: string
  /** 头像 url · 没就用 avatar_text fallback */
  avatar_url?: string
  /** 头像 fallback 文字 · 例 "研" (1 个汉字 / 1-2 字符) */
  avatar_text?: string
  /** 真 TTS mp3 url · minimax 等真生成 · 不在 props 里就不渲 player */
  tts_audio_url?: string
}

/** 单个 scenario · 真过往案例条目 (A 版 quote 风) */
export interface EmployeeCardScenario {
  /** 案例 title · 粗一行 · 例 "上次帮 X 公司" */
  title: string
  /** 引言 quote · 配合 title 真展开 · 例 "聊 30 用户 · 挖 5 条洞察" · 渲染时真自动加引号 */
  quote: string
  /** 真 TTS mp3 url · 单条案例真自介音频 · 不在 props 里就不渲 mini player (建议只第 1 条带) */
  tts_audio_url?: string
}

/** EmployeeCard Props · 跨端共用 (Web + RN 同 shape) */
export interface EmployeeCardProps {
  /** agent intro (自介 + 头像 + TTS) */
  intro: EmployeeCardIntro
  /** 1-3 条真过往案例 (scenarios) */
  scenarios: EmployeeCardScenario[]
  /** "我不做" list · 真减期待 · 真划边界 · 1-N 条 · 不传或空数组就不渲此段 */
  promises?: string[]

  /** 真用户真选这个员工 · 闭单触发 (主按钮 [选 ta]) */
  onSelect?: () => void
  /** 真用户真先聊 5 分钟试试 · 触发 (副按钮 [先聊 5 分钟]) */
  onTry?: () => void

  /** 真禁用所有按钮 · 用于 loading / 已选状态 */
  disabled?: boolean

  /** 外层 className · 包到 ak-employee-card 根 */
  className?: string
  /** 顶层 data-testid override · 默认 "employee-card" */
  'data-testid'?: string
}
