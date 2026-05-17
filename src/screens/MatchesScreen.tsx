import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { MessageSquare, Zap, Sparkles, PenTool, Mic, Server, Coffee, Users } from 'lucide-react-native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useApp } from '../context/AppContext';

type Props = any;

const IconMap: Record<string, any> = {
  'PenTool': PenTool,
  'Mic': Mic,
  'Server': Server,
  'Zap': Sparkles,
  'Coffee': Coffee
};

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

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Matches</Text>
        <Text style={styles.headerSub}>{matchedProfiles.length} connection{matchedProfiles.length !== 1 ? 's' : ''}</Text>
      </View>

      {matchedProfiles.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconWrap}>
            <Users color="#800020" size={48} />
          </View>
          <Text style={styles.emptyTitle}>No Synqs yet</Text>
          <Text style={styles.emptyDesc}>Swipe right on someone in Discover to start matching!</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {matchedProfiles.map(profile => {
            const ArchetypeIcon = IconMap[profile.archetype.icon] || Sparkles;
            return (
              <View key={profile.id} style={styles.matchCard}>
                <View style={styles.cardTop}>
                  <Image source={{ uri: profile.avatar }} style={styles.avatar} />
                  <View style={styles.info}>
                    <View style={styles.nameRow}>
                      <Text style={styles.name}>{profile.name}</Text>
                      <View style={styles.scoreBadge}>
                        <Sparkles color="#800020" size={10} style={{ marginRight: 3 }} />
                        <Text style={styles.scoreText}>{profile.compatibilityScore}%</Text>
                      </View>
                    </View>
                    <Text style={styles.role}>{profile.role} · {profile.college}</Text>
                    <Text style={styles.tagline} numberOfLines={1}>{profile.tagline}</Text>
                    <View style={styles.archetypeChip}>
                      <ArchetypeIcon color="#800020" size={12} style={{ marginRight: 4 }} />
                      <Text style={styles.archetypeText}>{profile.archetype.name}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.actions}>
                  <TouchableOpacity style={styles.chatBtn} onPress={() => handleOpenChat(profile)}>
                    <MessageSquare color="#800020" size={16} style={{ marginRight: 6 }} />
                    <Text style={styles.chatBtnText}>Open Chat</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.sprintBtn} onPress={() => handleStartSprint(profile)}>
                    <View style={styles.sprintGrad}>
                      <Zap color="#FFFFFF" size={14} style={{ marginRight: 6 }} />
                      <Text style={styles.sprintBtnText}>Sprint</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F6F0', paddingTop: Platform.OS === 'ios' ? 50 : 20 },
  header: { paddingHorizontal: 20, paddingVertical: 16 },
  headerTitle: { color: '#800020', fontSize: 32, fontFamily: 'serif', fontWeight: '900', letterSpacing: -0.5 },
  headerSub: { color: '#767676', fontSize: 13, fontWeight: '600', marginTop: 2, fontStyle: 'italic' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  emptyIconWrap: { width: 96, height: 96, borderRadius: 48, backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: '#E0E0E0', borderStyle: 'dotted', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  emptyTitle: { color: '#2C2C2C', fontSize: 24, fontFamily: 'serif', fontWeight: '800', marginBottom: 8 },
  emptyDesc: { color: '#767676', fontSize: 14, textAlign: 'center', lineHeight: 20 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  matchCard: { padding: 16, marginBottom: 16, backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E0E0E0', borderStyle: 'dotted', shadowColor: '#800020', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  cardTop: { flexDirection: 'row', marginBottom: 14 },
  avatar: { width: 70, height: 70, borderRadius: 35, marginRight: 14, borderWidth: 2, borderColor: '#E0E0E0', borderStyle: 'dotted' },
  info: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 },
  name: { color: '#2C2C2C', fontSize: 18, fontFamily: 'serif', fontWeight: '800' },
  scoreBadge: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#800020', borderStyle: 'dotted', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 100, backgroundColor: '#FFF5F5' },
  scoreText: { color: '#800020', fontSize: 11, fontWeight: '800' },
  role: { color: '#767676', fontSize: 12, fontWeight: '600' },
  tagline: { color: '#2C2C2C', fontSize: 12, marginTop: 4, fontStyle: 'italic' },
  archetypeChip: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', borderWidth: 1, borderColor: '#E0E0E0', borderStyle: 'dotted', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginTop: 6, backgroundColor: '#F9F6F0' },
  archetypeText: { color: '#800020', fontSize: 11, fontWeight: '700' },
  actions: { flexDirection: 'row', gap: 10 },
  chatBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E0E0E0', borderStyle: 'dotted', borderRadius: 8, height: 42 },
  chatBtnText: { color: '#800020', fontWeight: '700', fontSize: 13 },
  sprintBtn: { flex: 1, borderRadius: 8, overflow: 'hidden', backgroundColor: '#800020', shadowColor: '#800020', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 4 },
  sprintGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 42 },
  sprintBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13, fontFamily: 'serif' },
});
