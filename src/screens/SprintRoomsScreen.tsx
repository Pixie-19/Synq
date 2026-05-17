import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Zap, Users, Clock, BookOpen } from 'lucide-react-native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useApp } from '../context/AppContext';
import { GlassCard } from '../components/GlassCard';

type Props = any;

const OPEN_ROOMS = [
  { id: 'r1', name: 'Zero-Waste Campus Catering', participants: 1, maxParticipants: 2, timeLeft: '7:34', track: 'Social Impact', glowColor: '#39FF14' },
  { id: 'r2', name: 'AI Hostel Laundry Platform', participants: 1, maxParticipants: 2, timeLeft: '4:12', track: 'EdTech / Campus', glowColor: '#00F0FF' },
  { id: 'r3', name: 'Team Red-Flag Detector',     participants: 0, maxParticipants: 2, timeLeft: 'NEW', track: 'HR Tech',         glowColor: '#8A2BE2' },
];

export const SprintRoomsScreen: React.FC<Props> = ({ navigation }) => {
  const { startSprint, setActiveMatch, profiles } = useApp();

  const handleJoin = () => {
    setActiveMatch(profiles[0]);
    startSprint();
    navigation.navigate('SprintRoom');
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#06050C', '#0C0A1A', '#06050C']} style={StyleSheet.absoluteFillObject} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Sprint Rooms</Text>
        <Text style={styles.headerSub}>Join an open 10-minute collaboration challenge</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Start fresh */}
        <TouchableOpacity style={styles.newRoomBtn} onPress={handleJoin}>
          <LinearGradient colors={['#8A2BE2','#00F0FF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.newRoomGrad}>
            <Zap color="#FFF" size={20} style={{ marginRight: 8 }} />
            <Text style={styles.newRoomText}>Start New Sprint Room</Text>
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Open Rooms</Text>

        {OPEN_ROOMS.map(room => (
          <GlassCard key={room.id} style={styles.roomCard} borderColor={room.glowColor + '44'}>
            <View style={styles.roomTop}>
              <View>
                <View style={[styles.trackChip, { borderColor: room.glowColor + '55' }]}>
                  <Text style={[styles.trackText, { color: room.glowColor }]}>{room.track}</Text>
                </View>
                <Text style={styles.roomName}>{room.name}</Text>
              </View>
              <View style={[styles.timeBadge, { backgroundColor: room.glowColor + '15', borderColor: room.glowColor }]}>
                <Clock color={room.glowColor} size={12} style={{ marginRight: 4 }} />
                <Text style={[styles.timeText, { color: room.glowColor }]}>{room.timeLeft}</Text>
              </View>
            </View>

            <View style={styles.roomMeta}>
              <Users color="#636275" size={14} style={{ marginRight: 6 }} />
              <Text style={styles.roomMetaText}>{room.participants}/{room.maxParticipants} participants</Text>
              <View style={styles.dotSep} />
              <BookOpen color="#636275" size={14} style={{ marginRight: 6 }} />
              <Text style={styles.roomMetaText}>AI challenge ready</Text>
            </View>

            <TouchableOpacity style={styles.joinBtn} onPress={handleJoin}>
              <Text style={[styles.joinText, { color: room.glowColor }]}>Join Room →</Text>
            </TouchableOpacity>
          </GlassCard>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#06050C', paddingTop: Platform.OS === 'ios' ? 50 : 20 },
  header: { paddingHorizontal: 20, paddingVertical: 16 },
  headerTitle: { color: '#FFF', fontSize: 28, fontWeight: '900', letterSpacing: -0.5 },
  headerSub: { color: '#636275', fontSize: 13, fontWeight: '600', marginTop: 2 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  newRoomBtn: { borderRadius: 16, overflow: 'hidden', marginBottom: 28 },
  newRoomGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18 },
  newRoomText: { color: '#FFF', fontWeight: '800', fontSize: 15 },
  sectionTitle: { color: '#8E8D9C', fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 },
  roomCard: { padding: 18, marginBottom: 16 },
  roomTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  trackChip: { borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginBottom: 6, alignSelf: 'flex-start' },
  trackText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  roomName: { color: '#FFF', fontSize: 16, fontWeight: '800', maxWidth: 200 },
  timeBadge: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  timeText: { fontSize: 13, fontWeight: '800', fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace' },
  roomMeta: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  roomMetaText: { color: '#636275', fontSize: 12, fontWeight: '500' },
  dotSep: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#3D3C52', marginHorizontal: 10 },
  joinBtn: { alignSelf: 'flex-start', paddingVertical: 8, paddingHorizontal: 14, backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', borderRadius: 10 },
  joinText: { fontSize: 13, fontWeight: '700' },
});
