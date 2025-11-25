import React from 'react';
import {TextInput, View, Text, StyleSheet, TextInputProps} from 'react-native';
import {useTheme} from '@context/ThemeContext';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({label, error, style, ...props}) => {
  const {colors} = useTheme();

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, {color: colors.text}]}>{label}</Text>
      )}
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: colors.surface,
            borderColor: error ? colors.error : colors.border,
            color: colors.text,
          },
          style,
        ]}
        placeholderTextColor={colors.textSecondary}
        {...props}
      />
      {error && (
        <Text style={[styles.error, {color: colors.error}]}>{error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 48,
  },
  error: {
    fontSize: 12,
    marginTop: 4,
  },
});

