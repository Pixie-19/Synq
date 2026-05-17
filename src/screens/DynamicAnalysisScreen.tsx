import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, Animated, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Award, CheckCircle, AlertCircle } from 'lucide-react-native';
import type { StackScreenProps } from '@react-navigation/stack';
import { useApp } from '../context/AppContext';
import { GlassCard } from '../components/GlassCard';

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

  const Metric = ({ label, value, anim, color }: { label: string; value: number; anim: Animated.Value; color: string }) => (
    <View style={styles.metricRow}>
      <View style={styles.metricHeader}>
        <Text style={styles.metricLabel}>{label}</Text>
        <Text style={[styles.metricValue, { color }]}>{value}%</Text>
      </View>
      <View style={styles.barBg}>
        <Animated.View style={[styles.barFill, { width: anim.interpolate({ inputRange: [0,1], outputRange: ['0%','100%'] }), backgroundColor: color }]} />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#06050C','#0E0B25','#06050C']} style={StyleSheet.absoluteFillObject} />
      <View style={styles.header}>
        <Award color="#00F0FF" size={20} />
        <Text style={styles.headerTitle}>AI TEAM DYNAMIC DIAGNOSTICS</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: revealAnim, width: '100%' }}>
          <GlassCard style={styles.scoreCard} borderColor="rgba(138,43,226,0.3)">
            <Text style={styles.subtext}>COLLABORATION CONFIDENCE SCORE</Text>
            <View style={styles.ringContainer}>
              <View style={[styles.glowRing, { borderColor: activeMatch.archetype.glowColor }]} />
              <Text style={styles.confidenceScore}>{teamDynamicReport.confidenceScore}%</Text>
            </View>
            <Text style={styles.synqSummary}>Synq AI projects a high chance of competitive execution based on complementary archetype pairing!</Text>
          </GlassCard>

          <Text style={styles.sectionHeader}>Interaction Telemetry</Text>
          <GlassCard style={styles.metricsCard}>
            <Metric label="Communication Balance"   value={teamDynamicReport.communicationBalance}   anim={widthComm} color="#00F0FF" />
            <Metric label="Ideation Speed & Strength" value={teamDynamicReport.ideationStrength}   anim={widthIdea} color="#8A2BE2" />
            <Metric label="Execution Compatibility" value={teamDynamicReport.executionCompatibility} anim={widthExec} color="#FF007F" />
          </GlassCard>

          <GlassCard style={styles.qualCard}>
            <View style={styles.qualRow}><Text style={styles.qualLabel}>Leadership:</Text><Text style={styles.qualValue}>{teamDynamicReport.leadershipBalance}</Text></View>
            <View style={styles.qualRow}><Text style={styles.qualLabel}>Pacing:</Text><Text style={styles.qualValue}>{teamDynamicReport.pacingDifferences}</Text></View>
          </GlassCard>

          <Text style={styles.sectionHeader}>AI Synergies & Concerns</Text>
          <View style={styles.synList}>
            {teamDynamicReport.strengths.map((s, i) => (
              <View key={i} style={styles.synRow}>
                <CheckCircle color="#39FF14" size={16} style={{ marginRight: 10, marginTop: 2 }} />
                <Text style={styles.synText}>{s}</Text>
              </View>
            ))}
            {teamDynamicReport.concerns.map((c, i) => (
              <View key={i} style={styles.synRow}>
                <AlertCircle color="#FF4500" size={16} style={{ marginRight: 10, marginTop: 2 }} />
                <Text style={styles.synText}>{c}</Text>
              </View>
            ))}
          </View>
        </Animated.View>
      </ScrollView>

      <View style={styles.decisionDrawer}>
        {!showApproval ? (
          <TouchableOpacity style={styles.proceedBtn} onPress={() => setShowApproval(true)}>
            <LinearGradient colors={['#8A2BE2','#00F0FF']} start={{ x:0,y:0 }} end={{ x:1,y:0 }} style={styles.proceedGrad}>
              <Text style={styles.proceedText}>PROCEED TO TEAM APPROVAL</Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <View style={{ width: '100%' }}>
            <Text style={styles.approvalPrompt}>FORM TEAM WITH {activeMatch.name.toUpperCase()}?</Text>
            <View style={styles.actionButtonsRow}>
              <TouchableOpacity style={[styles.actionBtn, styles.btnDecline]} onPress={() => approveTeamSelection('DECLINE', navigation)}>
                <Text style={styles.btnDeclineText}>Pass 🛑</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, styles.btnMaybe]} onPress={() => approveTeamSelection('MAYBE', navigation)}>
                <Text style={styles.btnMaybeText}>Maybe ☕</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, styles.btnBuild]} onPress={() => approveTeamSelection('APPROVE', navigation)}>
                <LinearGradient colors={['#8A2BE2','#00F0FF']} start={{ x:0,y:0 }} end={{ x:1,y:0 }} style={styles.buildGrad}>
                  <Text style={styles.btnBuildText}>Build! 🚀</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#06050C', paddingTop: Platform.OS === 'ios' ? 50 : 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  headerTitle: { color: '#00F0FF', fontSize: 12, fontWeight: '900', letterSpacing: 1.5 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 160 },
  scoreCard: { padding: 24, alignItems: 'center', marginVertical: 20 },
  subtext: { color: '#8E8D9C', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  ringContainer: { width: 130, height: 130, alignItems: 'center', justifyContent: 'center', marginVertical: 18, position: 'relative' },
  glowRing: { position: 'absolute', width: 120, height: 120, borderRadius: 60, borderWidth: 4, shadowColor: '#00F0FF', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 10 },
  confidenceScore: { fontSize: 38, fontWeight: '900', color: '#FFF' },
  synqSummary: { color: '#8E8D9C', fontSize: 12, lineHeight: 18, textAlign: 'center', fontWeight: '500' },
  sectionHeader: { color: '#00F0FF', fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginTop: 10, marginBottom: 12 },
  metricsCard: { padding: 16, marginBottom: 16 },
  metricRow: { marginBottom: 16 },
  metricHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  metricLabel: { color: '#FFF', fontSize: 13, fontWeight: '700' },
  metricValue: { fontSize: 13, fontWeight: '800' },
  barBg: { height: 8, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },
  qualCard: { padding: 16, marginBottom: 20 },
  qualRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  qualLabel: { color: '#8E8D9C', fontSize: 12, fontWeight: '600' },
  qualValue: { color: '#FFF', fontSize: 12, fontWeight: '800' },
  synList: { gap: 12 },
  synRow: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: 'rgba(255,255,255,0.02)', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)' },
  synText: { flex: 1, color: '#8E8D9C', fontSize: 12, lineHeight: 16, fontWeight: '500' },
  decisionDrawer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#06050C', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 20, paddingTop: 16, paddingBottom: Platform.OS === 'ios' ? 24 : 16, alignItems: 'center' },
  proceedBtn: { width: '100%', borderRadius: 16, overflow: 'hidden' },
  proceedGrad: { height: 52, alignItems: 'center', justifyContent: 'center' },
  proceedText: { color: '#FFF', fontWeight: '800', fontSize: 13, letterSpacing: 1 },
  approvalPrompt: { color: '#FFF', fontSize: 12, fontWeight: '800', letterSpacing: 0.5, marginBottom: 12, textAlign: 'center' },
  actionButtonsRow: { flexDirection: 'row', width: '100%', gap: 8 },
  actionBtn: { height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  btnDecline: { flex: 1, backgroundColor: 'rgba(255,69,0,0.06)', borderWidth: 1, borderColor: 'rgba(255,69,0,0.2)' },
  btnDeclineText: { color: '#FF4500', fontWeight: '700', fontSize: 12 },
  btnMaybe: { flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  btnMaybeText: { color: '#8E8D9C', fontWeight: '700', fontSize: 12 },
  btnBuild: { flex: 1.6, overflow: 'hidden' },
  buildGrad: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  btnBuildText: { color: '#FFF', fontWeight: '800', fontSize: 13 },
});
