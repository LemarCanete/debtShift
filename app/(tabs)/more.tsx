import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing } from '@/theme';
import { Card } from '@/components/ui';

/**
 * More/Settings Screen - Placeholder
 * Will be fully implemented in Phase 14 (US12)
 */
export default function MoreScreen() {
  const menuItems = [
    { icon: '📖', label: 'Learn', description: 'Debt education' },
    { icon: '📅', label: 'Planner', description: 'Payment calendar' },
    { icon: '🔔', label: 'Reminders', description: 'Notifications' },
    { icon: '📔', label: 'Journal', description: 'Your debt journey' },
    { icon: '⚙️', label: 'Settings', description: 'App preferences' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>More</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {menuItems.map((item, index) => (
          <Card key={index} style={styles.menuItem}>
            <View style={styles.menuItemContent}>
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuDescription}>{item.description}</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </View>
          </Card>
        ))}
        <Text style={styles.placeholder}>
          Full settings coming in Phase 14
        </Text>
      </ScrollView>
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
  scrollContent: {
    padding: spacing.md,
    paddingTop: 0,
  },
  menuItem: {
    marginBottom: spacing.sm,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuLabel: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '600',
  },
  menuDescription: {
    ...typography.small,
    color: colors.text.secondary,
  },
  chevron: {
    fontSize: 20,
    color: colors.text.muted,
  },
  placeholder: {
    ...typography.small,
    color: colors.text.muted,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
