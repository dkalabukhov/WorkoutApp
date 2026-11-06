import DateTimePicker from '@react-native-community/datetimepicker';
import Ionicons from '@react-native-vector-icons/ionicons';
import * as Haptics from 'expo-haptics';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, fontSize, radius, spacing } from '../constants/theme';
import type { DraftExercise, ExerciseFormData } from '../types/exercise';
import { plural } from '../utils/plural';
import EmptyState from './EmptyState';
import ExerciseCard from './ExerciseCard';
import ExerciseSheet from './ExerciseSheet';

type Props = {
  initialExercises?: DraftExercise[];
  initialDate?: Date;
  title?: string;
  submitLabel?: string;
  onSubmit: (exercises: DraftExercise[], dateStr: string) => Promise<void>;
  resetKey?: number;
  bottomAction?: ReactNode;
};

export default function WorkoutEditor({
  initialExercises = [],
  initialDate,
  title = 'Тренировка',
  submitLabel = 'Сохранить тренировку',
  onSubmit,
  resetKey = 0,
  bottomAction,
}: Props) {
  const [draft, setDraft] = useState<DraftExercise[]>(initialExercises);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState(initialDate ?? new Date());
  const [datePickerVisible, setDatePickerVisible] = useState(false);

  useEffect(() => {
    setDraft(initialExercises);
    setSelectedDate(initialDate ?? new Date());
  }, [resetKey]);

  const onChangeDate = (event: any, date?: Date) => {
    if (Platform.OS === 'android') setDatePickerVisible(false);
    if (event.type === 'set' && date) {
      setSelectedDate(date);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const sel = new Date(selectedDate);
  sel.setHours(0, 0, 0, 0);
  const diffDays = Math.round((sel.getTime() - today.getTime()) / 86400000);

  let dateLabel: string;
  if (diffDays === 0) {
    dateLabel = `Сегодня, ${selectedDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}`;
  } else if (diffDays === -1) {
    dateLabel = `Вчера, ${selectedDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}`;
  } else if (diffDays === 1) {
    dateLabel = `Завтра, ${selectedDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}`;
  } else {
    dateLabel = selectedDate.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  const weekday = selectedDate
    .toLocaleDateString('ru-RU', { weekday: 'long' })
    .replace(/^./, (c) => c.toUpperCase());

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

  const handleSave = async () => {
    if (draft.length === 0 || saving) return;
    setSaving(true);
    try {
      const y = selectedDate.getFullYear();
      const m = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const d = String(selectedDate.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${d}`;

      await onSubmit(draft, dateStr);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error(error);
      Alert.alert(
        'Ошибка',
        'Не удалось сохранить тренировку. Попробуйте ещё раз.',
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setSaving(false);
    }
  };

  const isEmpty = draft.length === 0;

  return (
    <SafeAreaView
      style={styles.safe}
      edges={['top', 'left', 'right', 'bottom']}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Pressable
            onPress={() => setDatePickerVisible(true)}
            style={({ pressed }) => [
              styles.dateBtn,
              pressed && { opacity: 0.6 },
            ]}
          >
            <Text style={styles.headerDate}>{dateLabel}</Text>
            <Ionicons name='chevron-down' size={20} color={colors.accent} />
          </Pressable>
          <Text style={styles.headerSub}>
            {weekday} ·{' '}
            {isEmpty
              ? 'пусто'
              : `${draft.length} ${plural(draft.length, ['упражнение', 'упражнения', 'упражнений'])}`}
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
      </KeyboardAvoidingView>

      <View style={styles.bottomBar}>
        {bottomAction}
        <Pressable
          onPress={handleSave}
          disabled={isEmpty || saving}
          style={({ pressed }) => [
            styles.saveBtn,
            (isEmpty || saving) && styles.saveBtnDisabled,
            pressed && { opacity: 0.85 },
          ]}
        >
          <Ionicons
            name={saving ? 'hourglass-outline' : 'checkmark'}
            size={22}
            color={isEmpty || saving ? colors.textDim : colors.bg}
          />
          <Text
            style={[
              styles.saveBtnText,
              (isEmpty || saving) && { color: colors.textDim },
            ]}
          >
            {saving ? 'Сохранение…' : submitLabel}
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

      {datePickerVisible && (
        <DateTimePicker
          value={selectedDate}
          mode='date'
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onChangeDate}
          themeVariant='dark'
        />
      )}
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
  title: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  dateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    alignSelf: 'flex-start',
  },
  headerDate: { color: colors.text, fontSize: fontSize.xxl, fontWeight: '700' },
  headerSub: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  },
  listContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
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
