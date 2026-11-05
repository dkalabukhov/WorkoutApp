// components/EmptyState.tsx

import Ionicons from '@react-native-vector-icons/ionicons';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, spacing } from '../constants/theme';

export default function EmptyState() {
  return (
    <View style={styles.empty}>
      <Ionicons name='barbell-outline' size={56} color='#3A3A44' />
      <Text style={styles.title}>Начни тренировку</Text>
      <Text style={styles.text}>
        Добавь первое упражнение —{'\n'}оно появится здесь
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { alignItems: 'center', paddingVertical: 60, gap: spacing.md },
  title: { color: colors.text, fontSize: fontSize.lg, fontWeight: '600' },
  text: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
});
