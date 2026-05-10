/**
 * akong EmployeeCard · React Native 实现
 *
 * Metro bundler 默认按 `.native.tsx` 后缀解析 RN 端 · `.tsx` 解析 Web 端
 * 用方 `import { EmployeeCard } from '@aily-ui/employee-card'` 自动取对应平台
 *
 * 注意: TTS player 在 RN 端用 `expo-av` / `react-native-track-player` 等真 lib ·
 * 此文件保留 player UI · 但不真 import 第三方 lib · 上层接 onTtsToggle 自管。
 */

import { useState } from 'react'
import { Image, Pressable, Text, View, useColorScheme } from 'react-native'
import { tokens } from '@aily-ui/tokens'
import { Play, Pause } from '@aily-ui/icons'
import type { EmployeeCardProps, EmployeeCardScenario } from './EmployeeCard.types'
import {
  pickAvatarText,
  shouldRenderTts,
  shouldRenderScenarioTts,
} from './EmployeeCard.behavior'

export function EmployeeCard(props: EmployeeCardProps) {
  const {
    intro,
    scenarios,
    onSelect,
    onEdit,
    disabled = false,
  } = props

  const scheme = (useColorScheme() ?? 'light') as 'light' | 'dark'
  const t = scheme === 'dark' ? tokens.dark : tokens.light

  // RN 端 TTS player 仅 UI 占位 · 真播放交给上层 (expo-av 等)
  const [playing, setPlaying] = useState(false)

  const renderTts = shouldRenderTts(intro)
  const avatarText = pickAvatarText(intro)

  const cardStyle = {
    width: '100%',
    maxWidth: 448,
    backgroundColor: t.bgElevated,
    borderRadius: tokens.radius.lg,
    borderWidth: 1,
    borderColor: t.borderSubtle ?? t.border,
    padding: tokens.space[5],
    gap: tokens.space[4],
  } as const

  const avatarStyle = {
    width: 48,
    height: 48,
    borderRadius: 9999,
    backgroundColor: t.bgSubtle ?? t.bg,
    borderWidth: 1,
    borderColor: t.borderSubtle ?? t.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  } as const

  const btnBase = {
    height: 36,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    borderColor: t.border,
    backgroundColor: t.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  } as const

  const btnPrimary = {
    ...btnBase,
    backgroundColor: t.fg,
    borderColor: t.fg,
  } as const

  return (
    <View style={cardStyle}>
      {/* header */}
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
        <View style={avatarStyle}>
          {intro.avatar_url ? (
            <Image
              source={{ uri: intro.avatar_url }}
              style={{ width: '100%', height: '100%' }}
            />
          ) : (
            <Text style={{ fontSize: 18, fontWeight: '600', color: t.fg }}>{avatarText}</Text>
          )}
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: t.fg }}>
            {intro.name}
            <Text style={{ fontSize: 12, fontWeight: '400', color: t.fgMuted }}>
              {' · '}
              {intro.role}
            </Text>
          </Text>
          <Text style={{ fontSize: 14, color: t.fgMuted, lineHeight: 20 }}>{intro.tagline}</Text>
        </View>
      </View>

      {/* tts player · RN 端仅 UI · 真播交上层 */}
      {renderTts ? (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            padding: 10,
            backgroundColor: t.bgSubtle ?? t.bg,
            borderRadius: tokens.radius.md,
            borderWidth: 1,
            borderColor: t.borderSubtle ?? t.border,
          }}
        >
          <Pressable
            onPress={() => !disabled && setPlaying((p) => !p)}
            disabled={disabled}
            style={{
              width: 32,
              height: 32,
              borderRadius: 9999,
              backgroundColor: t.fg,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: disabled ? 0.5 : 1,
            }}
          >
            {playing
              ? <Pause size={20} color={t.fgInverse} />
              : <Play size={20} color={t.fgInverse} />}
          </Pressable>
          <View style={{ flex: 1, height: 4, backgroundColor: t.borderSubtle ?? t.border, borderRadius: 9999 }} />
          <Text style={{ fontSize: 12, color: t.fgMuted, minWidth: 60, textAlign: 'right' }}>
            0:00 / 0:00
          </Text>
        </View>
      ) : null}

      {/* scenarios */}
      <View>
        <Text style={{ fontSize: 12, color: t.fgMuted, marginBottom: 4 }}>真过往案例</Text>
        <View style={{ gap: 6 }}>
          {scenarios.map((sc: EmployeeCardScenario, i: number) => (
            <View
              key={i}
              style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}
            >
              <Text style={{ color: t.fgMuted, fontWeight: '600' }}>✓</Text>
              <Text style={{ flex: 1, fontSize: 14, color: t.fg, lineHeight: 20 }}>
                {sc.title}
                {sc.bdd ? (
                  <Text style={{ fontSize: 12, color: t.fgMuted }}> — {sc.bdd}</Text>
                ) : null}
              </Text>
              {shouldRenderScenarioTts(sc) ? (
                <Pressable
                  onPress={() => !disabled && undefined /* RN 真播交上层 */}
                  disabled={disabled}
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 9999,
                    backgroundColor: t.fg,
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: disabled ? 0.5 : 1,
                  }}
                >
                  <Play size={14} color={t.fgInverse} />
                </Pressable>
              ) : null}
            </View>
          ))}
        </View>
      </View>

      {/* actions · 选 / 改 (砍跳过) */}
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Pressable
          onPress={onSelect}
          disabled={disabled || !onSelect}
          style={[btnPrimary, { opacity: disabled || !onSelect ? 0.5 : 1 }]}
        >
          <Text style={{ color: t.fgInverse, fontSize: 14, fontWeight: '500' }}>选这个</Text>
        </Pressable>
        <Pressable
          onPress={onEdit}
          disabled={disabled || !onEdit}
          style={[btnBase, { opacity: disabled || !onEdit ? 0.5 : 1 }]}
        >
          <Text style={{ color: t.fg, fontSize: 14, fontWeight: '500' }}>改改</Text>
        </Pressable>
      </View>
    </View>
  )
}

export default EmployeeCard
