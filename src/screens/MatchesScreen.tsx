import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MessageSquare, Zap, Sparkles } from 'lucide-react-native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useApp } from '../context/AppContext';
import { GlassCard } from '../components/GlassCard';

type Props = any;

export const MatchesScreen: React.FC<Props> = ({ navigation }) => {
  const { matchedProfiles, setActiveMatch } = useApp();

  const handleOpenChat = (profile: any) => {
    setActiveMatch(profile);
    navigation.navigate('Chat');
  };

  const handleStartSprint = (profile: any) => {
    setActiveMatch(profile);
    navigation.navigate('SprintRoom');
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#06050C', '#0C0A1A', '#06050C']} style={StyleSheet.absoluteFillObject} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Matches</Text>
        <Text style={styles.headerSub}>{matchedProfiles.length} connection{matchedProfiles.length !== 1 ? 's' : ''}</Text>
      </View>

      {matchedProfiles.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>💫</Text>
          <Text style={styles.emptyTitle}>No Synqs yet</Text>
          <Text style={styles.emptyDesc}>Swipe right on someone in Discover to start matching!</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {matchedProfiles.map(profile => (
            <GlassCard key={profile.id} style={styles.matchCard} borderColor={profile.archetype.glowColor + '44'}>
              <View style={styles.cardTop}>
                <Image source={{ uri: profile.avatar }} style={styles.avatar} />
                <View style={styles.info}>
                  <View style={styles.nameRow}>
                    <Text style={styles.name}>{profile.name}</Text>
                    <View style={[styles.scoreBadge, { borderColor: profile.archetype.glowColor }]}>
                      <Sparkles color={profile.archetype.glowColor} size={10} style={{ marginRight: 3 }} />
                      <Text style={[styles.scoreText, { color: profile.archetype.glowColor }]}>{profile.compatibilityScore}%</Text>
                    </View>
                  </View>
                  <Text style={styles.role}>{profile.role} · {profile.college}</Text>
                  <Text style={styles.tagline} numberOfLines={1}>{profile.tagline}</Text>
                  <View style={[styles.archetypeChip, { borderColor: profile.archetype.glowColor + '55' }]}>
                    <Text style={styles.archetypeEmoji}>{profile.archetype.emoji}</Text>
                    <Text style={[styles.archetypeText, { color: profile.archetype.glowColor }]}>{profile.archetype.name}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.actions}>
                <TouchableOpacity style={styles.chatBtn} onPress={() => handleOpenChat(profile)}>
                  <MessageSquare color="#00F0FF" size={16} style={{ marginRight: 6 }} />
                  <Text style={styles.chatBtnText}>Open Chat</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.sprintBtn} onPress={() => handleStartSprint(profile)}>
                  <LinearGradient colors={['#8A2BE2', '#00F0FF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.sprintGrad}>
                    <Zap color="#FFF" size={14} style={{ marginRight: 6 }} />
                    <Text style={styles.sprintBtnText}>Sprint</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </GlassCard>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#06050C', paddingTop: Platform.OS === 'ios' ? 50 : 20 },
  header: { paddingHorizontal: 20, paddingVertical: 16 },
  headerTitle: { color: '#FFF', fontSize: 28, fontWeight: '900', letterSpacing: -0.5 },
  headerSub: { color: '#636275', fontSize: 13, fontWeight: '600', marginTop: 2 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  emptyEmoji: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { color: '#FFF', fontSize: 22, fontWeight: '800', marginBottom: 8 },
  emptyDesc: { color: '#636275', fontSize: 14, textAlign: 'center', lineHeight: 20 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  matchCard: { padding: 16, marginBottom: 16 },
  cardTop: { flexDirection: 'row', marginBottom: 14 },
  avatar: { width: 70, height: 70, borderRadius: 35, marginRight: 14 },
  info: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 },
  name: { color: '#FFF', fontSize: 17, fontWeight: '800' },
  scoreBadge: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 100 },
  scoreText: { fontSize: 11, fontWeight: '800' },
  role: { color: '#636275', fontSize: 12, fontWeight: '600' },
  tagline: { color: '#8E8D9C', fontSize: 12, marginTop: 4 },
  archetypeChip: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginTop: 6, backgroundColor: 'rgba(0,0,0,0.3)' },
  archetypeEmoji: { fontSize: 12, marginRight: 4 },
  archetypeText: { fontSize: 11, fontWeight: '700' },
  actions: { flexDirection: 'row', gap: 10 },
  chatBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,240,255,0.06)', borderWidth: 1, borderColor: 'rgba(0,240,255,0.15)', borderRadius: 12, height: 42 },
  chatBtnText: { color: '#00F0FF', fontWeight: '700', fontSize: 13 },
  sprintBtn: { flex: 1, borderRadius: 12, overflow: 'hidden' },
  sprintGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 42 },
  sprintBtnText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
});
