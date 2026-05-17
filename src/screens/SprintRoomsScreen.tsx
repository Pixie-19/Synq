import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Zap, Users, Clock, BookOpen } from 'lucide-react-native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useApp } from '../context/AppContext';

type Props = any;

const OPEN_ROOMS = [
  { id: 'r1', name: 'Zero-Waste Campus Catering', participants: 1, maxParticipants: 2, timeLeft: '7:34', track: 'Social Impact' },
  { id: 'r2', name: 'AI Hostel Laundry Platform', participants: 1, maxParticipants: 2, timeLeft: '4:12', track: 'EdTech / Campus' },
  { id: 'r3', name: 'Team Red-Flag Detector',     participants: 0, maxParticipants: 2, timeLeft: 'NEW', track: 'HR Tech' },
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

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Sprint Rooms</Text>
        <Text style={styles.headerSub}>Join an open 10-minute collaboration challenge</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Start fresh */}
        <TouchableOpacity style={styles.newRoomBtn} onPress={handleJoin}>
          <View style={styles.newRoomGrad}>
            <Zap color="#FFFFFF" size={20} style={{ marginRight: 8 }} />
            <Text style={styles.newRoomText}>Start New Sprint Room</Text>
          </View>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Open Rooms</Text>

        {OPEN_ROOMS.map(room => (
          <View key={room.id} style={styles.roomCard}>
            <View style={styles.roomTop}>
              <View>
                <View style={styles.trackChip}>
                  <Text style={styles.trackText}>{room.track}</Text>
                </View>
                <Text style={styles.roomName}>{room.name}</Text>
              </View>
              <View style={styles.timeBadge}>
                <Clock color="#800020" size={12} style={{ marginRight: 4 }} />
                <Text style={styles.timeText}>{room.timeLeft}</Text>
              </View>
            </View>

            <View style={styles.roomMeta}>
              <Users color="#767676" size={14} style={{ marginRight: 6 }} />
              <Text style={styles.roomMetaText}>{room.participants}/{room.maxParticipants} participants</Text>
              <View style={styles.dotSep} />
              <BookOpen color="#767676" size={14} style={{ marginRight: 6 }} />
              <Text style={styles.roomMetaText}>AI challenge ready</Text>
            </View>

            <TouchableOpacity style={styles.joinBtn} onPress={handleJoin}>
              <Text style={styles.joinText}>Join Room →</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F6F0', paddingTop: Platform.OS === 'ios' ? 50 : 20 },
  header: { paddingHorizontal: 20, paddingVertical: 16 },
  headerTitle: { color: '#800020', fontSize: 32, fontFamily: 'serif', fontWeight: '900', letterSpacing: -0.5 },
  headerSub: { color: '#767676', fontSize: 13, fontWeight: '600', marginTop: 2, fontStyle: 'italic' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  newRoomBtn: { borderRadius: 16, overflow: 'hidden', marginBottom: 28, backgroundColor: '#800020', shadowColor: '#800020', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 16, elevation: 8 },
  newRoomGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18 },
  newRoomText: { color: '#FFFFFF', fontFamily: 'serif', fontWeight: '800', fontSize: 16 },
  sectionTitle: { color: '#2C2C2C', fontSize: 14, fontFamily: 'serif', fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 },
  roomCard: { padding: 18, marginBottom: 16, backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E0E0E0', borderStyle: 'dotted', shadowColor: '#800020', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  roomTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  trackChip: { borderWidth: 1, borderColor: '#E0E0E0', borderStyle: 'dotted', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginBottom: 6, alignSelf: 'flex-start', backgroundColor: '#F9F6F0' },
  trackText: { color: '#800020', fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  roomName: { color: '#2C2C2C', fontSize: 16, fontFamily: 'serif', fontWeight: '800', maxWidth: 200 },
  timeBadge: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#800020', borderStyle: 'dotted', backgroundColor: '#FFF5F5', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  timeText: { color: '#800020', fontSize: 13, fontWeight: '800', fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace' },
  roomMeta: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  roomMetaText: { color: '#767676', fontSize: 12, fontWeight: '600' },
  dotSep: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#E0E0E0', marginHorizontal: 10 },
  joinBtn: { alignSelf: 'flex-start', paddingVertical: 8, paddingHorizontal: 14, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#800020', borderStyle: 'dotted', borderRadius: 10 },
  joinText: { color: '#800020', fontSize: 13, fontWeight: '700' },
});
