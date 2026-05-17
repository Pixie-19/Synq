import React from 'react';
import { StyleSheet, View, ViewStyle, StyleProp } from 'react-native';

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  borderColor?: string;
  backgroundColor?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  borderColor = 'rgba(255, 255, 255, 0.1)',
  backgroundColor = 'rgba(20, 18, 38, 0.65)'
}) => {
  return (
    <View style={[styles.card, { borderColor, backgroundColor }, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    borderWidth: 1.5,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'hidden'
  }
});
