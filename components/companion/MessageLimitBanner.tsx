import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, typography, spacing } from '@/theme';
import { borderRadius } from '@/theme/spacing';

/**
 * Message Limit Banner Component
 * T101: Add AI message limit tracking (5/month for free tier) with upgrade prompt
 */

interface MessageLimitBannerProps {
  used: number;
  limit: number;
  remaining: number;
  tier: string;
}

export function MessageLimitBanner({
  used,
  limit,
  remaining,
  tier,
}: MessageLimitBannerProps) {
  const router = useRouter();
  const isAtLimit = remaining === 0;
  const isNearLimit = remaining <= 2 && remaining > 0;
  const progressPercent = Math.min((used / limit) * 100, 100);

  const handleUpgrade = () => {
    router.push('/settings');
  };

  if (tier !== 'free') {
    return null;
  }

  return (
    <View
      style={[
        styles.container,
        isAtLimit && styles.containerError,
        isNearLimit && styles.containerWarning,
      ]}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons
              name={isAtLimit ? 'alert-circle' : 'chatbubbles-outline'}
              size={18}
              color={isAtLimit ? colors.danger : colors.primary}
            />
          </View>
          <Text
            style={[
              styles.title,
              isAtLimit && styles.titleError,
            ]}
          >
            {isAtLimit
              ? 'Monthly limit reached'
              : `${remaining} message${remaining !== 1 ? 's' : ''} left this month`}
          </Text>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBackground}>
            <View
              style={[
                styles.progressFill,
                { width: `${progressPercent}%` },
                isAtLimit && styles.progressFillError,
                isNearLimit && styles.progressFillWarning,
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {used}/{limit}
          </Text>
        </View>

        {(isAtLimit || isNearLimit) && (
          <TouchableOpacity
            style={styles.upgradeButton}
            onPress={handleUpgrade}
            accessibilityLabel="Upgrade to Pro"
            accessibilityRole="button"
          >
            <Ionicons
              name="arrow-up-circle"
              size={16}
              color={colors.primary}
            />
            <Text style={styles.upgradeText}>
              Upgrade to Pro for 50 messages/month
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  containerWarning: {
    borderColor: colors.warning,
    backgroundColor: colors.warning + '10',
  },
  containerError: {
    borderColor: colors.danger,
    backgroundColor: colors.danger + '10',
  },
  content: {
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  iconContainer: {
    marginRight: spacing.sm,
  },
  title: {
    ...typography.smallBold,
    color: colors.text.primary,
    flex: 1,
  },
  titleError: {
    color: colors.danger,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  progressBackground: {
    flex: 1,
    height: 6,
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
  },
  progressFillWarning: {
    backgroundColor: colors.warning,
  },
  progressFillError: {
    backgroundColor: colors.danger,
  },
  progressText: {
    ...typography.caption,
    color: colors.text.muted,
    minWidth: 40,
    textAlign: 'right',
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  upgradeText: {
    ...typography.small,
    color: colors.primary,
  },
});
