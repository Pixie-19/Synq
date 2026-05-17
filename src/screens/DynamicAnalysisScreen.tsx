import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, Animated, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Award, CheckCircle, AlertCircle } from 'lucide-react-native';
import type { StackScreenProps } from '@react-navigation/stack';
import { useApp } from '../context/AppContext';

type Props = StackScreenProps<any, 'DynamicAnalysis'>;

export const DynamicAnalysisScreen: React.FC<Props> = ({ navigation }) => {
  const { teamDynamicReport, approveTeamSelection, activeMatch } = useApp();
  const [showApproval, setShowApproval] = useState(false);
  const widthComm  = useRef(new Animated.Value(0)).current;
  const widthIdea  = useRef(new Animated.Value(0)).current;
  const widthExec  = useRef(new Animated.Value(0)).current;
  const revealAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!teamDynamicReport) return;
    Animated.timing(revealAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
    Animated.stagger(150, [
      Animated.timing(widthComm, { toValue: teamDynamicReport.communicationBalance / 100, duration: 1000, useNativeDriver: false }),
      Animated.timing(widthIdea, { toValue: teamDynamicReport.ideationStrength / 100, duration: 1000, useNativeDriver: false }),
      Animated.timing(widthExec, { toValue: teamDynamicReport.executionCompatibility / 100, duration: 1000, useNativeDriver: false }),
    ]).start();
  }, [teamDynamicReport]);

  if (!teamDynamicReport || !activeMatch) return null;

  const Metric = ({ label, value, anim }: { label: string; value: number; anim: Animated.Value }) => (
    <View style={styles.metricRow}>
      <View style={styles.metricHeader}>
        <Text style={styles.metricLabel}>{label}</Text>
        <Text style={styles.metricValue}>{value}%</Text>
      </View>
      <View style={styles.barBg}>
        <Animated.View style={[styles.barFill, { width: anim.interpolate({ inputRange: [0,1], outputRange: ['0%','100%'] }) }]} />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Award color="#800020" size={20} />
        <Text style={styles.headerTitle}>AI TEAM DYNAMIC DIAGNOSTICS</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: revealAnim, width: '100%' }}>
          <View style={styles.scoreCard}>
            <Text style={styles.subtext}>COLLABORATION CONFIDENCE SCORE</Text>
            <View style={styles.ringContainer}>
              <View style={styles.glowRing} />
              <Text style={styles.confidenceScore}>{teamDynamicReport.confidenceScore}%</Text>
            </View>
            <Text style={styles.synqSummary}>Synq AI projects a high chance of competitive execution based on complementary archetype pairing!</Text>
          </View>

          <Text style={styles.sectionHeader}>Interaction Telemetry</Text>
          <View style={styles.metricsCard}>
            <Metric label="Communication Balance"   value={teamDynamicReport.communicationBalance}   anim={widthComm} />
            <Metric label="Ideation Speed & Strength" value={teamDynamicReport.ideationStrength}   anim={widthIdea} />
            <Metric label="Execution Compatibility" value={teamDynamicReport.executionCompatibility} anim={widthExec} />
          </View>

          <View style={styles.qualCard}>
            <View style={styles.qualRow}><Text style={styles.qualLabel}>Leadership:</Text><Text style={styles.qualValue}>{teamDynamicReport.leadershipBalance}</Text></View>
            <View style={styles.qualRow}><Text style={styles.qualLabel}>Pacing:</Text><Text style={styles.qualValue}>{teamDynamicReport.pacingDifferences}</Text></View>
          </View>

          <Text style={styles.sectionHeader}>AI Synergies & Concerns</Text>
          <View style={styles.synList}>
            {teamDynamicReport.strengths.map((s, i) => (
              <View key={i} style={styles.synRow}>
                <CheckCircle color="#800020" size={16} style={{ marginRight: 10, marginTop: 2 }} />
                <Text style={styles.synText}>{s}</Text>
              </View>
            ))}
            {teamDynamicReport.concerns.map((c, i) => (
              <View key={i} style={styles.synRow}>
                <AlertCircle color="#D03B5B" size={16} style={{ marginRight: 10, marginTop: 2 }} />
                <Text style={styles.synText}>{c}</Text>
              </View>
            ))}
          </View>
        </Animated.View>
      </ScrollView>

      <View style={styles.decisionDrawer}>
        {!showApproval ? (
          <TouchableOpacity style={styles.proceedBtn} onPress={() => setShowApproval(true)}>
            <View style={styles.proceedGrad}>
              <Text style={styles.proceedText}>PROCEED TO TEAM APPROVAL</Text>
            </View>
          </TouchableOpacity>
        ) : (
          <View style={{ width: '100%' }}>
            <Text style={styles.approvalPrompt}>FORM TEAM WITH {activeMatch.name.toUpperCase()}?</Text>
            <View style={styles.actionButtonsRow}>
              <TouchableOpacity style={[styles.actionBtn, styles.btnDecline]} onPress={() => approveTeamSelection('DECLINE', navigation)}>
                <Text style={styles.btnDeclineText}>Pass</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, styles.btnMaybe]} onPress={() => approveTeamSelection('MAYBE', navigation)}>
                <Text style={styles.btnMaybeText}>Maybe</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, styles.btnBuild]} onPress={() => approveTeamSelection('APPROVE', navigation)}>
                <View style={styles.buildGrad}>
                  <Text style={styles.btnBuildText}>Build!</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F6F0', paddingTop: Platform.OS === 'ios' ? 50 : 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#E0E0E0', borderStyle: 'dotted' },
  headerTitle: { color: '#800020', fontSize: 12, fontWeight: '900', letterSpacing: 1.5, fontFamily: 'serif' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 160 },
  scoreCard: { padding: 24, alignItems: 'center', marginVertical: 20, backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E0E0E0', borderStyle: 'dotted', shadowColor: '#800020', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.05, shadowRadius: 20, elevation: 5 },
  subtext: { color: '#767676', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  ringContainer: { width: 130, height: 130, alignItems: 'center', justifyContent: 'center', marginVertical: 18, position: 'relative' },
  glowRing: { position: 'absolute', width: 120, height: 120, borderRadius: 60, borderWidth: 2, borderColor: '#800020', borderStyle: 'dotted' },
  confidenceScore: { fontSize: 38, fontFamily: 'serif', fontWeight: '900', color: '#800020' },
  synqSummary: { color: '#2C2C2C', fontSize: 12, lineHeight: 18, textAlign: 'center', fontWeight: '500' },
  sectionHeader: { color: '#800020', fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginTop: 10, marginBottom: 12, fontFamily: 'serif' },
  metricsCard: { padding: 16, marginBottom: 16, backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E0E0E0', borderStyle: 'dotted' },
  metricRow: { marginBottom: 16 },
  metricHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  metricLabel: { color: '#2C2C2C', fontSize: 13, fontWeight: '700' },
  metricValue: { color: '#800020', fontSize: 13, fontWeight: '800' },
  barBg: { height: 8, backgroundColor: '#F9F6F0', borderRadius: 4, overflow: 'hidden', borderWidth: 1, borderColor: '#E0E0E0', borderStyle: 'dotted' },
  barFill: { height: '100%', borderRadius: 4, backgroundColor: '#800020' },
  qualCard: { padding: 16, marginBottom: 20, backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E0E0E0', borderStyle: 'dotted' },
  qualRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  qualLabel: { color: '#767676', fontSize: 12, fontWeight: '600' },
  qualValue: { color: '#2C2C2C', fontSize: 12, fontWeight: '800' },
  synList: { gap: 12 },
  synRow: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#FFFFFF', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#E0E0E0', borderStyle: 'dotted' },
  synText: { flex: 1, color: '#2C2C2C', fontSize: 12, lineHeight: 18, fontWeight: '500' },
  decisionDrawer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#F9F6F0', borderTopWidth: 1, borderTopColor: '#E0E0E0', borderStyle: 'dotted', paddingHorizontal: 20, paddingTop: 16, paddingBottom: Platform.OS === 'ios' ? 24 : 16, alignItems: 'center' },
  proceedBtn: { width: '100%', borderRadius: 8, overflow: 'hidden', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#800020', borderStyle: 'dotted' },
  proceedGrad: { height: 52, alignItems: 'center', justifyContent: 'center' },
  proceedText: { color: '#800020', fontWeight: '800', fontSize: 13, letterSpacing: 1, fontFamily: 'serif' },
  approvalPrompt: { color: '#2C2C2C', fontSize: 13, fontFamily: 'serif', fontWeight: '800', letterSpacing: 0.5, marginBottom: 12, textAlign: 'center' },
  actionButtonsRow: { flexDirection: 'row', width: '100%', gap: 8 },
  actionBtn: { height: 48, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  btnDecline: { flex: 1, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#D03B5B', borderStyle: 'dotted' },
  btnDeclineText: { color: '#D03B5B', fontWeight: '700', fontSize: 13 },
  btnMaybe: { flex: 1, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#767676', borderStyle: 'dotted' },
  btnMaybeText: { color: '#767676', fontWeight: '700', fontSize: 13 },
  btnBuild: { flex: 1.6, overflow: 'hidden', backgroundColor: '#800020', shadowColor: '#800020', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 4 },
  buildGrad: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  btnBuildText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14, fontFamily: 'serif' },
});
