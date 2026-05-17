import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { HelpCircle, ThumbsUp, ThumbsDown, Sparkles } from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import { GlassCard } from '../components/GlassCard';

export const SocialArenaScreen: React.FC = () => {
  const { hotTakes, voteHotTake, wouldYouRathers, voteWouldYouRather } = useApp();

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#06050C','#0E0920','#06050C']} style={StyleSheet.absoluteFillObject} />
      <View style={styles.header}>
        <HelpCircle color="#00F0FF" size={22} />
        <Text style={styles.headerTitle}>Social Arena</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <GlassCard style={styles.pitchCard} borderColor="rgba(0,240,255,0.2)">
          <Text style={styles.pitchTitle}>Vibe Check Arena 🎮</Text>
          <Text style={styles.pitchDesc}>React to polar-opposite coding philosophies. Your votes feed the AI matchmaking vector!</Text>
        </GlassCard>

        <Text style={styles.sectionHeader}>Would You Rather: Hackathon Edition</Text>
        {wouldYouRathers.map((item, index) => {
          const total = item.opt1Votes + item.opt2Votes;
          const pct1 = Math.round((item.opt1Votes / total) * 100);
          const pct2 = 100 - pct1;
          const voted = item.userVote !== undefined;
          return (
            <GlassCard key={index} style={styles.gameCard} borderColor="rgba(255,255,255,0.08)">
              <Text style={styles.cardIndexLabel}>DILEMMA #{index + 1}</Text>
              <View style={styles.wyrContainer}>
                <TouchableOpacity
                  style={[styles.wyrBtn, styles.optLeft, item.userVote === 1 && styles.votedLeft, voted && { opacity: 0.95 }]}
                  onPress={() => voteWouldYouRather(index, 1)} disabled={voted}
                >
                  <Text style={styles.wyrOptionText}>{item.q1}</Text>
                  {voted && <Text style={styles.wyrPctText}>{pct1}%</Text>}
                </TouchableOpacity>
                <View style={styles.orBadge}><Text style={styles.orText}>OR</Text></View>
                <TouchableOpacity
                  style={[styles.wyrBtn, styles.optRight, item.userVote === 2 && styles.votedRight, voted && { opacity: 0.95 }]}
                  onPress={() => voteWouldYouRather(index, 2)} disabled={voted}
                >
                  <Text style={styles.wyrOptionText}>{item.q2}</Text>
                  {voted && <Text style={styles.wyrPctText}>{pct2}%</Text>}
                </TouchableOpacity>
              </View>
            </GlassCard>
          );
        })}

        <Text style={styles.sectionHeader}>Hot Take Arena</Text>
        {hotTakes.map((item, index) => {
          const total = item.agree + item.disagree;
          const agreePct = Math.round((item.agree / total) * 100);
          const disagreePct = 100 - agreePct;
          const voted = item.userVote !== undefined;
          return (
            <GlassCard key={index} style={styles.gameCard} borderColor="rgba(255,255,255,0.08)">
              <View style={styles.hotTakeHeader}>
                <Sparkles color="#A020F0" size={14} style={{ marginRight: 6 }} />
                <Text style={styles.cardIndexLabel}>HOT TAKE #{index + 1}</Text>
              </View>
              <Text style={styles.hotTakeQuestion}>"{item.question}"</Text>
              {voted ? (
                <View style={styles.resultsWrapper}>
                  {[
                    { label: `Agree (${agreePct}%)`, pct: agreePct, color: '#39FF14', key: 'agree' as const },
                    { label: `Disagree (${disagreePct}%)`, pct: disagreePct, color: '#FF0055', key: 'disagree' as const },
                  ].map(bar => (
                    <View key={bar.key} style={styles.resultBarContainer}>
                      <View style={styles.resultBarHeader}>
                        <Text style={styles.resultBarLabel}>{bar.label}</Text>
                        {item.userVote === bar.key && <Text style={styles.userVoteIndicator}>Your Vote</Text>}
                      </View>
                      <View style={styles.barBg}>
                        <View style={[styles.barFill, { width: `${bar.pct}%`, backgroundColor: bar.color }]} />
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.voteControls}>
                  <TouchableOpacity style={[styles.voteBtn, styles.agreeBtn]} onPress={() => voteHotTake(index, 'agree')}>
                    <ThumbsUp color="#39FF14" size={16} style={{ marginRight: 6 }} />
                    <Text style={styles.agreeText}>Agree</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.voteBtn, styles.disagreeBtn]} onPress={() => voteHotTake(index, 'disagree')}>
                    <ThumbsDown color="#FF0055" size={16} style={{ marginRight: 6 }} />
                    <Text style={styles.disagreeText}>Disagree</Text>
                  </TouchableOpacity>
                </View>
              )}
            </GlassCard>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#06050C', paddingTop: Platform.OS === 'ios' ? 50 : 20 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, gap: 10 },
  headerTitle: { color: '#FFF', fontSize: 28, fontWeight: '900', letterSpacing: -0.5 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  pitchCard: { padding: 20, marginBottom: 24 },
  pitchTitle: { color: '#FFF', fontSize: 18, fontWeight: '800', marginBottom: 6 },
  pitchDesc: { color: '#8E8D9C', fontSize: 12, lineHeight: 18, fontWeight: '500' },
  sectionHeader: { color: '#00F0FF', fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 16 },
  gameCard: { padding: 18, marginBottom: 16 },
  cardIndexLabel: { color: '#636275', fontSize: 9, fontWeight: '800', letterSpacing: 1, marginBottom: 12 },
  wyrContainer: { flexDirection: 'row', height: 120, alignItems: 'center', position: 'relative' },
  wyrBtn: { flex: 1, height: '100%', padding: 10, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.02)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', borderRadius: 14 },
  optLeft: { marginRight: 4 },
  optRight: { marginLeft: 4 },
  wyrOptionText: { color: '#FFF', fontSize: 11, fontWeight: '700', textAlign: 'center', lineHeight: 16 },
  orBadge: { position: 'absolute', left: '42%', width: 32, height: 32, borderRadius: 16, backgroundColor: '#0E0920', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center', zIndex: 10 },
  orText: { color: '#00F0FF', fontWeight: '900', fontSize: 10 },
  votedLeft: { backgroundColor: 'rgba(138,43,226,0.15)', borderColor: '#8A2BE2' },
  votedRight: { backgroundColor: 'rgba(0,240,255,0.15)', borderColor: '#00F0FF' },
  wyrPctText: { color: '#FFF', fontSize: 16, fontWeight: '900', marginTop: 6 },
  hotTakeHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  hotTakeQuestion: { color: '#FFF', fontSize: 14, fontWeight: '600', fontStyle: 'italic', lineHeight: 20, marginBottom: 16 },
  voteControls: { flexDirection: 'row', gap: 10 },
  voteBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 40, borderRadius: 10, borderWidth: 1 },
  agreeBtn: { backgroundColor: 'rgba(57,255,20,0.04)', borderColor: 'rgba(57,255,20,0.2)' },
  agreeText: { color: '#39FF14', fontWeight: '700', fontSize: 12 },
  disagreeBtn: { backgroundColor: 'rgba(255,0,85,0.04)', borderColor: 'rgba(255,0,85,0.2)' },
  disagreeText: { color: '#FF0055', fontWeight: '700', fontSize: 12 },
  resultsWrapper: { gap: 12 },
  resultBarContainer: {},
  resultBarHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  resultBarLabel: { color: '#8E8D9C', fontSize: 11, fontWeight: '600' },
  userVoteIndicator: { color: '#00F0FF', fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  barBg: { height: 8, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },
});
