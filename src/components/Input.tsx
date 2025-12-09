import React, {useState} from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
  Modal,
} from 'react-native';
import {useTheme} from '@context/ThemeContext';
import {VoiceInput} from './VoiceInput';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  enableVoiceInput?: boolean;
  onVoiceResult?: (text: string) => void;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  style,
  enableVoiceInput = false,
  onVoiceResult,
  value,
  onChangeText,
  ...props
}) => {
  const {colors} = useTheme();
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [inputValue, setInputValue] = useState(value || '');

  const handleVoiceResult = (text: string) => {
    setInputValue(text);
    if (onChangeText) {
      onChangeText(text);
    }
    if (onVoiceResult) {
      onVoiceResult(text);
    }
    setShowVoiceModal(false);
  };

  const handleVoiceError = (error: Error) => {
    console.error('Voice input error:', error);
    setShowVoiceModal(false);
  };

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, {color: colors.text}]}>{label}</Text>
      )}
      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.surface,
              borderColor: error ? colors.error : colors.border,
              color: colors.text,
            },
            enableVoiceInput && styles.inputWithVoice,
            style,
          ]}
          placeholderTextColor={colors.textSecondary}
          value={inputValue}
          onChangeText={(text) => {
            setInputValue(text);
            if (onChangeText) {
              onChangeText(text);
            }
          }}
          {...props}
        />
        {enableVoiceInput && (
          <TouchableOpacity
            style={[styles.voiceButton, {backgroundColor: colors.surface}]}
            onPress={() => setShowVoiceModal(true)}
            activeOpacity={0.7}>
            <Text style={styles.voiceIcon}>🎤</Text>
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text style={[styles.error, {color: colors.error}]}>{error}</Text>
      )}

      {/* Voice Input Modal */}
      <Modal
        visible={showVoiceModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowVoiceModal(false)}>
        <View
          style={[
            styles.modalContainer,
            {backgroundColor: colors.background + 'F0'},
          ]}>
          <View
            style={[
              styles.modalContent,
              {backgroundColor: colors.surface},
            ]}>
            <Text style={[styles.modalTitle, {color: colors.text}]}>
              Voice Input
            </Text>
            <VoiceInput
              onResult={handleVoiceResult}
              onError={handleVoiceError}
            />
            <TouchableOpacity
              style={[styles.closeButton, {backgroundColor: colors.border}]}
              onPress={() => setShowVoiceModal(false)}>
              <Text style={[styles.closeButtonText, {color: colors.text}]}>
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 48,
    flex: 1,
  },
  inputWithVoice: {
    paddingRight: 50,
  },
  voiceButton: {
    position: 'absolute',
    right: 8,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  voiceIcon: {
    fontSize: 20,
  },
  error: {
    fontSize: 12,
    marginTop: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 24,
  },
  closeButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

