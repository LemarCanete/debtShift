import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing } from '@/theme';
import { borderRadius } from '@/theme/spacing';
import { SUGGESTED_QUESTIONS } from '@/services/ai';

/**
 * Suggested Questions Component
 * T099: Create components/companion/SuggestedQuestions.tsx with tap-to-ask quick questions
 */

interface SuggestedQuestionsProps {
  onSelect: (question: string) => void;
  disabled?: boolean;
}

const CATEGORY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  strategy: 'bulb-outline',
  support: 'heart-outline',
  celebration: 'trophy-outline',
  education: 'school-outline',
};

const CATEGORY_COLORS: Record<string, string> = {
  strategy: colors.primary,
  support: colors.success,
  celebration: '#FFD700',
  education: '#8B5CF6',
};

export function SuggestedQuestions({
  onSelect,
  disabled = false,
}: SuggestedQuestionsProps) {
  const handlePress = (text: string) => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect(text);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quick Questions</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {SUGGESTED_QUESTIONS.map((question) => (
          <TouchableOpacity
            key={question.id}
            style={[
              styles.questionButton,
              disabled && styles.questionButtonDisabled,
            ]}
            onPress={() => handlePress(question.text)}
            disabled={disabled}
            accessibilityLabel={question.text}
            accessibilityRole="button"
          >
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: CATEGORY_COLORS[question.category] + '20' },
              ]}
            >
              <Ionicons
                name={CATEGORY_ICONS[question.category] || 'chatbubble-outline'}
                size={16}
                color={CATEGORY_COLORS[question.category]}
              />
            </View>
            <Text
              style={[
                styles.questionText,
                disabled && styles.questionTextDisabled,
              ]}
              numberOfLines={2}
            >
              {question.text}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.md,
  },
  title: {
    ...typography.smallBold,
    color: colors.text.secondary,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  questionButton: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: 200,
  },
  questionButtonDisabled: {
    opacity: 0.5,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  questionText: {
    ...typography.small,
    color: colors.text.primary,
    flex: 1,
  },
  questionTextDisabled: {
    color: colors.text.muted,
  },
});
