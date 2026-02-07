import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing } from '@/theme';

/**
 * Budget Screen - Placeholder
 * Will be fully implemented in Phase 4 (US2)
 */
export default function BudgetScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Budget</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.placeholder}>
          Budget tracking coming in Phase 4
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.md,
  },
  title: {
    ...typography.h1,
    color: colors.text.primary,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    ...typography.body,
    color: colors.text.muted,
  },
});
