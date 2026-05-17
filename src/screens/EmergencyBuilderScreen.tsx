import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Zap, Users, Sparkles } from 'lucide-react-native';
import type { StackScreenProps } from '@react-navigation/stack';
import { GlassCard } from '../components/GlassCard';

type Props = StackScreenProps<any, 'EmergencyBuilder'>;

const INCOMPLETE_TEAMS = [
  { id: 'pygen', name: 'Team PyGen', neededRole: 'Backend Developer 🖥️', skillsNeeded: ['Go','PostgreSQL','Redis'], membersCount: 2, maxMembers: 4, matchScore: 91, vibe: 'Ship Fast & Hype', vibeIcon: '🔥' },
  { id: 'bytecrafters', name: 'ByteCrafters', neededRole: 'UI/UX Designer ✨', skillsNeeded: ['Figma','Framer','CSS'], membersCount: 3, maxMembers: 4, matchScore: 88, vibe: 'Lofi & Focus', vibeIcon: '🎧' },
  { id: 'nexus', name: 'Nexus Forge', neededRole: 'Frontend Developer 🎨', skillsNeeded: ['React Native','Tailwind'], membersCount: 1, maxMembers: 4, matchScore: 84, vibe: 'Chaos Innovation', vibeIcon: '⚡' },
];

export const EmergencyBuilderScreen: React.FC<Props> = ({ navigation }) => {
  const [requestedId, setRequestedId] = useState<string | null>(null);

  const handleRequest = (team: typeof INCOMPLETE_TEAMS[0]) => {
    setRequestedId(team.id);
    setTimeout(() => {
      Alert.alert('⚡ Signal Synced!', `Your profile was sent to ${team.name}. They've been pinged!`);
      setRequestedId(null);
    }, 1200);
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#06050C','#0E0922','#06050C']} style={StyleSheet.absoluteFillObject} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft color="#8E8D9C" size={20} />
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Zap color="#FFD700" size={18} />
          <Text style={styles.headerTitle}>EMERGENCY TEAM MIXER</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <GlassCard style={styles.pitchCard} borderColor="rgba(255,215,0,0.25)">
          <Text style={styles.pitchTitle}>Solo or Abandoned? ⚡</Text>
          <Text style={styles.pitchDesc}>Our AI monitors team formations to spot squads with open slots that match your skill set.</Text>
        </GlassCard>

        <Text style={styles.sectionTitle}>AI Recommended Squads</Text>

        {INCOMPLETE_TEAMS.map(team => {
          const isPending = requestedId === team.id;
          return (
            <GlassCard key={team.id} style={styles.teamCard} borderColor="rgba(255,255,255,0.08)">
              <View style={styles.teamCardHeader}>
                <View style={styles.vibeTag}>
                  <Text style={styles.vibeEmoji}>{team.vibeIcon}</Text>
                  <Text style={styles.vibeText}>{team.vibe}</Text>
                </View>
                <View style={styles.scoreBadge}>
                  <Sparkles color="#FFD700" size={10} style={{ marginRight: 4 }} />
                  <Text style={styles.scoreText}>{team.matchScore}% Match</Text>
                </View>
              </View>
              <Text style={styles.teamName}>{team.name}</Text>
              <View style={styles.memberStats}>
                <Users color="#8E8D9C" size={14} style={{ marginRight: 6 }} />
                <Text style={styles.memberStatsText}>{team.membersCount}/{team.maxMembers} Members</Text>
              </View>
              <View style={styles.divider} />
              <Text style={styles.spotLabel}>URGENT SPOT VACANT:</Text>
              <Text style={styles.spotRole}>{team.neededRole}</Text>
              <View style={styles.skillsRow}>
                {team.skillsNeeded.map(skill => (
                  <View key={skill} style={styles.skillChip}><Text style={styles.skillChipText}>{skill}</Text></View>
                ))}
              </View>
              <TouchableOpacity style={[styles.requestBtn, isPending && { opacity: 0.7 }]} onPress={() => handleRequest(team)} disabled={isPending}>
                <LinearGradient colors={isPending ? ['#1E1B2C','#1E1B2C'] : ['#8A2BE2','#4B0082']} start={{ x:0,y:0 }} end={{ x:1,y:0 }} style={styles.requestGrad}>
                  <Zap color="#FFF" size={14} style={{ marginRight: 6 }} />
                  <Text style={styles.requestBtnText}>{isPending ? 'Syncing Profile...' : 'Instantly Apply'}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </GlassCard>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#06050C', paddingTop: Platform.OS === 'ios' ? 50 : 20 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  backBtn: { padding: 6 },
  headerTitleWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, marginLeft: 8 },
  headerTitle: { color: '#FFD700', fontSize: 12, fontWeight: '900', letterSpacing: 1.5 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  pitchCard: { padding: 20, marginVertical: 20 },
  pitchTitle: { color: '#FFF', fontSize: 18, fontWeight: '800', marginBottom: 6 },
  pitchDesc: { color: '#8E8D9C', fontSize: 12, lineHeight: 18, fontWeight: '500' },
  sectionTitle: { color: '#00F0FF', fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 },
  teamCard: { padding: 16, marginBottom: 16 },
  teamCardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  vibeTag: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  vibeEmoji: { fontSize: 12, marginRight: 4 },
  vibeText: { color: '#8E8D9C', fontSize: 11, fontWeight: '700' },
  scoreBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,215,0,0.06)', borderWidth: 1, borderColor: 'rgba(255,215,0,0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  scoreText: { color: '#FFD700', fontSize: 11, fontWeight: '800' },
  teamName: { fontSize: 22, fontWeight: '900', color: '#FFF', letterSpacing: -0.5 },
  memberStats: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  memberStatsText: { color: '#8E8D9C', fontSize: 12, fontWeight: '600' },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginVertical: 14 },
  spotLabel: { color: '#00F0FF', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  spotRole: { color: '#FFF', fontSize: 14, fontWeight: '800', marginTop: 2 },
  skillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10, marginBottom: 16 },
  skillChip: { backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
  skillChipText: { color: '#8E8D9C', fontSize: 11, fontWeight: '500' },
  requestBtn: { borderRadius: 12, overflow: 'hidden' },
  requestGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 44 },
  requestBtnText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
});
