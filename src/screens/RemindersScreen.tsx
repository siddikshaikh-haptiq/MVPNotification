import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import {useTheme} from '@context/ThemeContext';
import {Reminder, FilterType} from '../types/index';
import {remindersService} from '@services/remindersService';
import {Card} from '@components/Card';
import {Button} from '@components/Button';
import {LoadingSpinner} from '@components/LoadingSpinner';
import {Modal} from '@components/Modal';
import {Input} from '@components/Input';

export const RemindersScreen: React.FC = () => {
  const {colors} = useTheme();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [filteredReminders, setFilteredReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');
  const [showModal, setShowModal] = useState(false);
  const [newReminder, setNewReminder] = useState({
    companyId: '',
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
  });

  const loadReminders = async () => {
    try {
      const data = await remindersService.getAll();
      setReminders(data);
      applyFilter(data, filter);
    } catch (error) {
      console.error('Error loading reminders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadReminders();
  }, []);

  useEffect(() => {
    applyFilter(reminders, filter);
  }, [filter]);

  const applyFilter = (data: Reminder[], currentFilter: FilterType) => {
    const now = new Date();
    let filtered = data;

    switch (currentFilter) {
      case 'pending':
        filtered = data.filter(r => !r.completed);
        break;
      case 'overdue':
        filtered = data.filter(r => !r.completed && new Date(r.dueDate) < now);
        break;
      case 'completed':
        filtered = data.filter(r => r.completed);
        break;
      case 'upcoming':
        filtered = data.filter(r => {
          const dueDate = new Date(r.dueDate);
          const daysDiff = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          return !r.completed && daysDiff > 0 && daysDiff <= 7;
        });
        break;
      default:
        filtered = data;
    }

    setFilteredReminders(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadReminders();
  };

  const handleCreateReminder = async () => {
    try {
      await remindersService.create({
        ...newReminder,
        completed: false,
      });
      setShowModal(false);
      setNewReminder({
        companyId: '',
        title: '',
        description: '',
        dueDate: '',
        priority: 'medium',
      });
      loadReminders();
    } catch (error) {
      console.error('Error creating reminder:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return colors.error;
      case 'medium':
        return colors.warning;
      case 'low':
        return colors.success;
      default:
        return colors.textSecondary;
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <View style={styles.header}>
        <Text style={[styles.title, {color: colors.text}]}>Reminders</Text>
        <Button
          title="+ New"
          onPress={() => setShowModal(true)}
          variant="primary"
        />
      </View>

      <ScrollView
        horizontal
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}>
        {(['all', 'pending', 'overdue', 'upcoming', 'completed'] as FilterType[]).map(f => (
          <TouchableOpacity
            key={f}
            style={[
              styles.filterButton,
              filter === f && {backgroundColor: colors.primary},
            ]}
            onPress={() => setFilter(f)}>
            <Text
              style={[
                styles.filterText,
                {color: filter === f ? '#FFFFFF' : colors.text},
              ]}>
              {f === 'all' ? 'All' : f === 'pending' ? 'Pending' : f === 'overdue' ? 'Overdue' : f === 'upcoming' ? 'Upcoming' : 'Completed'}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        {filteredReminders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, {color: colors.textSecondary}]}>
              No reminders
            </Text>
          </View>
        ) : (
          filteredReminders.map(reminder => (
            <Card key={reminder.id}>
              <View style={styles.reminderHeader}>
                <Text style={[styles.reminderTitle, {color: colors.text}]}>
                  {reminder.title}
                </Text>
                <View
                  style={[
                    styles.priorityBadge,
                    {backgroundColor: getPriorityColor(reminder.priority) + '20'},
                  ]}>
                  <Text
                    style={[
                      styles.priorityText,
                      {color: getPriorityColor(reminder.priority)},
                    ]}>
                    {reminder.priority.toUpperCase()}
                  </Text>
                </View>
              </View>
              {reminder.description && (
                <Text style={[styles.reminderDescription, {color: colors.textSecondary}]}>
                  {reminder.description}
                </Text>
              )}
              <Text style={[styles.reminderDate, {color: colors.textSecondary}]}>
                Due: {new Date(reminder.dueDate).toLocaleDateString()}
              </Text>
            </Card>
          ))
        )}
      </ScrollView>

      <Modal
        visible={showModal}
        onClose={() => setShowModal(false)}
        title="New Reminder">
        <Input
          label="Title"
          placeholder="Reminder title"
          value={newReminder.title}
          onChangeText={text => setNewReminder({...newReminder, title: text})}
        />
        <Input
          label="Description"
          placeholder="Description (optional)"
          value={newReminder.description}
          onChangeText={text => setNewReminder({...newReminder, description: text})}
          multiline
        />
        <Input
          label="Due Date"
          placeholder="YYYY-MM-DD"
          value={newReminder.dueDate}
          onChangeText={text => setNewReminder({...newReminder, dueDate: text})}
        />
        <Button
          title="Create Reminder"
          onPress={handleCreateReminder}
          fullWidth
          style={styles.modalButton}
        />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  filterContainer: {
    maxHeight: 50,
  },
  filterContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reminderTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '700',
  },
  reminderDescription: {
    fontSize: 14,
    marginTop: 8,
  },
  reminderDate: {
    fontSize: 12,
    marginTop: 8,
  },
  modalButton: {
    marginTop: 16,
  },
});

