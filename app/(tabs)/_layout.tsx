import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '@/theme';

/**
 * Simple icon component (placeholder for actual icons)
 */
function TabIcon({
  name,
  focused,
}: {
  name: string;
  focused: boolean;
}) {
  const icons: Record<string, string> = {
    home: '🏠',
    budget: '💰',
    debts: '📊',
    companion: '💬',
    more: '⚙️',
  };

  return (
    <Text style={[styles.icon, focused && styles.iconFocused]}>
      {icons[name] || '•'}
    </Text>
  );
}

/**
 * Main Tab Navigator Layout
 * Contains Home, Budget, Debts, Shift (Companion), and More tabs
 */
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text.muted,
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <TabIcon name="home" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="budget"
        options={{
          title: 'Budget',
          tabBarIcon: ({ focused }) => (
            <TabIcon name="budget" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="debts"
        options={{
          title: 'Debts',
          tabBarIcon: ({ focused }) => (
            <TabIcon name="debts" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="companion"
        options={{
          title: 'Shift',
          tabBarIcon: ({ focused }) => (
            <TabIcon name="companion" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          tabBarIcon: ({ focused }) => (
            <TabIcon name="more" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
    height: 65,
  },
  tabBarLabel: {
    ...typography.caption,
    marginTop: 2,
  },
  icon: {
    fontSize: 22,
    opacity: 0.6,
  },
  iconFocused: {
    opacity: 1,
  },
});
