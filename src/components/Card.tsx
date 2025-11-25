import React from 'react';
import {View, StyleSheet, TouchableOpacity} from 'react-native';
import {useTheme} from '@context/ThemeContext';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: object;
}

export const Card: React.FC<CardProps> = ({children, onPress, style}) => {
  const {colors} = useTheme();

  const cardStyle = [
    styles.card,
    {backgroundColor: colors.surface, borderColor: colors.border},
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyle}
        onPress={onPress}
        activeOpacity={0.7}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
});

