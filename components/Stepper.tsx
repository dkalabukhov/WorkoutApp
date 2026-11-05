import Ionicons from '@react-native-vector-icons/ionicons';
import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, radius, spacing } from '../constants/theme';

type Props = {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
};

export default function Stepper({ label, value, onChange, min, max }: Props) {
  const change = (delta: number) => {
    const next = Math.max(min, Math.min(max, value + delta));
    if (next !== value) {
      onChange(next);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  return (
    <View style={styles.stepper}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        <Pressable
          onPress={() => change(-1)}
          style={({ pressed }) => [styles.btn, pressed && { opacity: 0.5 }]}
        >
          <Ionicons name='remove' size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.value}>{value}</Text>
        <Pressable
          onPress={() => change(+1)}
          style={({ pressed }) => [styles.btn, pressed && { opacity: 0.5 }]}
        >
          <Ionicons name='add' size={22} color={colors.text} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stepper: {
    flex: 1,
    backgroundColor: colors.cardSoft,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  label: { color: colors.textMuted, fontSize: fontSize.xs },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  btn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.stepBtn,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: '700',
    minWidth: 40,
    textAlign: 'center',
  },
});
