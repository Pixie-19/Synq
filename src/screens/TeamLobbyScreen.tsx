import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Award, Clock, CheckSquare, MessageSquare, Phone, RotateCcw } from 'lucide-react-native';
import type { StackScreenProps } from '@react-navigation/stack';
import { useApp } from '../context/AppContext';
import { GlassCard } from '../components/GlassCard';

type Props = StackScreenProps<any, 'TeamLobby'>;

export const TeamLobbyScreen: React.FC<Props> = ({ navigation }) => {
  const { teamLobbyData, activeMatch, resetApp } = useApp();
  const [countdown, setCountdown] = useState({ hours: 23, mins: 59, secs: 59 });

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev.secs > 0) return { ...prev, secs: prev.secs - 1 };
        if (prev.mins > 0) return { hours: prev.hours, mins: prev.mins - 1, secs: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, mins: 59, secs: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!teamLobbyData || !activeMatch) return null;
  const userAvatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80';

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0C0A1A','#06050C','#0E0920']} style={StyleSheet.absoluteFillObject} />

      <View style={styles.topStatus}>
        <LinearGradient colors={['#39FF14','#00F0FF']} start={{ x:0,y:0 }} end={{ x:1,y:0 }} style={styles.statusGrad}>
          <Award color="#000" size={16} style={{ marginRight: 6 }} />
          <Text style={styles.statusText}>SQUAD READY FOR DEPLOYMENT ⚡</Text>
        </LinearGradient>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.teamHeader}>
          <Text style={styles.teamName}>{teamLobbyData.teamName}</Text>
          <Text style={styles.teamVibe}>🔮 {teamLobbyData.vibe}</Text>
        </View>

        <GlassCard style={styles.clockCard} borderColor="rgba(0,240,255,0.2)">
          <Text style={styles.clockLabel}>SUBMISSION DEADLINE COUNTDOWN</Text>
          <View style={styles.clockTimeRow}>
            <Clock color="#00F0FF" size={24} style={{ marginRight: 10 }} />
            <Text style={styles.clockTimeText}>
              {String(countdown.hours).padStart(2,'0')}h {String(countdown.mins).padStart(2,'0')}m {String(countdown.secs).padStart(2,'0')}s
            </Text>
          </View>
        </GlassCard>

        <Text style={styles.sectionTitle}>The Squad</Text>
        <View style={styles.squadGrid}>
          <GlassCard style={styles.memberCard}>
            <View style={styles.memberAvatarWrap}>
              <Image source={{ uri: userAvatar }} style={styles.memberAvatar} />
              <View style={styles.activeDot} />
            </View>
            <Text style={styles.memberName}>You</Text>
            <Text style={styles.memberRole}>Builder</Text>
          </GlassCard>
          <GlassCard style={[styles.memberCard, { borderColor: activeMatch.archetype.glowColor }]}>
            <View style={[styles.memberAvatarWrap, { borderColor: activeMatch.archetype.glowColor }]}>
              <Image source={{ uri: activeMatch.avatar }} style={styles.memberAvatar} />
              <View style={[styles.activeDot, { backgroundColor: activeMatch.archetype.glowColor }]} />
            </View>
            <Text style={styles.memberName}>{activeMatch.name.split(' ')[0]}</Text>
            <Text style={[styles.memberRole, { color: activeMatch.archetype.glowColor }]}>{activeMatch.role.split(' ')[0]}</Text>
          </GlassCard>
        </View>

        <Text style={styles.sectionTitle}>Shared Roadmap</Text>
        <GlassCard style={styles.roadmapCard}>
          {[
            { done: true,  text: 'Complete Synq personality analysis' },
            { done: true,  text: 'Pass 10-Minute Compatibility Sprint' },
            { done: false, text: 'Brainstorm architectural specifications' },
            { done: false, text: 'Set up GitHub repo and push initial commit' },
          ].map((item, i) => (
            <View key={i} style={styles.milestoneRow}>
              <CheckSquare color={item.done ? '#00F0FF' : '#636275'} size={16} style={{ marginRight: 10 }} />
              <Text style={[styles.milestoneText, item.done && styles.milestoneDone]}>{item.text}</Text>
            </View>
          ))}
        </GlassCard>

        <TouchableOpacity style={styles.resetBtn} onPress={() => { resetApp(); }}>
          <RotateCcw color="#636275" size={16} style={{ marginRight: 6 }} />
          <Text style={styles.resetText}>Restart Demo Flow</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.dock}>
        <TouchableOpacity style={styles.dockBtn}>
          <MessageSquare color="#00F0FF" size={20} />
          <Text style={styles.dockText}>Squad Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.dockBtn}>
          <Phone color="#00F0FF" size={20} />
          <Text style={styles.dockText}>Voice Call</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#06050C', paddingTop: Platform.OS === 'ios' ? 50 : 20 },
  topStatus: { marginHorizontal: 20, marginTop: 10, borderRadius: 12, overflow: 'hidden' },
  statusGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, paddingHorizontal: 16 },
  statusText: { color: '#000', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 110 },
  teamHeader: { alignItems: 'center', marginVertical: 24 },
  teamName: { fontSize: 32, fontWeight: '900', color: '#FFF', letterSpacing: -1, textAlign: 'center' },
  teamVibe: { fontSize: 13, color: '#8E8D9C', fontWeight: '600', marginTop: 6 },
  clockCard: { padding: 20, alignItems: 'center', marginBottom: 28 },
  clockLabel: { color: '#636275', fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  clockTimeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  clockTimeText: { color: '#00F0FF', fontSize: 22, fontWeight: '900', letterSpacing: 0.5, fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace' },
  sectionTitle: { color: '#FFF', fontSize: 14, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 14 },
  squadGrid: { flexDirection: 'row', gap: 12, marginBottom: 28 },
  memberCard: { flex: 1, padding: 16, alignItems: 'center', borderColor: '#8A2BE2' },
  memberAvatarWrap: { width: 60, height: 60, borderRadius: 30, borderWidth: 2, borderColor: '#8A2BE2', padding: 2, position: 'relative', marginBottom: 10, overflow: 'hidden' },
  memberAvatar: { width: '100%', height: '100%', borderRadius: 30 },
  activeDot: { position: 'absolute', bottom: 0, right: 0, width: 14, height: 14, borderRadius: 7, backgroundColor: '#39FF14', borderWidth: 2, borderColor: '#0C0A1A' },
  memberName: { color: '#FFF', fontSize: 14, fontWeight: '800' },
  memberRole: { color: '#00F0FF', fontSize: 11, fontWeight: '600', marginTop: 2 },
  roadmapCard: { padding: 16, marginBottom: 28 },
  milestoneRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  milestoneText: { color: '#8E8D9C', fontSize: 12, fontWeight: '600', flex: 1 },
  milestoneDone: { textDecorationLine: 'line-through', opacity: 0.5 },
  resetBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, backgroundColor: 'rgba(255,255,255,0.02)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', borderRadius: 14, marginBottom: 20 },
  resetText: { color: '#8E8D9C', fontSize: 13, fontWeight: '700' },
  dock: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, backgroundColor: '#06050C', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', flexDirection: 'row', paddingHorizontal: 20, alignItems: 'center', justifyContent: 'space-between', paddingBottom: Platform.OS === 'ios' ? 14 : 0 },
  dockBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', borderRadius: 14, paddingVertical: 12, width: '48%', gap: 8 },
  dockText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
});
