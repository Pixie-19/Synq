import React, { useRef, useState } from 'react';
import {
  StyleSheet, Text, View, Image, Animated, PanResponder,
  TouchableOpacity, Dimensions, Platform
} from 'react-native';
import { Heart, X, Zap, AlertTriangle, Clock, Music, Sparkles, PenTool, Mic, Server, Coffee } from 'lucide-react-native';
import { Github, Twitter, Linkedin } from '../components/SocialIcons';
import type { StackScreenProps } from '@react-navigation/stack';
import { useApp } from '../context/AppContext';
import { UserProfile } from '../types';

const { width: SW, height: SH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SW * 0.35;
const CARD_W = SW - 40;

type Props = StackScreenProps<any, 'DiscoverMain'>;

const cleanHandle = (value?: string) => (value || '').trim().replace(/^@/, '').replace(/^(https?:\/\/)?(www\.)?/i, '').replace(/\/$/, '');
const formatSocial = (value?: string, platform?: 'github' | 'twitter' | 'linkedin') => {
  const handle = cleanHandle(value);
  if (!handle) return '';
  if (platform === 'twitter') return `x.com/${handle.replace(/^(x\.com|twitter\.com)\//i, '')}`;
  if (platform === 'linkedin') return `linkedin.com/in/${handle.replace(/^linkedin\.com\/(in\/)?/i, '')}`;
  return `github.com/${handle.replace(/^github\.com\//i, '')}`;
};

const IconMap: Record<string, any> = {
  'PenTool': PenTool,
  'Mic': Mic,
  'Server': Server,
  'Zap': Zap,
  'Coffee': Coffee
};

// ─── Single swipe card ─────────────────────────────────────────────────────────

interface SwipeCardProps {
  profile: UserProfile;
  redFlags: string[];
  onSwipeRight: () => void;
  onSwipeLeft: () => void;
  isTop: boolean;
  stackIndex: number;
}

const SwipeCard: React.FC<SwipeCardProps> = ({ profile, redFlags, onSwipeRight, onSwipeLeft, isTop, stackIndex }) => {
  const position   = useRef(new Animated.ValueXY()).current;
  const [expanded, setExpanded] = useState(false);

  const rotation = position.x.interpolate({
    inputRange: [-SW / 2, 0, SW / 2],
    outputRange: ['-12deg', '0deg', '12deg'],
    extrapolate: 'clamp',
  });

  const likeOpacity = position.x.interpolate({
    inputRange: [0, SW * 0.15],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const passOpacity = position.x.interpolate({
    inputRange: [-SW * 0.15, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => isTop,
    onMoveShouldSetPanResponder: () => isTop,
    onPanResponderMove: (_, gesture) => {
      position.setValue({ x: gesture.dx, y: gesture.dy });
    },
    onPanResponderRelease: (_, gesture) => {
      if (gesture.dx > SWIPE_THRESHOLD) {
        Animated.timing(position, {
          toValue: { x: SW + 100, y: gesture.dy },
          duration: 280,
          useNativeDriver: true,
        }).start(onSwipeRight);
      } else if (gesture.dx < -SWIPE_THRESHOLD) {
        Animated.timing(position, {
          toValue: { x: -SW - 100, y: gesture.dy },
          duration: 280,
          useNativeDriver: true,
        }).start(onSwipeLeft);
      } else {
        Animated.spring(position, {
          toValue: { x: 0, y: 0 },
          friction: 5,
          useNativeDriver: true,
        }).start();
      }
    },
  });

  const cardStyle = isTop
    ? { transform: [...position.getTranslateTransform(), { rotate: rotation }] }
    : {
        transform: [
          { scale: 1 - stackIndex * 0.04 },
          { translateY: stackIndex * 12 },
        ],
        opacity: 1 - stackIndex * 0.15,
      };

  const ArchetypeIcon = IconMap[profile.archetype.icon] || Sparkles;

  return (
    <Animated.View
      style={[styles.card, cardStyle, { zIndex: 10 - stackIndex }]}
      {...(isTop ? panResponder.panHandlers : {})}
    >
      <Image source={{ uri: profile.avatar }} style={styles.cardImage} />
      <View style={styles.cardGradient} />

      {/* Swipe indicators */}
      <Animated.View style={[styles.swipeLabel, styles.likeBadge, { opacity: likeOpacity }]}>
        <Text style={styles.likeLabelText}>SYNQ</Text>
      </Animated.View>
      <Animated.View style={[styles.swipeLabel, styles.passBadge, { opacity: passOpacity }]}>
        <Text style={styles.passLabelText}>PASS</Text>
      </Animated.View>

      <View style={styles.cardInfo}>
        {/* Compatibility score badge */}
        <View style={styles.scoreBadge}>
          <Sparkles color="#800020" size={12} style={{ marginRight: 4 }} />
          <Text style={styles.scoreText}>{profile.compatibilityScore}% Match</Text>
        </View>

        <Text style={styles.profileName}>{profile.name}</Text>
        <Text style={styles.profileRole}>{profile.role} · {profile.college}</Text>
        {(profile as any).github || (profile as any).twitter || (profile as any).linkedin ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6, alignItems: 'center' }}>
            {(profile as any).github ? <Text style={{ color: '#767676', fontSize: 11, fontWeight: '700' }}>{formatSocial((profile as any).github, 'github')}</Text> : null}
            {(profile as any).twitter ? <Text style={{ color: '#767676', fontSize: 11, fontWeight: '700' }}>{formatSocial((profile as any).twitter, 'twitter')}</Text> : null}
            {(profile as any).linkedin ? <Text style={{ color: '#767676', fontSize: 11, fontWeight: '700' }}>{formatSocial((profile as any).linkedin, 'linkedin')}</Text> : null}
          </View>
        ) : null}
        <Text style={styles.profileTagline}>{profile.tagline}</Text>

        <View style={styles.infoRow}>
          <Clock color="#767676" size={13} style={{ marginRight: 4 }} />
          <Text style={styles.infoText}>{profile.schedule}</Text>
          <Music color="#767676" size={13} style={{ marginLeft: 12, marginRight: 4 }} />
          <Text style={styles.infoText}>{profile.musicVibe}</Text>
        </View>

        {/* Archetype chip */}
        <View style={styles.archetypeChip}>
          <ArchetypeIcon color="#800020" size={14} style={{ marginRight: 6 }} />
          <Text style={styles.archetypeChipText}>{profile.archetype.name}</Text>
        </View>

        {/* Skills */}
        <View style={styles.skillsRow}>
          {profile.skills.slice(0, 4).map(s => (
            <View key={s} style={styles.skillChip}><Text style={styles.skillChipText}>{s}</Text></View>
          ))}
        </View>

        {/* Red flags */}
        {redFlags.length > 0 && (
          <View style={styles.redFlagCard}>
            <AlertTriangle color="#D03B5B" size={14} style={{ marginRight: 6 }} />
            <Text style={styles.redFlagText}>{redFlags[0]}</Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
};

// ─── Discover Screen ───────────────────────────────────────────────────────────

export const DiscoverScreen: React.FC<Props> = ({ navigation }) => {
  const { profiles, currentProfileIndex, advanceProfile, setActiveMatch, addMatch, redFlagsForProfile, seedDemoBuilders } = useApp();
  const [localIndex, setLocalIndex] = useState(currentProfileIndex);

  const visibleProfiles = profiles.slice(localIndex, localIndex + 3);

  const handleSwipeRight = (profile: UserProfile) => {
    addMatch(profile);
    setActiveMatch(profile);
    setLocalIndex(i => i + 1);
    navigation.navigate('Match');
  };

  const handleSwipeLeft = () => {
    setLocalIndex(i => i + 1);
  };

  const handleManualLike = () => {
    if (visibleProfiles.length === 0) return;
    handleSwipeRight(visibleProfiles[0]);
  };

  const handleManualPass = () => {
    if (visibleProfiles.length === 0) return;
    handleSwipeLeft();
  };

  if (visibleProfiles.length === 0) {
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 }]}>
        <Text style={{ color: '#2C2C2C', fontSize: 18, fontWeight: '700', fontFamily: 'serif', textAlign: 'center' }}>No more profiles</Text>
        <Text style={{ color: '#767676', fontSize: 13, marginTop: 8, fontStyle: 'italic', textAlign: 'center', marginBottom: 24 }}>Check back tomorrow or seed demo builders to test matchmaking!</Text>
        
        {seedDemoBuilders && (
          <TouchableOpacity 
            style={{ 
              backgroundColor: '#800020', 
              paddingVertical: 12, 
              paddingHorizontal: 20, 
              borderRadius: 8,
              borderWidth: 1,
              borderColor: '#800020',
              borderStyle: 'solid'
            }} 
            onPress={seedDemoBuilders}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 13, fontFamily: 'serif' }}>Seed Demo Builders (Test Mode)</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Discover</Text>
        <TouchableOpacity style={styles.emergencyBtn} onPress={() => navigation.navigate('EmergencyBuilder')}>
          <Zap color="#800020" size={16} />
          <Text style={styles.emergencyText}>Need Team Fast?</Text>
        </TouchableOpacity>
      </View>

      {/* Card stack — render back-to-front */}
      <View style={styles.cardStack}>
        {[...visibleProfiles].reverse().map((profile, reversedIdx) => {
          const stackIndex = (visibleProfiles.length - 1) - reversedIdx;
          const isTop = stackIndex === 0;
          return (
            <SwipeCard
              key={profile.id}
              profile={profile}
              redFlags={redFlagsForProfile(profile)}
              onSwipeRight={() => handleSwipeRight(profile)}
              onSwipeLeft={handleSwipeLeft}
              isTop={isTop}
              stackIndex={stackIndex}
            />
          );
        })}
      </View>

      {/* Action buttons */}
      <View style={styles.actionsRow}>
        <TouchableOpacity style={[styles.actionBtn, styles.passBtn]} onPress={handleManualPass}>
          <X color="#767676" size={28} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionBtn, styles.likeBtn]} onPress={handleManualLike}>
          <Heart color="#FFFFFF" size={28} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F6F0', paddingTop: Platform.OS === 'ios' ? 50 : 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 },
  headerTitle: { color: '#800020', fontSize: 32, fontFamily: 'serif', fontWeight: '900', letterSpacing: -0.5 },
  emergencyBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E0E0E0', borderStyle: 'dotted', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 100 },
  emergencyText: { color: '#800020', fontSize: 12, fontWeight: '700' },
  cardStack: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  card: { position: 'absolute', width: CARD_W, height: SH * 0.65, borderRadius: 28, overflow: 'hidden', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E0E0E0', borderStyle: 'solid', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.05, shadowRadius: 20, elevation: 5 },
  cardImage: { width: '100%', height: '55%', position: 'absolute', top: 0 },
  cardGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%', backgroundColor: '#FFFFFF' }, // Replaced black gradient with solid white for content area
  swipeLabel: { position: 'absolute', top: 48, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, borderWidth: 2, borderStyle: 'dotted', zIndex: 20 },
  likeBadge: { right: 20, borderColor: '#800020', backgroundColor: '#FFFFFF', transform: [{ rotate: '15deg' }] },
  passBadge: { left: 20, borderColor: '#767676', backgroundColor: '#FFFFFF', transform: [{ rotate: '-15deg' }] },
  likeLabelText: { color: '#800020', fontWeight: '900', fontSize: 18, letterSpacing: 2, fontFamily: 'serif' },
  passLabelText: { color: '#767676', fontWeight: '900', fontSize: 18, letterSpacing: 2, fontFamily: 'serif' },
  cardInfo: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 24, backgroundColor: '#FFFFFF' },
  scoreBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', borderWidth: 1, borderColor: '#800020', borderStyle: 'dotted', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 100, marginBottom: 10 },
  scoreText: { color: '#800020', fontSize: 12, fontWeight: '800' },
  profileName: { color: '#2C2C2C', fontSize: 28, fontFamily: 'serif', fontWeight: '900', letterSpacing: -0.5 },
  profileRole: { color: '#767676', fontSize: 13, fontWeight: '600', marginTop: 2 },
  profileTagline: { color: '#2C2C2C', fontSize: 14, fontWeight: '600', fontStyle: 'italic', marginTop: 6 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  infoText: { color: '#767676', fontSize: 12, fontWeight: '500' },
  archetypeChip: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', borderWidth: 1, borderColor: '#E0E0E0', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, marginTop: 10, backgroundColor: '#F9F6F0' },
  archetypeChipText: { color: '#800020', fontSize: 12, fontWeight: '700' },
  skillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  skillChip: { backgroundColor: '#F9F6F0', borderWidth: 1, borderColor: '#E0E0E0', borderStyle: 'dotted', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  skillChipText: { color: '#2C2C2C', fontSize: 11, fontWeight: '500' },
  redFlagCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E0E0E0', borderStyle: 'dotted', borderRadius: 10, padding: 8, marginTop: 10 },
  redFlagText: { color: '#D03B5B', fontSize: 11, fontWeight: '600', flex: 1 },
  actionsRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 40, paddingBottom: Platform.OS === 'ios' ? 20 : 12, paddingTop: 12 },
  actionBtn: { width: 68, height: 68, borderRadius: 34, alignItems: 'center', justifyContent: 'center', shadowColor: '#800020', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 8 },
  passBtn: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E0E0E0', borderStyle: 'dotted' },
  likeBtn: { backgroundColor: '#800020' },
});
