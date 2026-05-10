# @aily-ui/employee-card

> ← 回 [aily-ui design system](https://yarnovo.github.io/aily-ui-core/) 总站

akong EmployeeCard · agent 员工求职简历卡片 · interviewer 真挑选员工时真渲 · 跨端 (Web + React Native)

## 真定位

interviewer (阿空小问) 真访谈完真用户 → 真生成 1-3 张候选员工卡片 → 真用户真挑 1 张 (闭单)。

每张卡片 = 1 个 agent 的"求职简历":
- 自介 (头像 + name + role + tagline + 真 30s TTS 音频)
- 真过往案例 (1-3 条 scenario)
- 定价 hint (例 ¥800/月 · 真含 80 真聊)
- 3 个动作 (选这个 / 跳过 / 改改)

跟 `@aily-ui/auth-login` 同款骨架 · 全 token 化 · 跨端共用 props。

## 安装

```bash
npm i github:yarnovo/aily-ui-employee-card github:yarnovo/aily-ui-tokens
```

## Web

```tsx
import { EmployeeCard } from '@aily-ui/employee-card'
import '@aily-ui/employee-card/style.css'
import '@aily-ui/tokens/style.css'  // 顶层引一次 token

<EmployeeCard
  intro={{
    slug: 'xiaoyan',
    name: '阿空小研',
    role: 'user_researcher',
    tagline: '真懂消费品 · 真挖真痛',
    avatar_text: '研',
    tts_audio_url: 'https://oss.aliyun.com/akong/intro/xiaoyan.mp3',
  }}
  scenarios={[
    { title: '真聊 30 个真用户 · 真给 5 条真洞察' },
    { title: '真按 Mom Test · 不堆 ChatGPT 套话' },
    { title: '真情绪 capture · sigh / curse 都记' },
  ]}
  pricing_hint="¥800/月 · 真含 80 真聊"
  onSelect={() => closeOrder('xiaoyan')}
  onSkip={() => showNextCandidate()}
  onEdit={() => openPromptEditor('xiaoyan')}
/>
```

## React Native

```tsx
import { EmployeeCard } from '@aily-ui/employee-card'

<EmployeeCard
  intro={...}
  scenarios={...}
  pricing_hint="..."
  onSelect={...}
/>
```

Metro bundler 自动按 `.native.tsx` 后缀解析 · 同 `import` 路径两端通用。

> RN 端 TTS player 仅渲 UI 占位 · 真播放交给上层 (用 `expo-av` / `react-native-track-player` 等真 lib · 接 onTtsToggle 自管)。Web 端用原生 `<audio>` html5 真渲真播。

## API

### EmployeeCardProps

| Prop | Type | Default | 说明 |
|---|---|---|---|
| intro | `EmployeeCardIntro` | — | agent 自介 (slug / name / role / tagline / avatar / tts) |
| scenarios | `EmployeeCardScenario[]` | — | 1-3 条真过往案例 |
| pricing_hint | string | — | 定价 hint · 例 "¥800/月 · 真含 80 真聊" |
| onSelect | `() => void` | — | 真用户真选这个员工 (闭单) |
| onSkip | `() => void` | — | 真用户真跳过这个员工 |
| onEdit | `() => void` | — | 真用户真改改 prompt (重新生成) |
| disabled | boolean | false | 真禁所有按钮 (loading / 已选状态) |
| className | string | — | 外层 className |
| `data-testid` | string | `'employee-card'` | 顶层 testid override |

### EmployeeCardIntro

| 字段 | Type | 说明 |
|---|---|---|
| slug | string | agent 英文 slug · 例 "xiaoyan" |
| name | string | agent 中文名 · 例 "阿空小研" |
| role | string | 角色代号 · 例 "user_researcher" |
| tagline | string | 一句话定位 |
| avatar_url | string? | 头像 url · 没就用 avatar_text fallback |
| avatar_text | string? | 头像 fallback 文字 (例 "研") |
| tts_audio_url | string? | 真 TTS mp3 url · 不存在不渲 player |

### EmployeeCardScenario

| 字段 | Type | 说明 |
|---|---|---|
| title | string | 案例标题 |
| bdd | string? | BDD 简短描述 · ≤ 50 字 |

## data-testid 清单 (e2e 真用)

| testid | 元素 |
|---|---|
| `employee-card` (root) | 卡片外壳 |
| `employee-card-name` | agent 名字 |
| `employee-card-role` | 角色代号 |
| `employee-card-tagline` | tagline |
| `employee-card-avatar` | 头像区 |
| `employee-card-tts` | TTS player 整块 |
| `employee-card-tts-play` | ▶ / ■ 按钮 |
| `employee-card-tts-time` | 当前秒 / 总秒 |
| `employee-card-scenario-{i}` | 第 i 条 scenario (i: 0/1/2) |
| `employee-card-pricing` | 定价 hint |
| `employee-card-select-btn` | "选这个" |
| `employee-card-skip-btn` | "跳过" |
| `employee-card-edit-btn` | "改改" |

## 行为

- **TTS player** · 内部受控 · `<audio>` html5 + 自定义 ▶ 按钮 · 自动同步 `currentTime` / `duration`
- **avatar fallback** · 无 url 用 avatar_text · 无 avatar_text 用 name 最后 1 字
- **按钮可用性** · 无 handler 时 disabled · `disabled` prop 时全禁
- **scenarios 验证** · 1-3 条 (上层调用 validateScenarios 自检)
- **a11y** · 全 data-testid · TTS 按钮 aria-label

## 设计原则

- **真组件 only** · 不接 db / 不写死 endpoint · 真 props 接入交给上层
- **token 100% 接 @aily-ui/tokens** · shadcn neutral 黑系 (zinc-900)
- **跨端共用 props** · `EmployeeCard.types.ts` 一份 · Web (`.tsx`) / RN (`.native.tsx`) 两实现
- **跨端共用行为 spec** · `EmployeeCard.behavior.ts` (validateScenarios / pickAvatarText / shouldRenderTts)

## 视觉

- 卡片 · max-width 28rem · radius lg · border subtle · padding 1.25rem · gap 1rem
- 头像 · 48px 圆 · fallback 大字 (1 个汉字) · 有 url 真渲 img
- tts player · ▶ 圆按钮 + 进度条 + 秒数 · 整块圆角 + bg-subtle
- scenarios · ✓ + 文本 · 单条 0.875rem
- pricing · 高亮块 · bg-subtle · 单行
- actions · 3 等分网格 · 主按钮 (选这个) zinc-900 · 副按钮 (跳过 / 改改) outline

## 测试

```bash
npm test
npm run typecheck
```

≥ 17 cases · 覆盖：渲染 props / 头像 fallback / 按钮回调 / TTS 渲与不渲 / TTS play 切换 / disabled / 共享 spec。

## demo

[https://yarnovo.github.io/aily-ui-employee-card/](https://yarnovo.github.io/aily-ui-employee-card/) · 真 3 候选员工真演示。
