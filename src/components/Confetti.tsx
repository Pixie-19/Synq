import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

const COLORS = ['#FF007F', '#00F0FF', '#7B2CBF', '#FFD700', '#FF4500', '#39FF14'];

interface ConfettiProps {
  active: boolean;
}

export const Confetti: React.FC<ConfettiProps> = ({ active }) => {
  const particles = useRef(
    Array.from({ length: 40 }).map(() => ({
      x: Math.random() * width,
      y: new Animated.Value(-20),
      size: Math.random() * 8 + 6,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      angle: new Animated.Value(Math.random() * 360),
      scale: Math.random() * 0.6 + 0.4
    }))
  ).current;

  useEffect(() => {
    if (active) {
      const animations = particles.map(p => {
        return Animated.parallel([
          Animated.timing(p.y, {
            toValue: height + 20,
            duration: Math.random() * 2500 + 1500,
            useNativeDriver: Platform.OS !== 'web'
          }),
          Animated.timing(p.angle, {
            toValue: Math.random() * 720 + 360,
            duration: Math.random() * 2500 + 1500,
            useNativeDriver: Platform.OS !== 'web'
          })
        ]);
      });

      Animated.stagger(20, animations).start();
    }
  }, [active, particles]);

  if (!active) return null;

  return (
    <View style={[StyleSheet.absoluteFill, { pointerEvents: 'none' }]}>
      {particles.map((p, index) => {
        const rotate = p.angle.interpolate({
          inputRange: [0, 360],
          outputRange: ['0deg', '360deg']
        });

        return (
          <Animated.View
            key={index}
            style={[
              styles.particle,
              {
                left: p.x,
                width: p.size,
                height: p.size,
                backgroundColor: p.color,
                transform: [
                  { translateY: p.y },
                  { rotate },
                  { scale: p.scale }
                ]
              }
            ]}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  particle: {
    position: 'absolute',
    borderRadius: 4
  }
});
