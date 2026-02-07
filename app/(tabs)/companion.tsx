import { useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing } from '@/theme';
import { borderRadius } from '@/theme/spacing';
import {
  ChatBubble,
  MessageInput,
  SuggestedQuestions,
  TypingIndicator,
  MessageLimitBanner,
} from '@/components/companion';
import {
  useChatHistory,
  useMessageUsage,
  useSendMessage,
  useCanSendMessage,
  useIsAtMessageLimit,
} from '@/hooks/useChat';
import { useChatStore } from '@/stores/useChatStore';
import type { ChatMessage } from '@/services/ai';

/**
 * AI Companion "Shift" Screen
 * T100: Create app/(tabs)/companion.tsx with chat interface
 */

export default function CompanionScreen() {
  const flatListRef = useRef<FlatList>(null);
  const { messages, isTyping, usage } = useChatStore();
  const { sendMessage, isLoading } = useSendMessage();
  const canSend = useCanSendMessage();
  const isAtLimit = useIsAtMessageLimit();

  // Load chat history on mount
  useChatHistory();
  useMessageUsage();

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length, isTyping]);

  const handleSend = useCallback(
    (message: string) => {
      sendMessage(message);
    },
    [sendMessage]
  );

  const handleSelectQuestion = useCallback(
    (question: string) => {
      sendMessage(question);
    },
    [sendMessage]
  );

  const renderMessage = useCallback(
    ({ item }: { item: ChatMessage }) => (
      <ChatBubble
        content={item.content}
        role={item.role}
        timestamp={item.created_at}
        isOptimistic={item.id.startsWith('temp-')}
      />
    ),
    []
  );

  const keyExtractor = useCallback((item: ChatMessage) => item.id, []);

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.avatarLarge}>
        <Text style={styles.avatarLargeText}>S</Text>
      </View>
      <Text style={styles.welcomeTitle}>Meet Shift</Text>
      <Text style={styles.welcomeText}>
        I'm your personal debt-free companion. Ask me anything about your
        financial journey - I'm here to help and encourage you every step of the
        way.
      </Text>
    </View>
  );

  const renderHeader = () => {
    if (messages.length === 0) {
      return renderEmptyState();
    }
    return null;
  };

  const renderFooter = () => <TypingIndicator isVisible={isTyping} />;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerAvatar}>
            <Text style={styles.headerAvatarText}>S</Text>
          </View>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Shift</Text>
            <Text style={styles.headerSubtitle}>Your AI Companion</Text>
          </View>
        </View>

        {/* Message Usage Banner */}
        {usage && usage.tier === 'free' && (
          <MessageLimitBanner
            used={usage.used}
            limit={usage.limit}
            remaining={usage.remaining}
            tier={usage.tier}
          />
        )}

        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={keyExtractor}
          ListHeaderComponent={renderHeader}
          ListFooterComponent={renderFooter}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="interactive"
        />

        {/* Suggested Questions (only show when no messages) */}
        {messages.length === 0 && (
          <SuggestedQuestions
            onSelect={handleSelectQuestion}
            disabled={!canSend || isLoading}
          />
        )}

        {/* Message Input */}
        <MessageInput
          onSend={handleSend}
          isLoading={isLoading}
          disabled={isAtLimit}
          placeholder={
            isAtLimit
              ? 'Upgrade to continue chatting...'
              : 'Ask Shift anything...'
          }
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerAvatarText: {
    ...typography.bodyBold,
    color: colors.text.inverse,
    fontSize: 18,
  },
  headerContent: {
    marginLeft: spacing.sm,
  },
  headerTitle: {
    ...typography.bodyBold,
    color: colors.text.primary,
  },
  headerSubtitle: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  messagesList: {
    flexGrow: 1,
    paddingVertical: spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing['2xl'],
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  avatarLargeText: {
    ...typography.hero,
    color: colors.text.inverse,
  },
  welcomeTitle: {
    ...typography.title,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  welcomeText: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});
