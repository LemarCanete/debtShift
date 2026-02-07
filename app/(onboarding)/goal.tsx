import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { colors, typography, spacing } from '@/theme';
import { Button, Card } from '@/components/ui';
import { useAuthStore } from '@/stores/useAuthStore';
import { PAYOFF_STRATEGIES } from '@/utils/constants';

type Goal = 'debt_free_asap' | 'emergency_fund' | 'both';
type PayoffStrategy = 'snowball' | 'avalanche';

interface GoalOption {
  value: Goal;
  label: string;
  description: string;
  icon: string;
}

const GOAL_OPTIONS: GoalOption[] = [
  {
    value: 'debt_free_asap',
    label: 'Get Debt Free ASAP',
    description: 'Focus all extra money on paying off debt as quickly as possible',
    icon: '🎯',
  },
  {
    value: 'emergency_fund',
    label: 'Build Emergency Fund',
    description: 'Build a safety net first, then tackle debt aggressively',
    icon: '🛡️',
  },
  {
    value: 'both',
    label: 'Balance Both',
    description: 'Split extra money between savings and debt payoff',
    icon: '⚖️',
  },
];

/**
 * Onboarding Goal Screen - Select primary goal, strategy, and motivation
 */
export default function OnboardingGoalScreen() {
  const [goal, setGoal] = useState<Goal | null>(null);
  const [strategy, setStrategy] = useState<PayoffStrategy | null>(null);
  const [whyIStarted, setWhyIStarted] = useState('');
  const [errors, setErrors] = useState<{
    goal?: string;
    strategy?: string;
  }>({});

  const { updateProfile, isLoading } = useAuthStore();

  const validateForm = () => {
    const fieldErrors: typeof errors = {};

    if (!goal) {
      fieldErrors.goal = 'Please select your primary goal';
    }

    if (!strategy) {
      fieldErrors.strategy = 'Please select a payoff strategy';
    }

    setErrors(fieldErrors);
    return Object.keys(fieldErrors).length === 0;
  };

  const handleContinue = async () => {
    if (!validateForm()) return;

    const success = await updateProfile({
      payoff_strategy: strategy,
      why_i_started: whyIStarted.trim() || null,
    });

    if (success) {
      router.push('/(onboarding)/first-debt');
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <Text style={styles.step}>Step 3 of 4</Text>
        <Text style={styles.title}>Your Goals</Text>
        <Text style={styles.subtitle}>
          Let's personalize your debt-free journey
        </Text>
      </View>

      {/* Primary Goal Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>What's your primary goal?</Text>

        <View style={styles.optionsGrid}>
          {GOAL_OPTIONS.map((option) => (
            <Pressable
              key={option.value}
              onPress={() => {
                setGoal(option.value);
                if (errors.goal) setErrors({ ...errors, goal: undefined });
              }}
            >
              <Card
                variant={goal === option.value ? 'elevated' : 'default'}
                style={[
                  styles.optionCard,
                  goal === option.value && styles.optionCardSelected,
                ]}
              >
                <Text style={styles.optionIcon}>{option.icon}</Text>
                <Text style={styles.optionLabel}>{option.label}</Text>
                <Text style={styles.optionDescription}>{option.description}</Text>
              </Card>
            </Pressable>
          ))}
        </View>

        {errors.goal && <Text style={styles.error}>{errors.goal}</Text>}
      </View>

      {/* Payoff Strategy Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>How do you want to attack your debt?</Text>

        <View style={styles.optionsGrid}>
          {PAYOFF_STRATEGIES.map((option) => (
            <Pressable
              key={option.value}
              onPress={() => {
                setStrategy(option.value as PayoffStrategy);
                if (errors.strategy) setErrors({ ...errors, strategy: undefined });
              }}
            >
              <Card
                variant={strategy === option.value ? 'elevated' : 'default'}
                style={[
                  styles.strategyCard,
                  strategy === option.value && styles.optionCardSelected,
                ]}
              >
                <View style={styles.strategyHeader}>
                  <Text style={styles.strategyLabel}>{option.label}</Text>
                  {option.value === 'avalanche' && (
                    <View style={styles.recommendedBadge}>
                      <Text style={styles.recommendedText}>Saves Most</Text>
                    </View>
                  )}
                  {option.value === 'snowball' && (
                    <View style={styles.quickWinsBadge}>
                      <Text style={styles.quickWinsText}>Quick Wins</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.strategyDescription}>{option.description}</Text>
              </Card>
            </Pressable>
          ))}
        </View>

        {errors.strategy && <Text style={styles.error}>{errors.strategy}</Text>}
      </View>

      {/* Why I Started */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Why did you start this journey?</Text>
        <Text style={styles.sectionSubtitle}>
          Optional, but helpful on tough days
        </Text>

        <View style={styles.textAreaContainer}>
          <TextInput
            style={styles.textArea}
            value={whyIStarted}
            onChangeText={setWhyIStarted}
            placeholder="I want to be debt-free so I can..."
            placeholderTextColor={colors.text.muted}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            maxLength={1000}
          />
          <Text style={styles.charCount}>
            {whyIStarted.length}/1000
          </Text>
        </View>

        <View style={styles.promptsContainer}>
          <Text style={styles.promptsTitle}>Ideas:</Text>
          <View style={styles.prompts}>
            {[
              'Provide for my family',
              'Travel without worry',
              'Sleep peacefully',
              'Build wealth',
              'Retire early',
            ].map((prompt) => (
              <Pressable
                key={prompt}
                onPress={() =>
                  setWhyIStarted(whyIStarted ? `${whyIStarted} ${prompt}.` : `${prompt}.`)
                }
                style={styles.promptChip}
              >
                <Text style={styles.promptText}>{prompt}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          onPress={handleContinue}
          isLoading={isLoading}
          isDisabled={!goal || !strategy}
          fullWidth
          size="lg"
        >
          Continue
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  header: {
    marginBottom: spacing.xl,
  },
  step: {
    ...typography.small,
    color: colors.primary,
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  title: {
    ...typography.h1,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.text.secondary,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  sectionSubtitle: {
    ...typography.small,
    color: colors.text.muted,
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
  },
  optionsGrid: {
    gap: spacing.sm,
  },
  optionCard: {
    padding: spacing.md,
  },
  optionCardSelected: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  optionIcon: {
    fontSize: 28,
    marginBottom: spacing.xs,
  },
  optionLabel: {
    ...typography.bodyLarge,
    color: colors.text.primary,
    fontWeight: '600',
    marginBottom: spacing.xxs,
  },
  optionDescription: {
    ...typography.small,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  strategyCard: {
    padding: spacing.md,
  },
  strategyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  strategyLabel: {
    ...typography.bodyLarge,
    color: colors.text.primary,
    fontWeight: '600',
  },
  strategyDescription: {
    ...typography.small,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  recommendedBadge: {
    backgroundColor: colors.success + '20',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: spacing.borderRadius.sm,
  },
  recommendedText: {
    ...typography.caption,
    color: colors.success,
    fontWeight: '600',
  },
  quickWinsBadge: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: spacing.borderRadius.sm,
  },
  quickWinsText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  textAreaContainer: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.borderRadius.md,
    overflow: 'hidden',
  },
  textArea: {
    ...typography.body,
    color: colors.text.primary,
    padding: spacing.md,
    minHeight: 100,
  },
  charCount: {
    ...typography.caption,
    color: colors.text.muted,
    textAlign: 'right',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  promptsContainer: {
    marginTop: spacing.md,
  },
  promptsTitle: {
    ...typography.small,
    color: colors.text.muted,
    marginBottom: spacing.sm,
  },
  prompts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  promptChip: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: spacing.borderRadius.full,
  },
  promptText: {
    ...typography.small,
    color: colors.text.secondary,
  },
  error: {
    ...typography.small,
    color: colors.error,
    marginTop: spacing.sm,
  },
  footer: {
    marginTop: 'auto',
    paddingTop: spacing.lg,
  },
});
