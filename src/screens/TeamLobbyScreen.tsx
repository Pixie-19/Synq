import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Award, Clock, CheckSquare, MessageSquare, Phone, RotateCcw } from 'lucide-react-native';
import type { StackScreenProps } from '@react-navigation/stack';
import { useApp } from '../context/AppContext';

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

      <View style={styles.topStatus}>
        <View style={styles.statusBanner}>
          <Award color="#FFFFFF" size={16} style={{ marginRight: 6 }} />
          <Text style={styles.statusText}>SQUAD READY FOR DEPLOYMENT</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.teamHeader}>
          <Text style={styles.teamName}>{teamLobbyData.teamName}</Text>
          <Text style={styles.teamVibe}>{teamLobbyData.vibe}</Text>
        </View>

        <View style={styles.clockCard}>
          <Text style={styles.clockLabel}>SUBMISSION DEADLINE COUNTDOWN</Text>
          <View style={styles.clockTimeRow}>
            <Clock color="#800020" size={24} style={{ marginRight: 10 }} />
            <Text style={styles.clockTimeText}>
              {String(countdown.hours).padStart(2,'0')}h {String(countdown.mins).padStart(2,'0')}m {String(countdown.secs).padStart(2,'0')}s
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>The Squad</Text>
        <View style={styles.squadGrid}>
          <View style={styles.memberCard}>
            <View style={styles.memberAvatarWrap}>
              <Image source={{ uri: userAvatar }} style={styles.memberAvatar} />
              <View style={styles.activeDot} />
            </View>
            <Text style={styles.memberName}>You</Text>
            <Text style={styles.memberRole}>Builder</Text>
          </View>
          <View style={styles.memberCard}>
            <View style={styles.memberAvatarWrap}>
              <Image source={{ uri: activeMatch.avatar }} style={styles.memberAvatar} />
              <View style={styles.activeDot} />
            </View>
            <Text style={styles.memberName}>{activeMatch.name.split(' ')[0]}</Text>
            <Text style={styles.memberRole}>{activeMatch.role.split(' ')[0]}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Shared Roadmap</Text>
        <View style={styles.roadmapCard}>
          {[
            { done: true,  text: 'Complete Synq personality analysis' },
            { done: true,  text: 'Pass 10-Minute Compatibility Sprint' },
            { done: false, text: 'Brainstorm architectural specifications' },
            { done: false, text: 'Set up GitHub repo and push initial commit' },
          ].map((item, i) => (
            <View key={i} style={styles.milestoneRow}>
              <CheckSquare color={item.done ? '#800020' : '#767676'} size={16} style={{ marginRight: 10 }} />
              <Text style={[styles.milestoneText, item.done && styles.milestoneDone]}>{item.text}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.resetBtn} onPress={() => { resetApp(); }}>
          <RotateCcw color="#800020" size={16} style={{ marginRight: 6 }} />
          <Text style={styles.resetText}>Restart Demo Flow</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.dock}>
        <TouchableOpacity style={styles.dockBtn}>
          <MessageSquare color="#800020" size={20} />
          <Text style={styles.dockText}>Squad Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.dockBtn}>
          <Phone color="#800020" size={20} />
          <Text style={styles.dockText}>Voice Call</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F6F0', paddingTop: Platform.OS === 'ios' ? 50 : 20 },
  topStatus: { marginHorizontal: 20, marginTop: 10, borderRadius: 12, overflow: 'hidden' },
  statusBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, paddingHorizontal: 16, backgroundColor: '#800020' },
  statusText: { color: '#FFFFFF', fontSize: 11, fontWeight: '900', letterSpacing: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 110 },
  teamHeader: { alignItems: 'center', marginVertical: 24 },
  teamName: { fontSize: 36, fontFamily: 'serif', fontWeight: '900', color: '#800020', letterSpacing: -1, textAlign: 'center' },
  teamVibe: { fontSize: 14, color: '#767676', fontWeight: '600', marginTop: 6, fontStyle: 'italic' },
  clockCard: { padding: 20, alignItems: 'center', marginBottom: 28, backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E0E0E0', borderStyle: 'dotted', shadowColor: '#800020', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.05, shadowRadius: 20, elevation: 5 },
  clockLabel: { color: '#767676', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  clockTimeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  clockTimeText: { color: '#800020', fontSize: 24, fontWeight: '900', letterSpacing: 0.5, fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace' },
  sectionTitle: { color: '#2C2C2C', fontSize: 16, fontFamily: 'serif', fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 14 },
  squadGrid: { flexDirection: 'row', gap: 12, marginBottom: 28 },
  memberCard: { flex: 1, padding: 16, alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#800020', borderStyle: 'dotted' },
  memberAvatarWrap: { width: 64, height: 64, borderRadius: 32, borderWidth: 2, borderColor: '#E0E0E0', borderStyle: 'solid', padding: 2, position: 'relative', marginBottom: 10, overflow: 'hidden', backgroundColor: '#FFFFFF' },
  memberAvatar: { width: '100%', height: '100%', borderRadius: 30 },
  activeDot: { position: 'absolute', bottom: 0, right: 0, width: 14, height: 14, borderRadius: 7, backgroundColor: '#800020', borderWidth: 2, borderColor: '#FFFFFF' },
  memberName: { color: '#2C2C2C', fontSize: 15, fontFamily: 'serif', fontWeight: '800' },
  memberRole: { color: '#767676', fontSize: 12, fontWeight: '600', marginTop: 2 },
  roadmapCard: { padding: 16, marginBottom: 28, backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E0E0E0', borderStyle: 'dotted' },
  milestoneRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  milestoneText: { color: '#2C2C2C', fontSize: 13, fontWeight: '600', flex: 1 },
  milestoneDone: { textDecorationLine: 'line-through', opacity: 0.5, color: '#767676' },
  resetBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#800020', borderStyle: 'dotted', borderRadius: 14, marginBottom: 20 },
  resetText: { color: '#800020', fontSize: 13, fontWeight: '700' },
  dock: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, backgroundColor: '#F9F6F0', borderTopWidth: 1, borderTopColor: '#E0E0E0', borderStyle: 'dotted', flexDirection: 'row', paddingHorizontal: 20, alignItems: 'center', justifyContent: 'space-between', paddingBottom: Platform.OS === 'ios' ? 14 : 0 },
  dockBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E0E0E0', borderStyle: 'dotted', borderRadius: 14, paddingVertical: 12, width: '48%', gap: 8 },
  dockText: { color: '#2C2C2C', fontWeight: '700', fontSize: 13 },
});
