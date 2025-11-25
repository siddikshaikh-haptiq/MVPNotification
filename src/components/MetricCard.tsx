import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useTheme} from '@context/ThemeContext';
import {Card} from './Card';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  color?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  color,
}) => {
  const {colors} = useTheme();
  const cardColor = color || colors.primary;

  return (
    <Card style={[styles.metricCard, {borderLeftColor: cardColor, borderLeftWidth: 4}]}>
      <Text style={[styles.title, {color: colors.textSecondary}]}>{title}</Text>
      <Text style={[styles.value, {color: cardColor}]}>{value}</Text>
      {subtitle && (
        <Text style={[styles.subtitle, {color: colors.textSecondary}]}>{subtitle}</Text>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  metricCard: {
    padding: 16,
    marginHorizontal: 8,
    marginVertical: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  value: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
  },
});

