import React, { useRef, useState } from 'react';
import {
  StyleSheet, Text, View, Image, Animated, PanResponder,
  TouchableOpacity, Dimensions, Platform, ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Heart, X, Zap, AlertTriangle, Users, Clock, Music, Sparkles } from 'lucide-react-native';
import type { StackScreenProps } from '@react-navigation/stack';
import { useApp } from '../context/AppContext';
import { GlassCard } from '../components/GlassCard';
import { UserProfile } from '../types';

const { width: SW, height: SH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SW * 0.35;
const CARD_W = SW - 40;

type Props = StackScreenProps<any, 'DiscoverMain'>;

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

  return (
    <Animated.View
      style={[styles.card, cardStyle, { zIndex: 10 - stackIndex }]}
      {...(isTop ? panResponder.panHandlers : {})}
    >
      <Image source={{ uri: profile.avatar }} style={styles.cardImage} />
      <LinearGradient colors={['transparent', 'rgba(6,5,12,0.95)']} style={styles.cardGradient} />

      {/* Swipe indicators */}
      <Animated.View style={[styles.swipeLabel, styles.likeBadge, { opacity: likeOpacity }]}>
        <Text style={styles.likeLabelText}>SYNQ ✓</Text>
      </Animated.View>
      <Animated.View style={[styles.swipeLabel, styles.passBadge, { opacity: passOpacity }]}>
        <Text style={styles.passLabelText}>PASS ✗</Text>
      </Animated.View>

      <View style={styles.cardInfo}>
        {/* Compatibility score badge */}
        <View style={[styles.scoreBadge, { backgroundColor: profile.archetype.glowColor + '22', borderColor: profile.archetype.glowColor }]}>
          <Sparkles color={profile.archetype.glowColor} size={12} style={{ marginRight: 4 }} />
          <Text style={[styles.scoreText, { color: profile.archetype.glowColor }]}>{profile.compatibilityScore}% Match</Text>
        </View>

        <Text style={styles.profileName}>{profile.name}</Text>
        <Text style={styles.profileRole}>{profile.role} · {profile.college}</Text>
        <Text style={styles.profileTagline}>{profile.tagline}</Text>

        <View style={styles.infoRow}>
          <Clock color="#636275" size={13} style={{ marginRight: 4 }} />
          <Text style={styles.infoText}>{profile.schedule}</Text>
          <Music color="#636275" size={13} style={{ marginLeft: 12, marginRight: 4 }} />
          <Text style={styles.infoText}>{profile.musicVibe}</Text>
        </View>

        {/* Archetype chip */}
        <View style={[styles.archetypeChip, { borderColor: profile.archetype.glowColor + '55' }]}>
          <Text style={styles.archetypeEmoji}>{profile.archetype.emoji}</Text>
          <Text style={[styles.archetypeChipText, { color: profile.archetype.glowColor }]}>{profile.archetype.name}</Text>
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
            <AlertTriangle color="#FF4500" size={14} style={{ marginRight: 6 }} />
            <Text style={styles.redFlagText}>{redFlags[0]}</Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
};

// ─── Discover Screen ───────────────────────────────────────────────────────────

export const DiscoverScreen: React.FC<Props> = ({ navigation }) => {
  const { profiles, currentProfileIndex, advanceProfile, setActiveMatch, addMatch, redFlagsForProfile } = useApp();
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
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <LinearGradient colors={['#06050C', '#0C0A1A', '#06050C']} style={StyleSheet.absoluteFillObject} />
        <Text style={{ color: '#8E8D9C', fontSize: 18, fontWeight: '700' }}>No more profiles 👀</Text>
        <Text style={{ color: '#636275', fontSize: 13, marginTop: 8 }}>Check back tomorrow!</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#06050C', '#0C0A1A', '#06050C']} style={StyleSheet.absoluteFillObject} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Discover</Text>
        <TouchableOpacity style={styles.emergencyBtn} onPress={() => navigation.navigate('EmergencyBuilder')}>
          <Zap color="#FFD700" size={16} />
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
          <X color="#FF4500" size={28} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionBtn, styles.likeBtn]} onPress={handleManualLike}>
          <LinearGradient colors={['#8A2BE2', '#00F0FF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.likeBtnGrad}>
            <Heart color="#FFF" size={28} />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#06050C', paddingTop: Platform.OS === 'ios' ? 50 : 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 },
  headerTitle: { color: '#FFFFFF', fontSize: 28, fontWeight: '900', letterSpacing: -0.5 },
  emergencyBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,215,0,0.08)', borderWidth: 1, borderColor: 'rgba(255,215,0,0.2)', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 100 },
  emergencyText: { color: '#FFD700', fontSize: 12, fontWeight: '700' },
  cardStack: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  card: { position: 'absolute', width: CARD_W, height: SH * 0.65, borderRadius: 28, overflow: 'hidden', backgroundColor: '#0C0A1A' },
  cardImage: { width: '100%', height: '100%', position: 'absolute' },
  cardGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '70%' },
  swipeLabel: { position: 'absolute', top: 48, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, borderWidth: 3, zIndex: 20 },
  likeBadge: { right: 20, borderColor: '#39FF14', backgroundColor: 'rgba(57,255,20,0.1)', transform: [{ rotate: '15deg' }] },
  passBadge: { left: 20, borderColor: '#FF4500', backgroundColor: 'rgba(255,69,0,0.1)', transform: [{ rotate: '-15deg' }] },
  likeLabelText: { color: '#39FF14', fontWeight: '900', fontSize: 20, letterSpacing: 2 },
  passLabelText: { color: '#FF4500', fontWeight: '900', fontSize: 20, letterSpacing: 2 },
  cardInfo: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20 },
  scoreBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', borderWidth: 1, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 100, marginBottom: 10 },
  scoreText: { fontSize: 12, fontWeight: '800' },
  profileName: { color: '#FFF', fontSize: 26, fontWeight: '900', letterSpacing: -0.5 },
  profileRole: { color: '#8E8D9C', fontSize: 13, fontWeight: '600', marginTop: 2 },
  profileTagline: { color: '#FFFFFF', fontSize: 13, fontWeight: '500', marginTop: 6, opacity: 0.85 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  infoText: { color: '#8E8D9C', fontSize: 12, fontWeight: '500' },
  archetypeChip: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', borderWidth: 1, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, marginTop: 10, backgroundColor: 'rgba(0,0,0,0.3)' },
  archetypeEmoji: { fontSize: 14, marginRight: 6 },
  archetypeChipText: { fontSize: 12, fontWeight: '700' },
  skillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  skillChip: { backgroundColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  skillChipText: { color: '#CCC', fontSize: 11, fontWeight: '500' },
  redFlagCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,69,0,0.08)', borderWidth: 1, borderColor: 'rgba(255,69,0,0.2)', borderRadius: 10, padding: 8, marginTop: 10 },
  redFlagText: { color: '#FF4500', fontSize: 11, fontWeight: '600', flex: 1 },
  actionsRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 40, paddingBottom: Platform.OS === 'ios' ? 20 : 12, paddingTop: 12 },
  actionBtn: { width: 68, height: 68, borderRadius: 34, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 },
  passBtn: { backgroundColor: '#1A0A0A', borderWidth: 2, borderColor: 'rgba(255,69,0,0.3)' },
  likeBtn: { borderRadius: 34, overflow: 'hidden' },
  likeBtnGrad: { width: 68, height: 68, alignItems: 'center', justifyContent: 'center' },
});
