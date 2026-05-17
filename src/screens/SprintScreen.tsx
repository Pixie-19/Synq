import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, Image, Animated, TextInput, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Mic, MicOff, Send, Clock, BookOpen, PhoneOff, Award, Sparkles } from 'lucide-react-native';
import type { StackScreenProps } from '@react-navigation/stack';
import { useApp } from '../context/AppContext';

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

      <View style={styles.header}>
        <View style={styles.roomStatus}>
          <View style={styles.liveDot} />
          <Text style={styles.roomTitle}>LIVE COMPATIBILITY SPRINT</Text>
        </View>
        <View style={styles.timerBadge}>
          <Clock color="#800020" size={16} style={{ marginRight: 6 }} />
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
            <Animated.View style={[styles.pulseRing, { opacity: isTeammateSpeaking ? 0.3 : 0, transform: [{ scale: pulseAnim }], backgroundColor: '#800020' }]} />
            <View style={[styles.avatarOutline, { borderColor: isTeammateSpeaking ? '#800020' : '#E0E0E0' }]}>
              <Image source={{ uri: activeMatch.avatar }} style={styles.avatarImg} />
            </View>
            <Text style={styles.avatarName}>{activeMatch.name.split(' ')[0]} {isTeammateSpeaking ? '(Speaking)' : '(Listening)'}</Text>
          </View>
        </View>

        {/* Sprint challenge */}
        <View style={styles.challengeCard}>
          <View style={styles.challengeHeader}>
            <BookOpen color="#800020" size={18} style={{ marginRight: 8 }} />
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
        </View>

        {/* Notes whiteboard */}
        <Text style={styles.sectionTitle}>Shared Ideation Workspace</Text>
        <View style={styles.notesPanel}>
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
            <TextInput placeholder="Post a concept..." placeholderTextColor="#767676" style={styles.noteInput} value={inputVal} onChangeText={setInputVal} onSubmitEditing={handlePostNote} />
            <TouchableOpacity style={styles.postBtn} onPress={handlePostNote}><Send color="#800020" size={16} /></TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Controls */}
      <View style={styles.controlsFooter}>
        <TouchableOpacity style={[styles.actionRound, voiceMuted && styles.actionRoundMuted]} onPress={() => setVoiceMuted(!voiceMuted)}>
          {voiceMuted ? <MicOff color="#D03B5B" size={20} /> : <Mic color="#800020" size={20} />}
        </TouchableOpacity>
        <TouchableOpacity style={styles.finishSprintBtn} onPress={handleEnd}>
          <View style={styles.finishSprintGrad}>
            <Award color="#FFFFFF" size={18} style={{ marginRight: 6 }} />
            <Text style={styles.finishSprintText}>Finish Sprint →</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionRound, styles.actionRoundLeave]} onPress={handleEnd}>
          <PhoneOff color="#D03B5B" size={20} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F6F0', paddingTop: Platform.OS === 'ios' ? 50 : 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E0E0E0', borderStyle: 'dotted' },
  roomStatus: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#D03B5B' },
  roomTitle: { color: '#800020', fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  timerBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#800020', borderStyle: 'dotted', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  timerText: { color: '#800020', fontSize: 13, fontWeight: '800', fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 110 },
  voicePanel: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 24, height: 120 },
  voiceUser: { alignItems: 'center', width: 110, position: 'relative' },
  pulseRing: { position: 'absolute', width: 88, height: 88, borderRadius: 44, top: 0 },
  avatarOutline: { width: 80, height: 80, borderRadius: 40, borderWidth: 2, borderColor: '#E0E0E0', borderStyle: 'dotted', padding: 3, backgroundColor: '#FFFFFF', overflow: 'hidden' },
  mutedOutline: { borderColor: '#D03B5B', borderStyle: 'solid' },
  avatarImg: { width: '100%', height: '100%', borderRadius: 40 },
  avatarName: { color: '#767676', fontSize: 10, fontWeight: '700', marginTop: 10, textAlign: 'center', fontStyle: 'italic' },
  vsLine: { width: 40, alignItems: 'center' },
  vsText: { color: '#2C2C2C', fontSize: 16, fontWeight: '700', fontFamily: 'serif' },
  challengeCard: { padding: 20, marginBottom: 24, backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E0E0E0', borderStyle: 'dotted', shadowColor: '#800020', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.05, shadowRadius: 20, elevation: 5 },
  challengeHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  challengeHeaderTitle: { color: '#800020', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  challengeTitle: { fontSize: 26, fontFamily: 'serif', fontWeight: '900', color: '#800020', letterSpacing: -0.5, marginBottom: 6 },
  challengeDesc: { fontSize: 13, color: '#767676', lineHeight: 20, fontWeight: '500' },
  innerDivider: { width: '100%', height: 1, borderWidth: 1, borderColor: '#E0E0E0', borderStyle: 'dotted', backgroundColor: 'transparent', marginVertical: 14 },
  secTitle: { color: '#2C2C2C', fontSize: 13, fontWeight: '800', marginBottom: 8 },
  pointRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 },
  bullet: { color: '#800020', fontSize: 12, marginRight: 8, marginTop: 1 },
  pointText: { color: '#767676', fontSize: 12, lineHeight: 18, fontWeight: '500', flex: 1 },
  sectionTitle: { color: '#2C2C2C', fontSize: 14, fontFamily: 'serif', fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 },
  notesPanel: { padding: 0, overflow: 'hidden', backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E0E0E0', borderStyle: 'dotted' },
  sysNote: { backgroundColor: '#F9F6F0', borderWidth: 1, borderColor: '#E0E0E0', borderStyle: 'dotted', borderRadius: 8, padding: 8, marginBottom: 8 },
  sysNoteText: { color: '#800020', fontSize: 10, fontWeight: '700', textAlign: 'center', fontStyle: 'italic' },
  noteRow: { flexDirection: 'row', marginBottom: 8, backgroundColor: '#FFFFFF', padding: 8, borderRadius: 8, borderWidth: 1, borderColor: '#E0E0E0', borderStyle: 'dotted' },
  noteMe:   { borderLeftWidth: 3, borderLeftColor: '#800020', borderLeftStyle: 'solid' },
  noteThem: { borderLeftWidth: 3, borderLeftColor: '#2C2C2C', borderLeftStyle: 'solid' },
  noteAuthor: { fontWeight: '800', fontSize: 11, color: '#2C2C2C', marginRight: 6 },
  noteText: { flex: 1, color: '#767676', fontSize: 12, fontWeight: '500' },
  notePostWrapper: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#E0E0E0', borderStyle: 'dotted', padding: 8, backgroundColor: '#F9F6F0' },
  noteInput: { flex: 1, color: '#2C2C2C', fontSize: 13, fontWeight: '500', paddingHorizontal: 12, height: 38 },
  postBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E0E0E0', borderStyle: 'dotted', alignItems: 'center', justifyContent: 'center' },
  controlsFooter: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 90, backgroundColor: '#F9F6F0', borderTopWidth: 1, borderTopColor: '#E0E0E0', borderStyle: 'dotted', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingBottom: Platform.OS === 'ios' ? 14 : 0 },
  actionRound: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E0E0E0', borderStyle: 'dotted' },
  actionRoundMuted: { borderColor: '#D03B5B', backgroundColor: '#FFF5F5', borderStyle: 'solid' },
  actionRoundLeave: { borderColor: '#D03B5B', backgroundColor: '#FFF5F5' },
  finishSprintBtn: { flex: 1, marginHorizontal: 16, borderRadius: 100, overflow: 'hidden', backgroundColor: '#800020', shadowColor: '#800020', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 16, elevation: 8 },
  finishSprintGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 48 },
  finishSprintText: { color: '#FFFFFF', fontWeight: '800', fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5, fontFamily: 'serif' },
});
