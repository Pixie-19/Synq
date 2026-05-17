import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { ArrowLeft, Zap, Users, Sparkles, Headphones, Flame } from 'lucide-react-native';
import type { StackScreenProps } from '@react-navigation/stack';

type Props = StackScreenProps<any, 'EmergencyBuilder'>;

const IconMap: Record<string, any> = {
  'Flame': Flame,
  'Headphones': Headphones,
  'Zap': Zap,
};

const INCOMPLETE_TEAMS = [
  { id: 'pygen', name: 'Team PyGen', neededRole: 'Backend Developer', skillsNeeded: ['Go','PostgreSQL','Redis'], membersCount: 2, maxMembers: 4, matchScore: 91, vibe: 'Ship Fast & Hype', vibeIcon: 'Flame' },
  { id: 'bytecrafters', name: 'ByteCrafters', neededRole: 'UI/UX Designer', skillsNeeded: ['Figma','Framer','CSS'], membersCount: 3, maxMembers: 4, matchScore: 88, vibe: 'Lofi & Focus', vibeIcon: 'Headphones' },
  { id: 'nexus', name: 'Nexus Forge', neededRole: 'Frontend Developer', skillsNeeded: ['React Native','Tailwind'], membersCount: 1, maxMembers: 4, matchScore: 84, vibe: 'Chaos Innovation', vibeIcon: 'Zap' },
];

export const EmergencyBuilderScreen: React.FC<Props> = ({ navigation }) => {
  const [requestedId, setRequestedId] = useState<string | null>(null);

  const handleRequest = (team: typeof INCOMPLETE_TEAMS[0]) => {
    setRequestedId(team.id);
    setTimeout(() => {
      Alert.alert('Signal Synced!', `Your profile was sent to ${team.name}. They've been pinged!`);
      setRequestedId(null);
    }, 1200);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft color="#767676" size={20} />
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Zap color="#800020" size={18} />
          <Text style={styles.headerTitle}>EMERGENCY TEAM MIXER</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.pitchCard}>
          <Text style={styles.pitchTitle}>Solo or Abandoned?</Text>
          <Text style={styles.pitchDesc}>Our AI monitors team formations to spot squads with open slots that match your skill set.</Text>
        </View>

        <Text style={styles.sectionTitle}>AI Recommended Squads</Text>

        {INCOMPLETE_TEAMS.map(team => {
          const isPending = requestedId === team.id;
          const VibeIcon = IconMap[team.vibeIcon] || Sparkles;
          return (
            <View key={team.id} style={styles.teamCard}>
              <View style={styles.teamCardHeader}>
                <View style={styles.vibeTag}>
                  <VibeIcon color="#767676" size={12} style={{ marginRight: 4 }} />
                  <Text style={styles.vibeText}>{team.vibe}</Text>
                </View>
                <View style={styles.scoreBadge}>
                  <Sparkles color="#800020" size={10} style={{ marginRight: 4 }} />
                  <Text style={styles.scoreText}>{team.matchScore}% Match</Text>
                </View>
              </View>
              <Text style={styles.teamName}>{team.name}</Text>
              <View style={styles.memberStats}>
                <Users color="#767676" size={14} style={{ marginRight: 6 }} />
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
                <View style={[styles.requestGrad, isPending ? styles.requestGradPending : null]}>
                  <Zap color="#FFFFFF" size={14} style={{ marginRight: 6 }} />
                  <Text style={styles.requestBtnText}>{isPending ? 'Syncing Profile...' : 'Instantly Apply'}</Text>
                </View>
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F6F0', paddingTop: Platform.OS === 'ios' ? 50 : 20 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#E0E0E0', borderStyle: 'dotted' },
  backBtn: { padding: 6 },
  headerTitleWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, marginLeft: 8 },
  headerTitle: { color: '#800020', fontSize: 12, fontWeight: '900', letterSpacing: 1.5, fontFamily: 'serif' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  pitchCard: { padding: 20, marginVertical: 20, backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E0E0E0', borderStyle: 'dotted', shadowColor: '#800020', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.05, shadowRadius: 20, elevation: 5 },
  pitchTitle: { color: '#800020', fontSize: 24, fontFamily: 'serif', fontWeight: '800', marginBottom: 6 },
  pitchDesc: { color: '#767676', fontSize: 13, lineHeight: 20, fontWeight: '500' },
  sectionTitle: { color: '#2C2C2C', fontSize: 14, fontFamily: 'serif', fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 },
  teamCard: { padding: 16, marginBottom: 16, backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E0E0E0', borderStyle: 'dotted', shadowColor: '#800020', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  teamCardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  vibeTag: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9F6F0', borderWidth: 1, borderColor: '#E0E0E0', borderStyle: 'dotted', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  vibeText: { color: '#767676', fontSize: 11, fontWeight: '700' },
  scoreBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF5F5', borderWidth: 1, borderColor: '#800020', borderStyle: 'dotted', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  scoreText: { color: '#800020', fontSize: 11, fontWeight: '800' },
  teamName: { fontSize: 24, fontFamily: 'serif', fontWeight: '900', color: '#800020', letterSpacing: -0.5 },
  memberStats: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  memberStatsText: { color: '#767676', fontSize: 12, fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#E0E0E0', marginVertical: 14, borderStyle: 'dotted' },
  spotLabel: { color: '#2C2C2C', fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  spotRole: { color: '#2C2C2C', fontSize: 15, fontFamily: 'serif', fontWeight: '800', marginTop: 2 },
  skillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10, marginBottom: 16 },
  skillChip: { backgroundColor: '#F9F6F0', borderWidth: 1, borderColor: '#E0E0E0', borderStyle: 'dotted', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
  skillChipText: { color: '#767676', fontSize: 11, fontWeight: '500' },
  requestBtn: { borderRadius: 12, overflow: 'hidden', backgroundColor: '#800020', shadowColor: '#800020', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 4 },
  requestGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 44 },
  requestGradPending: { backgroundColor: '#767676' },
  requestBtnText: { color: '#FFFFFF', fontFamily: 'serif', fontWeight: '700', fontSize: 13 },
});
