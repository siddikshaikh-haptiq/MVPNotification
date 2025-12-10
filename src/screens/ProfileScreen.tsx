import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {useRoute, useNavigation, RouteProp} from '@react-navigation/native';
import {useTheme} from '@context/ThemeContext';
import {Card} from '@components/Card';
import {LoadingSpinner} from '@components/LoadingSpinner';

type ProfileRouteParams = {
  Profile: {
    id: string;
  };
};

export const ProfileScreen: React.FC = () => {
  const {colors} = useTheme();
  const route = useRoute<RouteProp<ProfileRouteParams, 'Profile'>>();
  const navigation = useNavigation();
  const {id} = route.params || {};
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    navigation.setOptions({
      title: `Profile ${id}`,
    });
  }, [id, navigation]);

  useEffect(() => {
    // Simulate loading profile data
    const loadProfile = async () => {
      setLoading(true);
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setProfile({
        id,
        name: `User ${id}`,
        email: `user${id}@example.com`,
        role: 'Member',
      });
      setLoading(false);
    };

    if (id) {
      loadProfile();
    }
  }, [id]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: 16,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 24,
    },
    label: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.textSecondary,
      marginBottom: 4,
    },
    value: {
      fontSize: 16,
      color: colors.text,
      marginBottom: 16,
    },
  });

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!profile) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={[styles.title, {color: colors.error}]}>
            Profile not found
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Profile Details</Text>
      <Card>
        <Text style={styles.label}>ID</Text>
        <Text style={styles.value}>{profile.id}</Text>

        <Text style={styles.label}>Name</Text>
        <Text style={styles.value}>{profile.name}</Text>

        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{profile.email}</Text>

        <Text style={styles.label}>Role</Text>
        <Text style={styles.value}>{profile.role}</Text>
      </Card>
    </ScrollView>
  );
};

