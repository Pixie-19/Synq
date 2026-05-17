import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, Image, Animated, TextInput, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Mic, MicOff, Send, Clock, BookOpen, PhoneOff, Award, Sparkles } from 'lucide-react-native';
import type { StackScreenProps } from '@react-navigation/stack';
import { useApp } from '../context/AppContext';
import { GlassCard } from '../components/GlassCard';

type Props = StackScreenProps<any, 'SprintRoom'>;

export const SprintScreen: React.FC<Props> = ({ navigation }) => {
  const { activeMatch, sprintTimer, endSprint, currentSprintChallenge, sprintChatNotes, sendSprintChatNote, voiceMuted, setVoiceMuted, isTeammateSpeaking } = useApp();
  const [inputVal, setInputVal] = useState('');
  const pulseAnim  = useRef(new Animated.Value(1)).current;
  const scrollRef  = useRef<ScrollView | null>(null);

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2,'0')}:${String(s % 60).padStart(2,'0')}`;

  useEffect(() => {
    if (isTeammateSpeaking) {
      Animated.loop(Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.25, duration: 500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1.0,  duration: 500, useNativeDriver: true }),
      ])).start();
    } else { pulseAnim.setValue(1); }
  }, [isTeammateSpeaking, pulseAnim]);

  useEffect(() => { setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100); }, [sprintChatNotes]);

  const handlePostNote = () => {
    if (!inputVal.trim()) return;
    sendSprintChatNote(inputVal);
    setInputVal('');
  };

  const handleEnd = () => {
    endSprint();
    navigation.navigate('DynamicAnalysis');
  };

  if (!activeMatch || !currentSprintChallenge) return null;
  const userAvatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80';

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#06050C', '#0E0922', '#06050C']} style={StyleSheet.absoluteFillObject} />

      <View style={styles.header}>
        <View style={styles.roomStatus}>
          <View style={styles.liveDot} />
          <Text style={styles.roomTitle}>LIVE COMPATIBILITY SPRINT</Text>
        </View>
        <View style={styles.timerBadge}>
          <Clock color="#00F0FF" size={16} style={{ marginRight: 6 }} />
          <Text style={styles.timerText}>{formatTime(sprintTimer)}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Voice panel */}
        <View style={styles.voicePanel}>
          <View style={styles.voiceUser}>
            <View style={[styles.avatarOutline, voiceMuted && styles.mutedOutline]}>
              <Image source={{ uri: userAvatar }} style={styles.avatarImg} />
            </View>
            <Text style={styles.avatarName}>You {voiceMuted ? '(Muted)' : '(Mic On)'}</Text>
          </View>
          <View style={styles.vsLine}><Text style={styles.vsText}>×</Text></View>
          <View style={styles.voiceUser}>
            <Animated.View style={[styles.pulseRing, { opacity: isTeammateSpeaking ? 0.6 : 0, transform: [{ scale: pulseAnim }], backgroundColor: activeMatch.archetype.glowColor }]} />
            <View style={[styles.avatarOutline, { borderColor: isTeammateSpeaking ? activeMatch.archetype.glowColor : 'rgba(255,255,255,0.08)' }]}>
              <Image source={{ uri: activeMatch.avatar }} style={styles.avatarImg} />
            </View>
            <Text style={styles.avatarName}>{activeMatch.name.split(' ')[0]} {isTeammateSpeaking ? '(Speaking)' : '(Listening)'}</Text>
          </View>
        </View>

        {/* Sprint challenge */}
        <GlassCard style={styles.challengeCard} borderColor="rgba(0,240,255,0.15)">
          <View style={styles.challengeHeader}>
            <BookOpen color="#00F0FF" size={18} style={{ marginRight: 8 }} />
            <Text style={styles.challengeHeaderTitle}>AI SPRINT CHALLENGE</Text>
          </View>
          <Text style={styles.challengeTitle}>{currentSprintChallenge.title}</Text>
          <Text style={styles.challengeDesc}>{currentSprintChallenge.problem}</Text>
          <View style={styles.innerDivider} />
          <Text style={styles.secTitle}>MVP Features to Discuss:</Text>
          {currentSprintChallenge.mvpPoints.map((pt, i) => (
            <View key={i} style={styles.pointRow}>
              <Text style={styles.bullet}>✦</Text>
              <Text style={styles.pointText}>{pt}</Text>
            </View>
          ))}
        </GlassCard>

        {/* Notes whiteboard */}
        <Text style={styles.sectionTitle}>Shared Ideation Workspace</Text>
        <GlassCard style={styles.notesPanel}>
          <ScrollView ref={scrollRef} style={{ maxHeight: 180 }} contentContainerStyle={{ padding: 12 }} nestedScrollEnabled>
            {sprintChatNotes.map(note => note.isSystem ? (
              <View key={note.id} style={styles.sysNote}><Text style={styles.sysNoteText}>{note.text}</Text></View>
            ) : (
              <View key={note.id} style={[styles.noteRow, note.senderId === 'me' ? styles.noteMe : styles.noteThem]}>
                <Text style={styles.noteAuthor}>{note.senderId === 'me' ? 'You' : activeMatch.name.split(' ')[0]}:</Text>
                <Text style={styles.noteText}>{note.text}</Text>
              </View>
            ))}
          </ScrollView>
          <View style={styles.notePostWrapper}>
            <TextInput placeholder="Post a concept..." placeholderTextColor="#636275" style={styles.noteInput} value={inputVal} onChangeText={setInputVal} onSubmitEditing={handlePostNote} />
            <TouchableOpacity style={styles.postBtn} onPress={handlePostNote}><Send color="#00F0FF" size={16} /></TouchableOpacity>
          </View>
        </GlassCard>
      </ScrollView>

      {/* Controls */}
      <View style={styles.controlsFooter}>
        <TouchableOpacity style={[styles.actionRound, voiceMuted && styles.actionRoundMuted]} onPress={() => setVoiceMuted(!voiceMuted)}>
          {voiceMuted ? <MicOff color="#FFF" size={20} /> : <Mic color="#FFF" size={20} />}
        </TouchableOpacity>
        <TouchableOpacity style={styles.finishSprintBtn} onPress={handleEnd}>
          <LinearGradient colors={['#FF4500','#FF0055']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.finishSprintGrad}>
            <Award color="#FFF" size={18} style={{ marginRight: 6 }} />
            <Text style={styles.finishSprintText}>Finish Sprint →</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionRound, styles.actionRoundLeave]} onPress={handleEnd}>
          <PhoneOff color="#FFF" size={20} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#06050C', paddingTop: Platform.OS === 'ios' ? 50 : 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  roomStatus: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF0055' },
  roomTitle: { color: '#FFF', fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  timerBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,240,255,0.06)', borderWidth: 1, borderColor: 'rgba(0,240,255,0.15)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  timerText: { color: '#00F0FF', fontSize: 13, fontWeight: '800', fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 110 },
  voicePanel: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 24, height: 120 },
  voiceUser: { alignItems: 'center', width: 110, position: 'relative' },
  pulseRing: { position: 'absolute', width: 88, height: 88, borderRadius: 44, top: 0 },
  avatarOutline: { width: 80, height: 80, borderRadius: 40, borderWidth: 2, borderColor: 'rgba(255,255,255,0.08)', padding: 3, backgroundColor: '#06050C', overflow: 'hidden' },
  mutedOutline: { borderColor: '#FF0055' },
  avatarImg: { width: '100%', height: '100%', borderRadius: 40 },
  avatarName: { color: '#8E8D9C', fontSize: 10, fontWeight: '700', marginTop: 10, textAlign: 'center' },
  vsLine: { width: 40, alignItems: 'center' },
  vsText: { color: '#636275', fontSize: 16, fontWeight: '700' },
  challengeCard: { padding: 20, marginBottom: 24 },
  challengeHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  challengeHeaderTitle: { color: '#00F0FF', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  challengeTitle: { fontSize: 22, fontWeight: '900', color: '#FFF', letterSpacing: -0.5, marginBottom: 6 },
  challengeDesc: { fontSize: 12, color: '#8E8D9C', lineHeight: 18, fontWeight: '500' },
  innerDivider: { width: '100%', height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginVertical: 14 },
  secTitle: { color: '#FFF', fontSize: 13, fontWeight: '800', marginBottom: 8 },
  pointRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 },
  bullet: { color: '#00F0FF', fontSize: 12, marginRight: 8, marginTop: 1 },
  pointText: { color: '#8E8D9C', fontSize: 12, lineHeight: 16, fontWeight: '500', flex: 1 },
  sectionTitle: { color: '#FFF', fontSize: 14, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 },
  notesPanel: { padding: 0, overflow: 'hidden' },
  sysNote: { backgroundColor: 'rgba(0,240,255,0.04)', borderWidth: 1, borderColor: 'rgba(0,240,255,0.06)', borderRadius: 8, padding: 8, marginBottom: 8 },
  sysNoteText: { color: '#00F0FF', fontSize: 10, fontWeight: '700', textAlign: 'center' },
  noteRow: { flexDirection: 'row', marginBottom: 8, backgroundColor: 'rgba(255,255,255,0.02)', padding: 8, borderRadius: 8 },
  noteMe:   { borderLeftWidth: 3, borderLeftColor: '#8A2BE2' },
  noteThem: { borderLeftWidth: 3, borderLeftColor: '#00F0FF' },
  noteAuthor: { fontWeight: '800', fontSize: 11, color: '#FFF', marginRight: 6 },
  noteText: { flex: 1, color: '#8E8D9C', fontSize: 12, fontWeight: '500' },
  notePostWrapper: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', padding: 8 },
  noteInput: { flex: 1, color: '#FFF', fontSize: 12, fontWeight: '500', paddingHorizontal: 12, height: 38 },
  postBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(0,240,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  controlsFooter: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 90, backgroundColor: '#06050C', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingBottom: Platform.OS === 'ios' ? 14 : 0 },
  actionRound: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#1E1B2C', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  actionRoundMuted: { backgroundColor: '#FF0055', borderColor: '#FF0055' },
  actionRoundLeave: { backgroundColor: '#FF0055', borderColor: '#FF0055' },
  finishSprintBtn: { flex: 1, marginHorizontal: 16, borderRadius: 100, overflow: 'hidden' },
  finishSprintGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 48 },
  finishSprintText: { color: '#FFF', fontWeight: '800', fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5 },
});
