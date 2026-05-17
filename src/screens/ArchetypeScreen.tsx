import React, { useEffect, useRef, useContext } from 'react';
import { StyleSheet, Text, View, Animated, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, ArrowRight, Activity } from 'lucide-react-native';
import type { StackScreenProps } from '@react-navigation/stack';
import { useApp, AppContext } from '../context/AppContext';
import { GlassCard } from '../components/GlassCard';

type Props = StackScreenProps<any, 'Archetype'>;

export const ArchetypeScreen: React.FC<Props> = () => {
  const { userArchetype, finishOnboarding } = useApp();
  const glowAnim   = useRef(new Animated.Value(0.6)).current;
  const revealAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1.0, duration: 2000, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0.6, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
    Animated.timing(revealAnim, { toValue: 1, duration: 1200, useNativeDriver: true }).start();
  }, [glowAnim, revealAnim]);

  if (!userArchetype) return null;

  const { name, description, glowColor, emoji, traits, strengths } = userArchetype;

  const handleContinue = () => {
    finishOnboarding();
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#06050C', '#0C0A1A', '#06050C']} style={StyleSheet.absoluteFillObject} />

      <Animated.View
        style={[
          styles.glowAura,
          {
            backgroundColor: glowColor,
            opacity: glowAnim.interpolate({ inputRange: [0.6, 1], outputRange: [0.15, 0.35] }),
            transform: [{ scale: glowAnim.interpolate({ inputRange: [0.6, 1], outputRange: [1, 1.25] }) }],
          },
        ]}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: revealAnim, alignItems: 'center' }}>
          <View style={styles.header}>
            <Sparkles color="#00F0FF" size={24} />
            <Text style={styles.headerSubtitle}>AI Archetype Generated</Text>
          </View>

          <GlassCard style={styles.archetypeCard} borderColor={glowColor}>
            <View style={[styles.emojiBadge, { backgroundColor: glowColor }]}>
              <Text style={styles.emojiText}>{emoji}</Text>
            </View>
            <Text style={styles.archetypePrefix}>⚡ You are the</Text>
            <Text style={[styles.archetypeName, { color: glowColor }]}>{name}</Text>
            <Text style={styles.archetypeDesc}>{description}</Text>

            <View style={styles.divider} />

            <Text style={styles.sectionHeader}>Hacker Traits</Text>
            <View style={styles.traitsContainer}>
              {traits.map((trait: string, idx: number) => (
                <View key={idx} style={styles.traitBadge}>
                  <Activity color={glowColor} size={14} style={{ marginRight: 6 }} />
                  <Text style={styles.traitText}>{trait}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.sectionHeader}>Compatibility Strengths</Text>
            <View style={styles.strengthsContainer}>
              {strengths.map((str: string, idx: number) => (
                <View key={idx} style={styles.strengthRow}>
                  <Text style={[styles.bullet, { color: glowColor }]}>✦</Text>
                  <Text style={styles.strengthText}>{str}</Text>
                </View>
              ))}
            </View>
          </GlassCard>

          <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
            <LinearGradient colors={[glowColor, '#00F0FF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gradientButton}>
              <Text style={styles.continueText}>Enter Discover Arena</Text>
              <ArrowRight color="#FFFFFF" size={18} />
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#06050C', paddingTop: Platform.OS === 'ios' ? 50 : 20 },
  scrollContent: { alignItems: 'center', paddingHorizontal: 24, paddingBottom: 40 },
  glowAura: { position: 'absolute', width: 250, height: 250, borderRadius: 125, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 80, top: '15%', alignSelf: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 24, marginTop: 20 },
  headerSubtitle: { color: '#00F0FF', fontSize: 14, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.5 },
  archetypeCard: { width: '100%', padding: 28, alignItems: 'center', marginBottom: 32 },
  emojiBadge: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 4, marginBottom: 20 },
  emojiText: { fontSize: 36 },
  archetypePrefix: { color: '#8E8D9C', fontSize: 14, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  archetypeName: { fontSize: 28, fontWeight: '900', letterSpacing: -0.5, marginTop: 4, textAlign: 'center' },
  archetypeDesc: { fontSize: 13, color: '#8E8D9C', textAlign: 'center', marginTop: 10, lineHeight: 18 },
  divider: { width: '100%', height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginVertical: 20 },
  sectionHeader: { alignSelf: 'flex-start', color: '#FFFFFF', fontSize: 13, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  traitsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, width: '100%', marginBottom: 18 },
  traitBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  traitText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
  strengthsContainer: { alignSelf: 'flex-start', width: '100%' },
  strengthRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  bullet: { fontSize: 12, marginRight: 8 },
  strengthText: { color: '#8E8D9C', fontSize: 13, fontWeight: '500' },
  continueButton: { width: '100%', borderRadius: 18, overflow: 'hidden' },
  gradientButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 10 },
  continueText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16, letterSpacing: 0.5 },
});
