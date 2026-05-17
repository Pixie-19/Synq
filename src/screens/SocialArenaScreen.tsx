import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { HelpCircle, ThumbsUp, ThumbsDown, Sparkles } from 'lucide-react-native';
import { useApp } from '../context/AppContext';

export const SocialArenaScreen: React.FC = () => {
  const { hotTakes, voteHotTake, wouldYouRathers, voteWouldYouRather } = useApp();

  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <HelpCircle color="#800020" size={26} />
        <Text style={styles.headerTitle}>Social Arena</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.pitchCard}>
          <Text style={styles.pitchTitle}>Vibe Check Arena</Text>
          <Text style={styles.pitchDesc}>React to polar-opposite coding philosophies. Your votes feed the AI matchmaking vector!</Text>
        </View>

        <Text style={styles.sectionHeader}>Would You Rather: Hackathon Edition</Text>
        {wouldYouRathers.map((item, index) => {
          const total = item.opt1Votes + item.opt2Votes;
          const pct1 = Math.round((item.opt1Votes / total) * 100);
          const pct2 = 100 - pct1;
          const voted = item.userVote !== undefined;
          return (
            <View key={index} style={styles.gameCard}>
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
            </View>
          );
        })}

        <Text style={styles.sectionHeader}>Hot Take Arena</Text>
        {hotTakes.map((item, index) => {
          const total = item.agree + item.disagree;
          const agreePct = Math.round((item.agree / total) * 100);
          const disagreePct = 100 - agreePct;
          const voted = item.userVote !== undefined;
          return (
            <View key={index} style={styles.gameCard}>
              <View style={styles.hotTakeHeader}>
                <Sparkles color="#800020" size={14} style={{ marginRight: 6 }} />
                <Text style={styles.cardIndexLabel}>HOT TAKE #{index + 1}</Text>
              </View>
              <Text style={styles.hotTakeQuestion}>"{item.question}"</Text>
              {voted ? (
                <View style={styles.resultsWrapper}>
                  {[
                    { label: `Agree (${agreePct}%)`, pct: agreePct, color: '#800020', key: 'agree' as const },
                    { label: `Disagree (${disagreePct}%)`, pct: disagreePct, color: '#D03B5B', key: 'disagree' as const },
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
                    <ThumbsUp color="#800020" size={16} style={{ marginRight: 6 }} />
                    <Text style={styles.agreeText}>Agree</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.voteBtn, styles.disagreeBtn]} onPress={() => voteHotTake(index, 'disagree')}>
                    <ThumbsDown color="#D03B5B" size={16} style={{ marginRight: 6 }} />
                    <Text style={styles.disagreeText}>Disagree</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F6F0', paddingTop: Platform.OS === 'ios' ? 50 : 20 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, gap: 10 },
  headerTitle: { color: '#800020', fontSize: 32, fontFamily: 'serif', fontWeight: '900', letterSpacing: -0.5 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  pitchCard: { padding: 20, marginBottom: 24, backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E0E0E0', borderStyle: 'dotted', shadowColor: '#800020', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.05, shadowRadius: 20, elevation: 5 },
  pitchTitle: { color: '#800020', fontSize: 24, fontFamily: 'serif', fontWeight: '800', marginBottom: 6 },
  pitchDesc: { color: '#767676', fontSize: 13, lineHeight: 20, fontWeight: '500' },
  sectionHeader: { color: '#2C2C2C', fontSize: 14, fontFamily: 'serif', fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 16 },
  gameCard: { padding: 18, marginBottom: 16, backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E0E0E0', borderStyle: 'dotted' },
  cardIndexLabel: { color: '#767676', fontSize: 10, fontWeight: '800', letterSpacing: 1, marginBottom: 12 },
  wyrContainer: { flexDirection: 'row', height: 120, alignItems: 'center', position: 'relative' },
  wyrBtn: { flex: 1, height: '100%', padding: 10, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9F6F0', borderWidth: 1, borderColor: '#E0E0E0', borderStyle: 'dotted', borderRadius: 14 },
  optLeft: { marginRight: 4 },
  optRight: { marginLeft: 4 },
  wyrOptionText: { color: '#2C2C2C', fontSize: 12, fontWeight: '700', textAlign: 'center', lineHeight: 18 },
  orBadge: { position: 'absolute', left: '42%', width: 32, height: 32, borderRadius: 16, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E0E0E0', borderStyle: 'solid', alignItems: 'center', justifyContent: 'center', zIndex: 10 },
  orText: { color: '#800020', fontWeight: '900', fontSize: 10 },
  votedLeft: { backgroundColor: '#FFF5F5', borderColor: '#800020' },
  votedRight: { backgroundColor: '#F9F6F0', borderColor: '#767676' },
  wyrPctText: { color: '#800020', fontSize: 18, fontFamily: 'serif', fontWeight: '900', marginTop: 6 },
  hotTakeHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  hotTakeQuestion: { color: '#2C2C2C', fontSize: 16, fontFamily: 'serif', fontWeight: '600', fontStyle: 'italic', lineHeight: 22, marginBottom: 16 },
  voteControls: { flexDirection: 'row', gap: 10 },
  voteBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 44, borderRadius: 10, borderWidth: 1, borderStyle: 'dotted' },
  agreeBtn: { backgroundColor: '#FFF5F5', borderColor: '#800020' },
  agreeText: { color: '#800020', fontWeight: '700', fontSize: 13 },
  disagreeBtn: { backgroundColor: '#FFFFFF', borderColor: '#D03B5B' },
  disagreeText: { color: '#D03B5B', fontWeight: '700', fontSize: 13 },
  resultsWrapper: { gap: 12 },
  resultBarContainer: {},
  resultBarHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  resultBarLabel: { color: '#767676', fontSize: 12, fontWeight: '600' },
  userVoteIndicator: { color: '#800020', fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  barBg: { height: 8, backgroundColor: '#F9F6F0', borderRadius: 4, overflow: 'hidden', borderWidth: 1, borderColor: '#E0E0E0', borderStyle: 'dotted' },
  barFill: { height: '100%', borderRadius: 4 },
});
