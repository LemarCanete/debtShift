import React, { useEffect } from 'react';
import {
  View,
  Modal as RNModal,
  Pressable,
  Text,
  StyleSheet,
  ViewStyle,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { colors, typography, spacing } from '@/theme';

interface ModalProps {
  isVisible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
  closeOnBackdrop?: boolean;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
}

/**
 * Modal component with backdrop and slide-up animation
 */
export function Modal({
  isVisible,
  onClose,
  title,
  children,
  showCloseButton = true,
  closeOnBackdrop = true,
  style,
  contentStyle,
}: ModalProps) {
  const backdropOpacity = useSharedValue(0);
  const translateY = useSharedValue(300);

  useEffect(() => {
    if (isVisible) {
      backdropOpacity.value = withTiming(1, { duration: 200 });
      translateY.value = withSpring(0, {
        damping: 20,
        stiffness: 300,
      });
    } else {
      backdropOpacity.value = withTiming(0, { duration: 150 });
      translateY.value = withTiming(300, { duration: 200 });
    }
  }, [isVisible]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const handleBackdropPress = () => {
    if (closeOnBackdrop) {
      onClose();
    }
  };

  return (
    <RNModal
      visible={isVisible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.container}>
          <Animated.View style={[styles.backdrop, backdropStyle]}>
            <Pressable style={styles.backdropPressable} onPress={handleBackdropPress} />
          </Animated.View>

          <Animated.View style={[styles.content, contentAnimatedStyle, style]}>
            {(title || showCloseButton) && (
              <View style={styles.header}>
                {title && <Text style={styles.title}>{title}</Text>}
                {showCloseButton && (
                  <Pressable
                    style={styles.closeButton}
                    onPress={onClose}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel="Close modal"
                  >
                    <Text style={styles.closeButtonText}>✕</Text>
                  </Pressable>
                )}
              </View>
            )}

            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={[styles.scrollContent, contentStyle]}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {children}
            </ScrollView>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },

  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },

  backdropPressable: {
    flex: 1,
  },

  content: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: spacing.borderRadius.xl,
    borderTopRightRadius: spacing.borderRadius.xl,
    maxHeight: '90%',
    minHeight: 100,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },

  title: {
    ...typography.h3,
    color: colors.text.primary,
    flex: 1,
  },

  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceHover,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },

  closeButtonText: {
    color: colors.text.secondary,
    fontSize: 16,
    fontWeight: '600',
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
});

export default Modal;
