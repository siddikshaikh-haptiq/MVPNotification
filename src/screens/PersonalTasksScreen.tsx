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
import {PersonalTask, FilterType} from '@types/index';
import {tasksService} from '@services/tasksService';
import {Card} from '@components/Card';
import {Button} from '@components/Button';
import {LoadingSpinner} from '@components/LoadingSpinner';
import {Modal} from '@components/Modal';
import {Input} from '@components/Input';

export const PersonalTasksScreen: React.FC = () => {
  const {colors} = useTheme();
  const [tasks, setTasks] = useState<PersonalTask[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<PersonalTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');
  const [showModal, setShowModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
  });

  const loadTasks = async () => {
    try {
      const data = await tasksService.getAll();
      setTasks(data);
      applyFilter(data, filter);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    applyFilter(tasks, filter);
  }, [filter]);

  const applyFilter = (data: PersonalTask[], currentFilter: FilterType) => {
    const now = new Date();
    let filtered = data;

    switch (currentFilter) {
      case 'pending':
        filtered = data.filter(t => !t.completed);
        break;
      case 'overdue':
        filtered = data.filter(
          t => !t.completed && t.dueDate && new Date(t.dueDate) < now,
        );
        break;
      case 'completed':
        filtered = data.filter(t => t.completed);
        break;
      case 'upcoming':
        filtered = data.filter(t => {
          if (!t.dueDate) return false;
          const dueDate = new Date(t.dueDate);
          const daysDiff = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          return !t.completed && daysDiff > 0 && daysDiff <= 7;
        });
        break;
      default:
        filtered = data;
    }

    setFilteredTasks(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadTasks();
  };

  const handleCreateTask = async () => {
    try {
      await tasksService.create({
        ...newTask,
        completed: false,
      });
      setShowModal(false);
      setNewTask({
        title: '',
        description: '',
        dueDate: '',
        priority: 'medium',
      });
      loadTasks();
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleToggleComplete = async (task: PersonalTask) => {
    try {
      await tasksService.markAsCompleted(task.id, !task.completed);
      loadTasks();
    } catch (error) {
      console.error('Error updating task:', error);
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
        <Text style={[styles.title, {color: colors.text}]}>Personal Tasks</Text>
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
        {filteredTasks.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, {color: colors.textSecondary}]}>
              No tasks
            </Text>
          </View>
        ) : (
          filteredTasks.map(task => (
            <Card
              key={task.id}
              onPress={() => handleToggleComplete(task)}
              style={task.completed && styles.completedTask}>
              <View style={styles.taskHeader}>
                <Text
                  style={[
                    styles.taskTitle,
                    {color: colors.text},
                    task.completed && styles.completedText,
                  ]}>
                  {task.title}
                </Text>
                <View
                  style={[
                    styles.priorityBadge,
                    {backgroundColor: getPriorityColor(task.priority) + '20'},
                  ]}>
                  <Text
                    style={[
                      styles.priorityText,
                      {color: getPriorityColor(task.priority)},
                    ]}>
                    {task.priority.toUpperCase()}
                  </Text>
                </View>
              </View>
              {task.description && (
                <Text
                  style={[
                    styles.taskDescription,
                    {color: colors.textSecondary},
                    task.completed && styles.completedText,
                  ]}>
                  {task.description}
                </Text>
              )}
              {task.dueDate && (
                <Text style={[styles.taskDate, {color: colors.textSecondary}]}>
                  Due: {new Date(task.dueDate).toLocaleDateString()}
                </Text>
              )}
            </Card>
          ))
        )}
      </ScrollView>

      <Modal
        visible={showModal}
        onClose={() => setShowModal(false)}
        title="New Task">
        <Input
          label="Title"
          placeholder="Task title"
          value={newTask.title}
          onChangeText={text => setNewTask({...newTask, title: text})}
        />
        <Input
          label="Description"
          placeholder="Description (optional)"
          value={newTask.description}
          onChangeText={text => setNewTask({...newTask, description: text})}
          multiline
        />
        <Input
          label="Due Date"
          placeholder="YYYY-MM-DD"
          value={newTask.dueDate}
          onChangeText={text => setNewTask({...newTask, dueDate: text})}
        />
        <Button
          title="Create Task"
          onPress={handleCreateTask}
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
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  completedTask: {
    opacity: 0.6,
  },
  completedText: {
    textDecorationLine: 'line-through',
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
  taskDescription: {
    fontSize: 14,
    marginTop: 8,
  },
  taskDate: {
    fontSize: 12,
    marginTop: 8,
  },
  modalButton: {
    marginTop: 16,
  },
});

