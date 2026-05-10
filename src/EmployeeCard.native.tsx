/**
 * akong EmployeeCard · React Native 实现 (UX A 版)
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
  shouldRenderPromises,
} from './EmployeeCard.behavior'

export function EmployeeCard(props: EmployeeCardProps) {
  const {
    intro,
    scenarios,
    promises,
    onSelect,
    onTry,
    disabled = false,
  } = props

  const scheme = (useColorScheme() ?? 'light') as 'light' | 'dark'
  const t = scheme === 'dark' ? tokens.dark : tokens.light

  // RN 端 TTS player 仅 UI 占位 · 真播放交给上层 (expo-av 等)
  const [playing, setPlaying] = useState(false)

  const renderTts = shouldRenderTts(intro)
  const renderPromises = shouldRenderPromises(promises)
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
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: t.fg }}>
            {intro.name}
            <Text style={{ fontSize: 12, fontWeight: '400', color: t.fgMuted }}>
              {' · '}
              {intro.role}
            </Text>
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: t.fgMuted,
              lineHeight: 20,
              fontStyle: 'italic',
            }}
          >
            {`“${intro.tagline}”`}
          </Text>
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
          <Text style={{ fontSize: 12, color: t.fgMuted }}>听我自介</Text>
        </View>
      ) : null}

      {/* scenarios · A 版 title + quote */}
      <View style={{ gap: 10 }}>
        {scenarios.map((sc: EmployeeCardScenario, i: number) => (
          <View key={i} style={{ gap: 2 }}>
            <Text
              style={{ fontSize: 14, fontWeight: '600', color: t.fg, lineHeight: 20 }}
            >
              {sc.title}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text
                style={{
                  flex: 1,
                  fontSize: 13,
                  color: t.fgMuted,
                  lineHeight: 20,
                  fontStyle: 'italic',
                }}
              >
                {`“${sc.quote}”`}
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
          </View>
        ))}
      </View>

      {/* promises ("我不做") · 复用 scenario 视觉 */}
      {renderPromises ? (
        <View style={{ gap: 2 }}>
          <Text
            style={{ fontSize: 14, fontWeight: '600', color: t.fg, lineHeight: 20 }}
          >
            我不做
          </Text>
          <Text
            style={{
              fontSize: 13,
              color: t.fgMuted,
              lineHeight: 20,
              fontStyle: 'italic',
            }}
          >
            {`“${promises!.filter((p) => p && p.length > 0).join(' · ')}”`}
          </Text>
        </View>
      ) : null}

      {/* actions · [先聊 5 分钟] (左 · 白底) + [选 ta] (右 · 黑底) */}
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Pressable
          onPress={onTry}
          disabled={disabled || !onTry}
          style={[btnBase, { opacity: disabled || !onTry ? 0.5 : 1 }]}
        >
          <Text style={{ color: t.fg, fontSize: 14, fontWeight: '500' }}>先聊 5 分钟</Text>
        </Pressable>
        <Pressable
          onPress={onSelect}
          disabled={disabled || !onSelect}
          style={[btnPrimary, { opacity: disabled || !onSelect ? 0.5 : 1 }]}
        >
          <Text style={{ color: t.fgInverse, fontSize: 14, fontWeight: '500' }}>选 ta</Text>
        </Pressable>
      </View>
    </View>
  )
}

export default EmployeeCard
