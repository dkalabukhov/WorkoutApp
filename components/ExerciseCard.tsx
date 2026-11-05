import Ionicons from '@react-native-vector-icons/ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fontSize, radius, spacing } from '../constants/theme';
import type { DraftExercise } from '../types/exercise';

type Props = {
  exercise: DraftExercise;
  onEdit: () => void;
  onRemove: () => void;
};

export default function ExerciseCard({ exercise, onEdit, onRemove }: Props) {
  return (
    <Pressable
      onPress={onEdit}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
    >
      <View style={styles.icon}>
        <Ionicons name='barbell' size={20} color={colors.accent} />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.title} numberOfLines={1}>
          {exercise.name}
        </Text>
        <View style={styles.badgeRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{exercise.sets} подх.</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{exercise.reps} повт.</Text>
          </View>
          {exercise.weight != null && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{exercise.weight} кг</Text>
            </View>
          )}
        </View>
      </View>

      <Pressable
        hitSlop={12}
        onPress={onRemove}
        style={({ pressed }) => [styles.remove, pressed && { opacity: 0.5 }]}
      >
        <Ionicons name='close' size={18} color={colors.textMuted} />
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.cardIcon,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { color: colors.text, fontSize: fontSize.lg, fontWeight: '600' },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
    flexWrap: 'wrap',
  },
  badge: {
    backgroundColor: colors.cardSoft,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  badgeText: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    fontWeight: '500',
  },
  remove: { padding: spacing.xs },
});
