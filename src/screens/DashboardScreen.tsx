import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, ScrollView, RefreshControl} from 'react-native';
import {useTheme} from '@context/ThemeContext';
import {useResponsive} from '@hooks/useResponsive';
import {dashboardService} from '@services/dashboardService';
import {DashboardMetrics} from '../types/index';
import {MetricCard} from '@components/MetricCard';
import {LoadingSpinner} from '@components/LoadingSpinner';

export const DashboardScreen: React.FC = () => {
  const {colors} = useTheme();
  const {isSmall} = useResponsive();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadMetrics = async () => {
    try {
      const data = await dashboardService.getMetrics();
      setMetrics(data);
    } catch (error) {
      console.error('Error loading metrics:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadMetrics();
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!metrics) {
    return (
      <View style={[styles.container, {backgroundColor: colors.background}]}>
        <Text style={[styles.errorText, {color: colors.textSecondary}]}>
          Error loading metrics
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, {backgroundColor: colors.background}]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
      <View style={styles.content}>
        <Text style={[styles.title, {color: colors.text}]}>Dashboard</Text>

        <View style={[styles.metricsGrid, isSmall && styles.metricsGridSmall]}>
          <MetricCard
            title="Companies"
            value={metrics.totalCompanies}
            color={colors.primary}
          />
          <MetricCard
            title="Pending Reminders"
            value={metrics.pendingReminders}
            color={colors.warning}
          />
          <MetricCard
            title="Overdue Reminders"
            value={metrics.overdueReminders}
            color={colors.error}
          />
          <MetricCard
            title="Upcoming Reminders"
            value={metrics.upcomingReminders}
            color={colors.success}
          />
          <MetricCard
            title="Personal Tasks"
            value={metrics.totalPersonalTasks}
            color={colors.secondary}
          />
          <MetricCard
            title="Completed Tasks"
            value={metrics.completedPersonalTasks}
            subtitle={`of ${metrics.totalPersonalTasks}`}
            color={colors.success}
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricsGridSmall: {
    flexDirection: 'column',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 32,
  },
});

