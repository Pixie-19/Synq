import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Animated } from 'react-native';
import type { StackScreenProps } from '@react-navigation/stack';

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

    if (navigation) {
      const t = setTimeout(() => navigation.replace('Auth'), 3200);
      return () => clearTimeout(t);
    }
  }, [navigation, scaleAnim, opacityAnim, taglineAnim]);

  return (
    <View style={styles.container}>
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
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F9F6F0' },
  logoContainer: { alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  glow: { position: 'absolute', width: 160, height: 160, borderRadius: 80, backgroundColor: 'transparent', borderWidth: 2, borderColor: '#E0E0E0', borderStyle: 'dotted' },
  logoText: { fontSize: 80, fontFamily: 'serif', fontWeight: '900', color: '#800020', letterSpacing: -2 },
  taglineContainer: { position: 'absolute', bottom: 80, alignItems: 'center' },
  taglineText: { fontSize: 18, fontFamily: 'serif', color: '#767676', fontWeight: '500', letterSpacing: 0.5 },
  taglineHighlight: { fontSize: 20, fontFamily: 'serif', color: '#800020', fontWeight: '800', marginTop: 4, letterSpacing: 0.8 },
});
