import { router, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getWorkoutDates } from '../../../api/workouts';
import { colors, fontSize, spacing } from '../../../constants/theme';

LocaleConfig.locales['ru'] = {
  monthNames: [
    'Январь',
    'Февраль',
    'Март',
    'Апрель',
    'Май',
    'Июнь',
    'Июль',
    'Август',
    'Сентябрь',
    'Октябрь',
    'Ноябрь',
    'Декабрь',
  ],
  monthNamesShort: [
    'Янв',
    'Фев',
    'Мар',
    'Апр',
    'Май',
    'Июн',
    'Июл',
    'Авг',
    'Сен',
    'Окт',
    'Ноя',
    'Дек',
  ],
  dayNames: [
    'Воскресенье',
    'Понедельник',
    'Вторник',
    'Среда',
    'Четверг',
    'Пятница',
    'Суббота',
  ],
  dayNamesShort: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
  today: 'Сегодня',
};

LocaleConfig.defaultLocale = 'ru';

export default function CalendarScreen() {
  const db = useSQLiteContext();
  const [markedDates, setMarkedDates] = useState({});

  useFocusEffect(
    useCallback(() => {
      const loadDates = async () => {
        try {
          const dates = await getWorkoutDates(db);

          const marked: Record<string, any> = {};
          dates.forEach((date) => {
            marked[date] = {
              customStyles: {
                container: {
                  backgroundColor: colors.cardSoft,
                  borderRadius: 16,
                  justifyContent: 'center',
                  alignItems: 'center',
                },
                text: {
                  color: colors.accent,
                  fontWeight: 'bold',
                },
              },
            };
          });
          setMarkedDates(marked);

          setMarkedDates(marked);
        } catch (e) {
          console.error('Ошибка загрузки дат для календаря:', e);
        }
      };

      loadDates();
    }, [db]),
  );

  const handleDayPress = (day: { dateString: string }) => {
    router.navigate({
      pathname: '/list',
      params: { date: day.dateString },
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.title}>Календарь</Text>
        <Text style={styles.subtitle}>Дни с тренировками отмечены точкой</Text>
      </View>

      <Calendar
        hideExtraDays={true}
        firstDay={1}
        markedDates={markedDates}
        markingType={'custom'}
        theme={{
          backgroundColor: colors.bg,
          calendarBackground: colors.bg,

          textSectionTitleColor: colors.textMuted,
          dayTextColor: colors.text,
          textDisabledColor: colors.textDim,
          monthTextColor: colors.text,

          todayTextColor: colors.accent,
          arrowColor: colors.accent,

          dotColor: colors.accent,
          selectedDotColor: colors.accent,

          selectedDayBackgroundColor: colors.accent,
          selectedDayTextColor: colors.bg,
        }}
        onDayPress={handleDayPress}
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
  title: { color: colors.text, fontSize: fontSize.xxl, fontWeight: '700' },
  subtitle: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  },
});
