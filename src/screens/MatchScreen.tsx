import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Image, Animated, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, MessageSquare, Zap } from 'lucide-react-native';
import type { StackScreenProps } from '@react-navigation/stack';
import { useApp } from '../context/AppContext';
import { Confetti } from '../components/Confetti';
import { GlassCard } from '../components/GlassCard';

type Props = StackScreenProps<any, 'Match'>;

export const MatchScreen: React.FC<Props> = ({ navigation }) => {
  const { activeMatch } = useApp();
  const popAnim     = useRef(new Animated.Value(0.5)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(popAnim,     { toValue: 1, tension: 30, friction: 5, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
    ]).start();
  }, [popAnim, opacityAnim]);

  if (!activeMatch) return null;

  const userAvatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80';

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0F061A', '#06050C', '#060A1E']} style={StyleSheet.absoluteFillObject} />
      <Confetti active={true} />

      <Animated.View style={[styles.mainContent, { opacity: opacityAnim, transform: [{ scale: popAnim }] }]}>
        <View style={styles.glowBackdrop} />

        <View style={styles.header}>
          <Sparkles color="#00F0FF" size={28} />
          <Text style={styles.synqText}>It's a Synq!</Text>
        </View>
        <Text style={styles.matchSub}>You and {activeMatch.name} actually click.</Text>

        <View style={styles.avatarArena}>
          <View style={styles.avatarWrapper}>
            <Image source={{ uri: userAvatar }} style={styles.matchAvatar} />
            <LinearGradient colors={['#8A2BE2', '#4B0082']} style={styles.avatarLabel}>
              <Text style={styles.avatarLabelText}>You</Text>
            </LinearGradient>
          </View>
          <View style={styles.matchLink}>
            <Zap color="#00F0FF" size={24} style={styles.zapIcon} />
            <View style={styles.glowLinkLine} />
          </View>
          <View style={[styles.avatarWrapper, { borderColor: activeMatch.archetype.glowColor }]}>
            <Image source={{ uri: activeMatch.avatar }} style={styles.matchAvatar} />
            <LinearGradient colors={[activeMatch.archetype.glowColor, '#1C0E35']} style={styles.avatarLabel}>
              <Text style={styles.avatarLabelText}>{activeMatch.name.split(' ')[0]}</Text>
            </LinearGradient>
          </View>
        </View>

        <GlassCard style={styles.scoreCard} borderColor="rgba(0,240,255,0.25)">
          <Text style={styles.compatibilityLabel}>Compatibility Score</Text>
          <Text style={styles.compatibilityPercent}>{activeMatch.compatibilityScore}%</Text>
          <Text style={styles.compatibilityDetails}>
            ✓ Similar schedules ({activeMatch.schedule}){'\n'}
            ✓ Complementary process ({activeMatch.shipVsPolish}){'\n'}
            ✓ High chemistry potential
          </Text>
        </GlassCard>

        <TouchableOpacity style={styles.unlockButton} onPress={() => navigation.navigate('Chat')}>
          <LinearGradient colors={['#8A2BE2', '#00F0FF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gradientButton}>
            <MessageSquare color="#FFFFFF" size={20} />
            <Text style={styles.unlockText}>Unlock Chat & Sprint</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#06050C' },
  glowBackdrop: { position: 'absolute', width: 280, height: 280, borderRadius: 140, backgroundColor: '#8A2BE2', opacity: 0.2, shadowColor: '#00F0FF', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 80 },
  mainContent: { width: '90%', maxWidth: 400, alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  synqText: { fontSize: 42, fontWeight: '900', color: '#FFF', letterSpacing: -1, textShadowColor: 'rgba(138,43,226,0.6)', textShadowOffset: { width: 0, height: 4 }, textShadowRadius: 15 },
  matchSub: { fontSize: 14, color: '#8E8D9C', fontWeight: '600', marginBottom: 40 },
  avatarArena: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 36 },
  avatarWrapper: { width: 110, height: 110, borderRadius: 55, borderWidth: 3, borderColor: '#8A2BE2', padding: 3, backgroundColor: '#06050C', position: 'relative' },
  matchAvatar: { width: '100%', height: '100%', borderRadius: 55 },
  avatarLabel: { position: 'absolute', bottom: -6, left: '10%', right: '10%', paddingVertical: 3, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  avatarLabelText: { color: '#FFF', fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  matchLink: { width: 60, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  zapIcon: { position: 'absolute', zIndex: 2 },
  glowLinkLine: { width: '100%', height: 3, backgroundColor: '#00F0FF', shadowColor: '#00F0FF', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.9, shadowRadius: 4 },
  scoreCard: { width: '100%', padding: 24, alignItems: 'center', marginBottom: 40 },
  compatibilityLabel: { color: '#8E8D9C', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  compatibilityPercent: { fontSize: 36, fontWeight: '900', color: '#00F0FF', marginVertical: 6 },
  compatibilityDetails: { color: '#8E8D9C', fontSize: 12, lineHeight: 18, textAlign: 'center', fontWeight: '500', marginTop: 4 },
  unlockButton: { width: '100%', borderRadius: 18, overflow: 'hidden' },
  gradientButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 10 },
  unlockText: { color: '#FFF', fontWeight: '700', fontSize: 16, letterSpacing: 0.5 },
});
