import { useReducer } from 'react';
import {
    Dimensions,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    View,
} from 'react-native';
import {
    GestureDetector,
    GestureHandlerRootView,
    usePanGesture,
} from 'react-native-gesture-handler';
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { colors, fontSize, radius, spacing } from '../constants/theme';
import type { DraftExercise, ExerciseFormData } from '../types/exercise';
import Stepper from './Stepper';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const DISMISS_THRESHOLD = 120;

type FormState = {
  name: string;
  sets: number;
  reps: number;
  weightText: string;
  noWeight: boolean;
};

type FormAction =
  | { type: 'RESET'; payload: FormState }
  | { type: 'SET_NAME'; value: string }
  | { type: 'SET_SETS'; value: number }
  | { type: 'SET_REPS'; value: number }
  | { type: 'SET_WEIGHT_TEXT'; value: string }
  | { type: 'TOGGLE_NO_WEIGHT'; value: boolean };

const initialState: FormState = {
  name: '',
  sets: 3,
  reps: 10,
  weightText: '',
  noWeight: true,
};

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'RESET':
      return action.payload;
    case 'SET_NAME':
      return { ...state, name: action.value };
    case 'SET_SETS':
      return { ...state, sets: action.value };
    case 'SET_REPS':
      return { ...state, reps: action.value };
    case 'SET_WEIGHT_TEXT':
      return { ...state, weightText: action.value };
    case 'TOGGLE_NO_WEIGHT':
      return {
        ...state,
        noWeight: action.value,
        weightText: action.value ? '' : state.weightText,
      };
    default:
      return state;
  }
}

function stateFromInitial(initial?: DraftExercise): FormState {
  if (!initial) return initialState;
  return {
    name: initial.name,
    sets: initial.sets,
    reps: initial.reps,
    weightText: initial.weight != null ? String(initial.weight) : '',
    noWeight: initial.weight == null,
  };
}

type Props = {
  visible: boolean;
  initial?: DraftExercise;
  onClose: () => void;
  onSubmit: (data: ExerciseFormData) => void;
};

export default function ExerciseSheet({
  visible,
  initial,
  onClose,
  onSubmit,
}: Props) {
  const [state, dispatch] = useReducer(formReducer, initialState, () =>
    stateFromInitial(initial),
  );

  const key = visible ? (initial?.tempId ?? 'new') : 'closed';
  const [lastKey, setLastKey] = useReducer(
    (_prev: string, next: string) => next,
    key,
  );
  if (key !== lastKey) {
    setLastKey(key);
    dispatch({ type: 'RESET', payload: stateFromInitial(initial) });
  }

  const translateY = useSharedValue(0);

  const panGesture = usePanGesture({
    activeOffsetY: [-10, 10],
    onUpdate: (event) => {
      if (event.translationY > 0) {
        translateY.value = event.translationY;
      }
    },
    onDeactivate: (event) => {
      if (event.translationY > DISMISS_THRESHOLD) {
        translateY.value = withTiming(SCREEN_HEIGHT, { duration: 200 }, () => {
          runOnJS(onClose)();
          translateY.value = 0;
        });
      } else {
        translateY.value = withSpring(0, { damping: 20, stiffness: 200 });
      }
    },
  });

  const animatedSheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const canSubmit = state.name.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    const parsed = parseFloat(state.weightText.replace(',', '.'));
    onSubmit({
      name: state.name.trim(),
      sets: state.sets,
      reps: state.reps,
      weight: state.noWeight || isNaN(parsed) ? null : parsed,
    });
  };

  return (
    <Modal
      visible={visible}
      animationType='slide'
      transparent
      onRequestClose={onClose}
    >
      <GestureHandlerRootView style={styles.root}>
        <Pressable style={styles.overlay} onPress={onClose} />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.wrapper}
          pointerEvents='box-none'
        >
          <GestureDetector gesture={panGesture}>
            <Animated.View style={[styles.sheet, animatedSheetStyle]}>
              <View style={styles.handleArea}>
                <View style={styles.handle} />
              </View>

              <Text style={styles.title}>
                {initial ? 'Редактировать' : 'Новое упражнение'}
              </Text>

              <TextInput
                placeholder='Например, Жим лёжа'
                placeholderTextColor={colors.textDim}
                value={state.name}
                onChangeText={(v) => dispatch({ type: 'SET_NAME', value: v })}
                style={styles.input}
                autoFocus
                returnKeyType='done'
              />

              <View style={styles.row}>
                <Stepper
                  label='Подходы'
                  value={state.sets}
                  onChange={(v) => dispatch({ type: 'SET_SETS', value: v })}
                  min={1}
                  max={20}
                />
                <Stepper
                  label='Повторения'
                  value={state.reps}
                  onChange={(v) => dispatch({ type: 'SET_REPS', value: v })}
                  min={1}
                  max={100}
                />
              </View>

              <View style={styles.weightRow}>
                <View style={styles.weightInputWrapper}>
                  <Text style={styles.smallLabel}>Вес (кг)</Text>
                  <TextInput
                    placeholder='—'
                    placeholderTextColor={colors.textDim}
                    value={state.noWeight ? '' : state.weightText}
                    onChangeText={(v) =>
                      dispatch({ type: 'SET_WEIGHT_TEXT', value: v })
                    }
                    keyboardType='decimal-pad'
                    editable={!state.noWeight}
                    style={[
                      styles.weightInput,
                      state.noWeight && { color: colors.textDim },
                    ]}
                  />
                </View>
                <View style={styles.toggle}>
                  <Text style={styles.smallLabel}>Без веса</Text>
                  <Switch
                    value={state.noWeight}
                    onValueChange={(v) =>
                      dispatch({ type: 'TOGGLE_NO_WEIGHT', value: v })
                    }
                    trackColor={{
                      false: colors.cardSoft,
                      true: colors.accentDim,
                    }}
                    thumbColor={
                      state.noWeight ? colors.accent : colors.textMuted
                    }
                  />
                </View>
              </View>

              <Pressable
                onPress={handleSubmit}
                disabled={!canSubmit}
                style={({ pressed }) => [
                  styles.submit,
                  !canSubmit && { backgroundColor: colors.cardSoft },
                  pressed && { opacity: 0.85 },
                ]}
              >
                <Text
                  style={[
                    styles.submitText,
                    !canSubmit && { color: colors.textDim },
                  ]}
                >
                  {initial ? 'Сохранить' : 'Добавить в сессию'}
                </Text>
              </Pressable>
            </Animated.View>
          </GestureDetector>
        </KeyboardAvoidingView>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  overlay: { flex: 1, backgroundColor: colors.overlay },
  wrapper: { justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.xl,
    paddingBottom: 32,
    gap: spacing.lg,
  },
  handleArea: {
    alignItems: 'center',
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
  },
  title: { color: colors.text, fontSize: fontSize.xl, fontWeight: '700' },
  input: {
    backgroundColor: colors.cardSoft,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    color: colors.text,
    fontSize: fontSize.md,
  },
  row: { flexDirection: 'row', gap: spacing.md },
  weightRow: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-end' },
  weightInputWrapper: {
    flex: 1,
    backgroundColor: colors.cardSoft,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  smallLabel: { color: colors.textMuted, fontSize: fontSize.xs },
  weightInput: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: '700',
    padding: 0,
    height: 36,
  },
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.cardSoft,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    height: 84,
  },
  submit: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.lg,
    borderRadius: radius.lg,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  submitText: { color: colors.bg, fontSize: fontSize.md, fontWeight: '700' },
});
