import Ionicons from '@react-native-vector-icons/ionicons';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import EmptyState from '../../../components/EmptyState';
import ExerciseCard from '../../../components/ExerciseCard';
import ExerciseSheet from '../../../components/ExerciseSheet';
import { colors, fontSize, radius, spacing } from '../../../constants/theme';
import type { DraftExercise, ExerciseFormData } from '../../../types/exercise';
import { plural } from '../../../utils/plural';

export default function AddWorkoutScreen() {
  const [draft, setDraft] = useState<DraftExercise[]>([]);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const today = new Date();
  const dateLabel = today.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
  });
  const weekday = today.toLocaleDateString('ru-RU', { weekday: 'long' });
  const weekdayCapitalized = weekday.charAt(0).toUpperCase() + weekday.slice(1);

  const openAdd = () => {
    setEditingId(null);
    setSheetVisible(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const openEdit = (ex: DraftExercise) => {
    setEditingId(ex.tempId);
    setSheetVisible(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const removeExercise = (tempId: string) => {
    setDraft((prev) => prev.filter((e) => e.tempId !== tempId));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const upsertExercise = (data: ExerciseFormData) => {
    if (editingId) {
      setDraft((prev) =>
        prev.map((e) => (e.tempId === editingId ? { ...e, ...data } : e)),
      );
    } else {
      setDraft((prev) => [
        ...prev,
        { ...data, tempId: `${Date.now()}-${Math.random()}` },
      ]);
    }
    setSheetVisible(false);
    setEditingId(null);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.headerDate}>
          {weekdayCapitalized}, {dateLabel}
        </Text>
        <Text style={styles.headerSub}>
          {draft.length > 0
            ? `Тренировка · ${draft.length} ${plural(draft.length, ['упражнение', 'упражнения', 'упражнений'])}`
            : ''}
        </Text>
      </View>

      <FlatList
        data={draft}
        keyExtractor={(item) => item.tempId}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<EmptyState />}
        renderItem={({ item }) => (
          <ExerciseCard
            exercise={item}
            onEdit={() => openEdit(item)}
            onRemove={() => removeExercise(item.tempId)}
          />
        )}
        ListFooterComponent={
          <Pressable
            onPress={openAdd}
            style={({ pressed }) => [
              styles.addBtn,
              pressed && { opacity: 0.6 },
            ]}
          >
            <Ionicons name='add' size={22} color={colors.accent} />
            <Text style={styles.addBtnText}>Добавить упражнение</Text>
          </Pressable>
        }
      />

      <View style={styles.bottomBar}>
        <Pressable
          disabled
          style={({ pressed }) => [
            styles.saveBtn,
            styles.saveBtnDisabled,
            pressed && { opacity: 0.85 },
          ]}
        >
          <Ionicons name='checkmark' size={22} color={colors.textDim} />
          <Text style={[styles.saveBtnText, { color: colors.textDim }]}>
            Сохранить тренировку
          </Text>
        </Pressable>
      </View>

      <ExerciseSheet
        visible={sheetVisible}
        initial={
          editingId ? draft.find((e) => e.tempId === editingId) : undefined
        }
        onClose={() => {
          setSheetVisible(false);
          setEditingId(null);
        }}
        onSubmit={upsertExercise}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
  headerDate: { color: colors.text, fontSize: fontSize.xxl, fontWeight: '700' },
  headerSub: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  },
  listContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: 120,
    gap: spacing.md,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: 'dashed',
    marginTop: spacing.xs,
  },
  addBtnText: { color: colors.accent, fontSize: 15, fontWeight: '600' },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: spacing.xl,
    backgroundColor: colors.bg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.accent,
    paddingVertical: 18,
    borderRadius: radius.pill,
  },
  saveBtnDisabled: { backgroundColor: colors.cardSoft },
  saveBtnText: { color: colors.bg, fontSize: fontSize.md, fontWeight: '700' },
});
