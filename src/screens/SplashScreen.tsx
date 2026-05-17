import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { StackScreenProps } from '@react-navigation/stack';
import { useApp } from '../context/AppContext';

type Props = StackScreenProps<any, 'Splash'>;

export const SplashScreen: React.FC<Props> = ({ navigation }) => {
  const scaleAnim   = useRef(new Animated.Value(0.75)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const taglineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, tension: 15, friction: 4, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ]),
      Animated.timing(taglineAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
    ]).start();

    const t = setTimeout(() => navigation.replace('Auth'), 3200);
    return () => clearTimeout(t);
  }, [navigation, scaleAnim, opacityAnim, taglineAnim]);

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#06050C', '#0C0A1A', '#06050C']} style={StyleSheet.absoluteFillObject} />
      <Animated.View style={[styles.logoContainer, { opacity: opacityAnim, transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.glow} />
        <Text style={styles.logoText}>Synq</Text>
      </Animated.View>
      <Animated.View style={[styles.taglineContainer, { opacity: taglineAnim }]}>
        <Text style={styles.taglineText}>Build with people who</Text>
        <Text style={styles.taglineHighlight}>actually click.</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#06050C' },
  logoContainer: { alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  glow: { position: 'absolute', width: 140, height: 140, borderRadius: 70, backgroundColor: '#8A2BE2', opacity: 0.35, shadowColor: '#00F0FF', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.9, shadowRadius: 50 },
  logoText: { fontSize: 72, fontWeight: '900', color: '#FFFFFF', letterSpacing: -1.5, shadowColor: '#8A2BE2', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 15 },
  taglineContainer: { position: 'absolute', bottom: 80, alignItems: 'center' },
  taglineText: { fontSize: 18, color: '#8E8D9C', fontWeight: '500', letterSpacing: 0.5 },
  taglineHighlight: { fontSize: 20, color: '#00F0FF', fontWeight: '800', marginTop: 4, letterSpacing: 0.8, textShadowColor: 'rgba(0,240,255,0.4)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 8 },
});
