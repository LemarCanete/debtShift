import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { router, Stack } from 'expo-router';
import { colors } from '@/theme';
import { DebtForm } from '@/components/debt';
import { useCreateDebt } from '@/hooks/useDebts';
import type { TablesInsert } from '@/types/database';

/**
 * New Debt Screen - Create a new debt
 */
export default function NewDebtScreen() {
  const createMutation = useCreateDebt();

  const handleSubmit = async (data: Omit<TablesInsert<'debts'>, 'user_id'>) => {
    try {
      await createMutation.mutateAsync(data);
      router.back();
      return true;
    } catch {
      return false;
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Add New Debt' }} />
      <View style={styles.container}>
        <DebtForm
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
          isLoading={createMutation.isPending}
          submitLabel="Add Debt"
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
