import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Animated, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Sparkles, ArrowRight, Activity, Users, AlertTriangle, PenTool, Mic, Server, Zap, Coffee } from 'lucide-react-native';
import type { StackScreenProps } from '@react-navigation/stack';
import { useApp } from '../context/AppContext';

type Props = StackScreenProps<any, 'Archetype'>;

const IconMap: Record<string, any> = {
  'PenTool': PenTool,
  'Mic': Mic,
  'Server': Server,
  'Zap': Zap,
  'Coffee': Coffee
};

export const ArchetypeScreen: React.FC<Props> = () => {
  const { userArchetype, finishOnboarding } = useApp();
  const glowAnim = useRef(new Animated.Value(0.4)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const revealAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1.0, duration: 2500, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(glowAnim, { toValue: 0.4, duration: 2500, useNativeDriver: Platform.OS !== 'web' }),
      ])
    ).start();

    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 10000,
        useNativeDriver: Platform.OS !== 'web',
      })
    ).start();

    Animated.timing(revealAnim, { toValue: 1, duration: 1500, useNativeDriver: Platform.OS !== 'web' }).start();
  }, [glowAnim, rotateAnim, revealAnim]);

  if (!userArchetype) return null;

  const { name, identity, description, glowColor, icon, traits, strengths, idealTeammates, weaknesses } = userArchetype;

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  const IconComponent = IconMap[icon] || Sparkles;

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.glowAura,
          {
            backgroundColor: glowColor,
            opacity: glowAnim.interpolate({ inputRange: [0.4, 1], outputRange: [0.08, 0.2] }),
            transform: [
              { scale: glowAnim.interpolate({ inputRange: [0.4, 1], outputRange: [1, 1.4] }) },
              { rotate: spin }
            ],
          },
        ]}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: revealAnim, alignItems: 'center', width: '100%' }}>
          
          <View style={styles.header}>
            <Sparkles color="#800020" size={20} />
            <Text style={styles.headerSubtitle}>AI Archetype Generated</Text>
          </View>

          <View style={styles.archetypeCard}>
            <View style={styles.iconBadge}>
              <IconComponent color="#800020" size={36} strokeWidth={1.5} />
            </View>
            
            <Text style={styles.archetypePrefix}>⚡ You Are The</Text>
            <Text style={[styles.archetypeName, { color: '#800020' }]}>{name}</Text>
            <Text style={styles.archetypeIdentity}>{identity}</Text>
            <Text style={styles.archetypeDesc}>{description}</Text>

            <View style={styles.divider} />

            <View style={styles.contentGrid}>
              <View style={styles.section}>
                <Text style={styles.sectionHeader}>Hacker Traits</Text>
                <View style={styles.traitsContainer}>
                  {traits.map((trait: string, idx: number) => (
                    <View key={idx} style={styles.traitBadge}>
                      <Activity color="#800020" size={14} style={{ marginRight: 6 }} />
                      <Text style={styles.traitText}>{trait}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionHeader}>Compatibility Strengths</Text>
                <View style={styles.strengthsContainer}>
                  {strengths.map((str: string, idx: number) => (
                    <View key={idx} style={styles.strengthRow}>
                      <Text style={styles.bullet}>✦</Text>
                      <Text style={styles.strengthText}>{str}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionHeader}>Works Best With</Text>
                <View style={styles.strengthsContainer}>
                  {idealTeammates.map((mate: string, idx: number) => (
                    <View key={idx} style={styles.strengthRow}>
                      <Users color="#767676" size={14} style={{ marginRight: 8 }} />
                      <Text style={styles.strengthText}>{mate}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionHeader}>Potential Weakness</Text>
                <View style={styles.strengthsContainer}>
                  {weaknesses.map((weak: string, idx: number) => (
                    <View key={idx} style={styles.strengthRow}>
                      <AlertTriangle color="#D03B5B" size={14} style={{ marginRight: 8 }} />
                      <Text style={styles.strengthText}>{weak}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.continueButton} onPress={() => finishOnboarding()}>
            <View style={styles.solidButton}>
              <Text style={styles.continueText}>Enter Discover Arena</Text>
              <ArrowRight color="#FFFFFF" size={18} />
            </View>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F6F0', paddingTop: Platform.OS === 'ios' ? 60 : 30 },
  scrollContent: { alignItems: 'center', paddingHorizontal: 20, paddingBottom: 50 },
  glowAura: { position: 'absolute', width: 350, height: 350, borderRadius: 175, top: '5%', alignSelf: 'center', filter: 'blur(40px)' },
  
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 28 },
  headerSubtitle: { color: '#800020', fontSize: 13, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 2, fontFamily: 'serif' },
  
  archetypeCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderStyle: 'dotted',
    padding: 32,
    alignItems: 'center',
    marginBottom: 32,
    ...Platform.select({
      web: {
        boxShadow: '0 12px 24px rgba(128, 0, 32, 0.1)'
      },
      default: {
        shadowColor: '#800020',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.1,
        shadowRadius: 24,
        elevation: 8
      }
    })
  },
  iconBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F9F6F0',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderStyle: 'dotted',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    ...Platform.select({
      web: {
        boxShadow: '0 6px 10px rgba(0, 0, 0, 0.05)'
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 6
      }
    })
  },
  
  archetypePrefix: { color: '#767676', fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6 },
  archetypeName: { fontSize: 34, fontFamily: 'serif', fontWeight: '800', letterSpacing: -0.5, textAlign: 'center', marginBottom: 8 },
  archetypeIdentity: { fontSize: 18, color: '#800020', fontStyle: 'italic', textAlign: 'center', marginBottom: 16, fontWeight: '600' },
  archetypeDesc: { fontSize: 15, color: '#2C2C2C', textAlign: 'center', lineHeight: 24, paddingHorizontal: 10 },
  
  divider: { width: '100%', height: 1, borderWidth: 1, borderColor: '#E0E0E0', borderStyle: 'dotted', backgroundColor: 'transparent', marginVertical: 28 },
  
  contentGrid: { width: '100%', gap: 24 },
  section: { width: '100%' },
  sectionHeader: { color: '#2C2C2C', fontSize: 14, fontFamily: 'serif', fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  
  traitsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, width: '100%' },
  traitBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9F6F0', borderWidth: 1, borderColor: '#E0E0E0', borderStyle: 'dotted', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 100 },
  traitText: { color: '#2C2C2C', fontSize: 13, fontWeight: '600' },
  
  strengthsContainer: { width: '100%', gap: 8 },
  strengthRow: { flexDirection: 'row', alignItems: 'center' },
  bullet: { fontSize: 14, marginRight: 8, color: '#800020' },
  strengthText: { color: '#767676', fontSize: 14, fontWeight: '500' },
  
  continueButton: {
    width: '100%',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#800020',
    ...Platform.select({
      web: {
        boxShadow: '0 8px 16px rgba(128, 0, 32, 0.25)'
      },
      default: {
        shadowColor: '#800020',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 8
      }
    })
  },
  solidButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, gap: 12 },
  continueText: { color: '#FFFFFF', fontWeight: '800', fontSize: 16, letterSpacing: 0.5, fontFamily: 'serif' },
});
