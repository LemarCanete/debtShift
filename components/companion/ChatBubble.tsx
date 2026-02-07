import { View, Text, StyleSheet } from 'react-native';
import { format } from 'date-fns';
import { colors, typography, spacing } from '@/theme';
import { borderRadius } from '@/theme/spacing';

/**
 * Chat Bubble Component
 * T097: Create components/companion/ChatBubble.tsx with user/assistant styling
 */

interface ChatBubbleProps {
  content: string;
  role: 'user' | 'assistant';
  timestamp?: string;
  isOptimistic?: boolean;
}

export function ChatBubble({
  content,
  role,
  timestamp,
  isOptimistic = false,
}: ChatBubbleProps) {
  const isUser = role === 'user';

  return (
    <View
      style={[
        styles.container,
        isUser ? styles.userContainer : styles.assistantContainer,
      ]}
    >
      {!isUser && (
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>S</Text>
          </View>
        </View>
      )}
      <View
        style={[
          styles.bubble,
          isUser ? styles.userBubble : styles.assistantBubble,
          isOptimistic && styles.optimisticBubble,
        ]}
      >
        <Text
          style={[
            styles.content,
            isUser ? styles.userContent : styles.assistantContent,
          ]}
        >
          {content}
        </Text>
        {timestamp && (
          <Text
            style={[
              styles.timestamp,
              isUser ? styles.userTimestamp : styles.assistantTimestamp,
            ]}
          >
            {format(new Date(timestamp), 'h:mm a')}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  userContainer: {
    justifyContent: 'flex-end',
  },
  assistantContainer: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    marginRight: spacing.sm,
    alignSelf: 'flex-end',
    marginBottom: spacing.xs,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    ...typography.bodyBold,
    color: colors.text.inverse,
    fontSize: 14,
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.xl,
  },
  userBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: borderRadius.sm,
  },
  assistantBubble: {
    backgroundColor: colors.surface,
    borderBottomLeftRadius: borderRadius.sm,
  },
  optimisticBubble: {
    opacity: 0.7,
  },
  content: {
    ...typography.body,
    lineHeight: 22,
  },
  userContent: {
    color: colors.text.inverse,
  },
  assistantContent: {
    color: colors.text.primary,
  },
  timestamp: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
  userTimestamp: {
    color: colors.text.inverse,
    opacity: 0.7,
    textAlign: 'right',
  },
  assistantTimestamp: {
    color: colors.text.muted,
  },
});
