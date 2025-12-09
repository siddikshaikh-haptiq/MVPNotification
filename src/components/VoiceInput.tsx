import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {useTheme} from '@context/ThemeContext';
import {speechService} from '@services/speechService';

interface VoiceInputProps {
  onResult: (text: string) => void;
  onError?: (error: Error) => void;
  language?: string;
  disabled?: boolean;
  showWaveform?: boolean;
}

export const VoiceInput: React.FC<VoiceInputProps> = ({
  onResult,
  onError,
  language = 'en-US',
  disabled = false,
  showWaveform = true,
}) => {
  const {colors} = useTheme();
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveformAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isListening) {
      // Pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      ).start();

      // Waveform animation
      if (showWaveform) {
        Animated.loop(
          Animated.sequence([
            Animated.timing(waveformAnim, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(waveformAnim, {
              toValue: 0,
              duration: 500,
              useNativeDriver: true,
            }),
          ]),
        ).start();
      }
    } else {
      pulseAnim.setValue(1);
      waveformAnim.setValue(0);
    }
  }, [isListening]);

  const handleStartListening = async () => {
    try {
      const hasPermission = await speechService.checkPermissions();
      if (!hasPermission) {
        Alert.alert(
          'Microphone Permission Required',
          'Please grant microphone permission to use voice input.',
        );
        return;
      }

      setIsListening(true);
      setTranscribedText('');

      const success = await speechService.startListening(
        (result) => {
          if (result.isFinal) {
            setTranscribedText(result.text);
          } else {
            // Show interim results
            setTranscribedText(result.text);
          }
        },
        (error) => {
          console.error('Speech recognition error:', error);
          setIsListening(false);
          if (onError) {
            onError(error);
          } else {
            Alert.alert('Error', 'Failed to start voice recognition');
          }
        },
        {
          language,
          continuous: true,
          interimResults: true,
        },
      );

      if (!success) {
        setIsListening(false);
      }
    } catch (error) {
      console.error('Error starting voice input:', error);
      setIsListening(false);
      if (onError) {
        onError(error as Error);
      }
    }
  };

  const handleStopListening = async () => {
    try {
      setIsProcessing(true);
      const result = await speechService.stopListening();
      setIsListening(false);

      if (result) {
        setTranscribedText(result);
        onResult(result);
      }
    } catch (error) {
      console.error('Error stopping voice input:', error);
      if (onError) {
        onError(error as Error);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = async () => {
    await speechService.cancelListening();
    setIsListening(false);
    setIsProcessing(false);
    setTranscribedText('');
  };

  const styles = StyleSheet.create({
    container: {
      alignItems: 'center',
    },
    buttonContainer: {
      position: 'relative',
      alignItems: 'center',
      justifyContent: 'center',
    },
    pulseCircle: {
      position: 'absolute',
      borderRadius: 50,
      backgroundColor: colors.primary + '20',
    },
    button: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: isListening ? colors.error : colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    buttonDisabled: {
      opacity: 0.5,
    },
    icon: {
      fontSize: 32,
      color: '#FFFFFF',
    },
    waveform: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 16,
      height: 40,
    },
    waveformBar: {
      width: 4,
      backgroundColor: colors.primary,
      marginHorizontal: 2,
      borderRadius: 2,
    },
    statusText: {
      marginTop: 12,
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    transcribedText: {
      marginTop: 8,
      padding: 12,
      backgroundColor: colors.surface,
      borderRadius: 8,
      minHeight: 50,
      maxWidth: '90%',
    },
    transcribedTextContent: {
      fontSize: 14,
      color: colors.text,
      textAlign: 'center',
    },
    controls: {
      flexDirection: 'row',
      marginTop: 16,
      gap: 12,
    },
    controlButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    controlButtonText: {
      fontSize: 14,
      color: colors.text,
      fontWeight: '500',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        {/* Pulse effect */}
        {isListening && (
          <Animated.View
            style={[
              styles.pulseCircle,
              {
                width: pulseAnim.interpolate({
                  inputRange: [1, 1.2],
                  outputRange: [80, 120],
                }),
                height: pulseAnim.interpolate({
                  inputRange: [1, 1.2],
                  outputRange: [80, 120],
                }),
                opacity: pulseAnim.interpolate({
                  inputRange: [1, 1.2],
                  outputRange: [0.3, 0],
                }),
              },
            ]}
          />
        )}

        {/* Main button */}
        <TouchableOpacity
          style={[styles.button, disabled && styles.buttonDisabled]}
          onPress={isListening ? handleStopListening : handleStartListening}
          disabled={disabled || isProcessing}>
          {isProcessing ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.icon}>{isListening ? '⏹' : '🎤'}</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Waveform visualization */}
      {showWaveform && isListening && (
        <View style={styles.waveform}>
          {[1, 2, 3, 4, 5].map((index) => (
            <Animated.View
              key={index}
              style={[
                styles.waveformBar,
                {
                  height: waveformAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [
                      10,
                      20 + index * 5,
                      10 + (index % 2) * 10,
                    ],
                  }),
                },
              ]}
            />
          ))}
        </View>
      )}

      {/* Status text */}
      <Text style={styles.statusText}>
        {isProcessing
          ? 'Processing...'
          : isListening
            ? 'Listening...'
            : 'Tap to start voice input'}
      </Text>

      {/* Transcribed text */}
      {transcribedText ? (
        <View style={styles.transcribedText}>
          <Text style={styles.transcribedTextContent}>{transcribedText}</Text>
        </View>
      ) : null}

      {/* Controls */}
      {isListening && (
        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={handleCancel}>
            <Text style={styles.controlButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

