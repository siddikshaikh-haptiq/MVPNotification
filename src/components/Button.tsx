import React from 'react';
import {TouchableOpacity, Text, ActivityIndicator, StyleSheet} from 'react-native';
import {useTheme} from '@context/ThemeContext';
import {analyticsService} from '@services/analyticsService';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: object;
  analyticsId?: string; // Optional: ID for analytics tracking
  analyticsParams?: Record<string, any>; // Optional: Additional analytics parameters
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  analyticsId,
  analyticsParams,
}) => {
  const {colors} = useTheme();

  const handlePress = () => {
    // Track button click if analyticsId is provided
    if (analyticsId) {
      analyticsService.logButtonClick(analyticsId, undefined, analyticsParams);
    }
    onPress();
  };

  const getButtonStyle = () => {
    const baseStyle = [styles.button, fullWidth && styles.fullWidth];
    
    switch (variant) {
      case 'primary':
        return [...baseStyle, {backgroundColor: colors.primary}];
      case 'secondary':
        return [...baseStyle, {backgroundColor: colors.secondary}];
      case 'outline':
        return [...baseStyle, {backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.primary}];
      case 'danger':
        return [...baseStyle, {backgroundColor: colors.error}];
      default:
        return [...baseStyle, {backgroundColor: colors.primary}];
    }
  };

  const getTextStyle = () => {
    const baseStyle = [styles.text];
    if (variant === 'outline') {
      return [...baseStyle, {color: colors.primary}];
    }
    return [...baseStyle, {color: '#FFFFFF'}];
  };

  return (
    <TouchableOpacity
      style={[...getButtonStyle(), (disabled || loading) && styles.disabled, style]}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.7}>
      {loading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Text style={getTextStyle()}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
});

