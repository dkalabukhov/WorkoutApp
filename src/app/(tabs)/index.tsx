import Ionicons from '@react-native-vector-icons/ionicons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const BG = '#0F0F12';
const CARD = '#1C1C22';
const CARD_SOFT = '#26262E';
const BORDER = '#2A2A33';
const TEXT = '#FFFFFF';
const TEXT_MUTED = '#8E8E96';
const TEXT_DIM = '#6B6B75';
const ACCENT = '#C6FF3D';

export default function AddWorkoutScreen() {
  const today = new Date();
  const dateLabel = today.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
  });
  const weekday = today.toLocaleDateString('ru-RU', { weekday: 'long' });
  const weekdayCapitalized = weekday.charAt(0).toUpperCase() + weekday.slice(1);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.headerDate}>
          {weekdayCapitalized}, {dateLabel}
        </Text>
        <Text style={styles.headerSub}>Тренировка · пусто</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        <EmptyState />

        <Pressable
          style={({ pressed }) => [styles.addBtn, pressed && { opacity: 0.6 }]}
        >
          <Ionicons name='add' size={22} color={ACCENT} />
          <Text style={styles.addBtnText}>Добавить упражнение</Text>
        </Pressable>
      </ScrollView>

      <View style={styles.bottomBar}>
        <Pressable
          disabled
          style={({ pressed }) => [
            styles.saveBtn,
            styles.saveBtnDisabled,
            pressed && { opacity: 0.85 },
          ]}
        >
          <Ionicons name='checkmark' size={22} color={TEXT_DIM} />
          <Text style={[styles.saveBtnText, { color: TEXT_DIM }]}>
            Сохранить тренировку
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function EmptyState() {
  return (
    <View style={styles.empty}>
      <Ionicons name='barbell-outline' size={56} color='#3A3A44' />
      <Text style={styles.emptyTitle}>Начни тренировку</Text>
      <Text style={styles.emptyText}>
        Добавь первое упражнение —{'\n'}оно появится здесь
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },

  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  headerDate: {
    color: TEXT,
    fontSize: 26,
    fontWeight: '700',
  },
  headerSub: {
    color: TEXT_MUTED,
    fontSize: 14,
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyTitle: {
    color: TEXT,
    fontSize: 18,
    fontWeight: '600',
  },
  emptyText: {
    color: TEXT_MUTED,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: BORDER,
    borderStyle: 'dashed',
    marginTop: 4,
  },
  addBtnText: {
    color: ACCENT,
    fontSize: 15,
    fontWeight: '600',
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 20,
    backgroundColor: BG,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: ACCENT,
    paddingVertical: 18,
    borderRadius: 28,
  },
  saveBtnDisabled: {
    backgroundColor: CARD_SOFT,
  },
  saveBtnText: {
    color: BG,
    fontSize: 16,
    fontWeight: '700',
  },
});
