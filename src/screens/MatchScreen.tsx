import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Image, Animated, TouchableOpacity } from 'react-native';
import { Sparkles, MessageSquare, Zap } from 'lucide-react-native';
import { Github, Twitter, Linkedin } from '../components/SocialIcons';
import type { StackScreenProps } from '@react-navigation/stack';
import { useApp } from '../context/AppContext';

type Props = StackScreenProps<any, 'Match'>;

const cleanHandle = (value?: string) => (value || '').trim().replace(/^@/, '').replace(/^(https?:\/\/)?(www\.)?/i, '').replace(/\/$/, '');
const formatSocial = (value?: string, platform?: 'github' | 'twitter' | 'linkedin') => {
  const handle = cleanHandle(value);
  if (!handle) return '';
  if (platform === 'twitter') return `x.com/${handle.replace(/^(x\.com|twitter\.com)\//i, '')}`;
  if (platform === 'linkedin') return `linkedin.com/in/${handle.replace(/^linkedin\.com\/(in\/)?/i, '')}`;
  return `github.com/${handle.replace(/^github\.com\//i, '')}`;
};

export const MatchScreen: React.FC<Props> = ({ navigation }) => {
  const { userProfile, activeMatch } = useApp();
  const popAnim     = useRef(new Animated.Value(0.5)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(popAnim,     { toValue: 1, tension: 30, friction: 5, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
    ]).start();
  }, [popAnim, opacityAnim]);

  if (!activeMatch) return null;

  const userAvatar = (userProfile as any)?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80';

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.mainContent, { opacity: opacityAnim, transform: [{ scale: popAnim }] }]}>

        <View style={styles.header}>
          <Sparkles color="#800020" size={28} />
          <Text style={styles.synqText}>It's a Synq!</Text>
        </View>
        <Text style={styles.matchSub}>You and {activeMatch.name} actually click.</Text>

        <View style={styles.avatarArena}>
          <View style={styles.avatarWrapper}>
            <Image source={{ uri: userAvatar }} style={styles.matchAvatar} />
            <View style={styles.avatarLabel}>
              <Text style={styles.avatarLabelText}>You</Text>
            </View>
          </View>
          <View style={styles.matchLink}>
            <Zap color="#800020" size={24} style={styles.zapIcon} />
            <View style={styles.dottedLinkLine} />
          </View>
          <View style={styles.avatarWrapper}>
            <Image source={{ uri: activeMatch.avatar }} style={styles.matchAvatar} />
            <View style={styles.avatarLabel}>
              <Text style={styles.avatarLabelText}>{activeMatch.name.split(' ')[0]}</Text>
            </View>
          </View>
        </View>

        {(activeMatch as any).github || (activeMatch as any).twitter || (activeMatch as any).linkedin ? (
          <View style={styles.socialsBadgeRow}>
            {(activeMatch as any).github ? (
              <View style={styles.socialBadgeChip}>
                <Github color="#800020" size={12} />
                <Text style={styles.socialBadgeText}>{formatSocial((activeMatch as any).github, 'github')}</Text>
              </View>
            ) : null}
            {(activeMatch as any).twitter ? (
              <View style={styles.socialBadgeChip}>
                <Twitter color="#800020" size={12} />
                <Text style={styles.socialBadgeText}>{formatSocial((activeMatch as any).twitter, 'twitter')}</Text>
              </View>
            ) : null}
            {(activeMatch as any).linkedin ? (
              <View style={styles.socialBadgeChip}>
                <Linkedin color="#800020" size={12} />
                <Text style={styles.socialBadgeText}>{formatSocial((activeMatch as any).linkedin, 'linkedin')}</Text>
              </View>
            ) : null}
          </View>
        ) : null}

        <View style={styles.scoreCard}>
          <Text style={styles.compatibilityLabel}>Compatibility Score</Text>
          <Text style={styles.compatibilityPercent}>{activeMatch.compatibilityScore}%</Text>
          <Text style={styles.compatibilityDetails}>
            ✦ Similar schedules ({activeMatch.schedule}){'\n'}
            ✦ Complementary process ({activeMatch.shipVsPolish}){'\n'}
            ✦ High chemistry potential
          </Text>
        </View>

        <TouchableOpacity style={styles.unlockButton} onPress={() => navigation.navigate('Matches', { screen: 'Chat' })}>
          <View style={styles.solidButton}>
            <MessageSquare color="#FFFFFF" size={20} />
            <Text style={styles.unlockText}>Unlock Chat & Sprint</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F9F6F0' },
  mainContent: { width: '90%', maxWidth: 400, alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  synqText: { fontSize: 48, fontFamily: 'serif', fontWeight: '900', color: '#800020', letterSpacing: -1 },
  matchSub: { fontSize: 16, color: '#767676', fontStyle: 'italic', fontWeight: '600', marginBottom: 40 },
  avatarArena: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 40 },
  avatarWrapper: { width: 110, height: 110, borderRadius: 55, borderWidth: 2, borderColor: '#800020', borderStyle: 'dotted', padding: 4, backgroundColor: '#FFFFFF', position: 'relative' },
  matchAvatar: { width: '100%', height: '100%', borderRadius: 55 },
  avatarLabel: { position: 'absolute', bottom: -10, left: '15%', right: '15%', paddingVertical: 4, borderRadius: 8, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E0E0E0', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  avatarLabelText: { color: '#800020', fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  matchLink: { width: 60, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  zapIcon: { position: 'absolute', zIndex: 2, backgroundColor: '#F9F6F0', paddingHorizontal: 4 },
  dottedLinkLine: { width: '100%', height: 1, borderWidth: 1, borderColor: '#E0E0E0', borderStyle: 'dotted', backgroundColor: 'transparent' },
  scoreCard: { width: '100%', padding: 24, alignItems: 'center', marginBottom: 40, backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E0E0E0', borderStyle: 'dotted', shadowColor: '#800020', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.05, shadowRadius: 20, elevation: 5 },
  compatibilityLabel: { color: '#767676', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  compatibilityPercent: { fontSize: 42, fontFamily: 'serif', fontWeight: '900', color: '#800020', marginVertical: 8 },
  compatibilityDetails: { color: '#2C2C2C', fontSize: 13, lineHeight: 22, textAlign: 'center', fontWeight: '500', marginTop: 4 },
  unlockButton: { width: '100%', borderRadius: 8, overflow: 'hidden', backgroundColor: '#800020', shadowColor: '#800020', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 16, elevation: 8 },
  solidButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, gap: 10 },
  unlockText: { color: '#FFFFFF', fontWeight: '800', fontSize: 16, letterSpacing: 0.5, fontFamily: 'serif' },
  socialsBadgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 24 },
  socialBadgeChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E0E0E0', borderStyle: 'dotted', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  socialBadgeText: { color: '#800020', fontSize: 12, fontWeight: '700' },
});
