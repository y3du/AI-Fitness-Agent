import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const workoutPlans = [
  {
    id: '1',
    name: 'Full Body Workout',
    duration: '45 min',
    difficulty: 'Intermediate',
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f724?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    exercises: [
      { id: 'e1', name: 'Push-ups', sets: 3, reps: 12 },
      { id: 'e2', name: 'Squats', sets: 3, reps: 15 },
      { id: 'e3', name: 'Lunges', sets: 3, reps: 12 },
      { id: 'e4', name: 'Plank', sets: 3, duration: '30 sec' },
    ],
  },
  {
    id: '2',
    name: 'Upper Body Strength',
    duration: '35 min',
    difficulty: 'Beginner',
    image: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    exercises: [
      { id: 'e1', name: 'Push-ups', sets: 4, reps: 12 },
      { id: 'e2', name: 'Dips', sets: 3, reps: 10 },
      { id: 'e3', name: 'Dumbbell Rows', sets: 3, reps: 12 },
      { id: 'e4', name: 'Bicep Curls', sets: 3, reps: 12 },
    ],
  },
  {
    id: '3',
    name: 'Lower Body Burn',
    duration: '40 min',
    difficulty: 'Intermediate',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    exercises: [
      { id: 'e1', name: 'Squats', sets: 4, reps: 15 },
      { id: 'e2', name: 'Lunges', sets: 3, reps: 12 },
      { id: 'e3', name: 'Calf Raises', sets: 3, reps: 20 },
      { id: 'e4', name: 'Glute Bridges', sets: 3, reps: 15 },
    ],
  },
];

const WorkoutScreen = ({ navigation }) => {
  const renderWorkoutPlan = ({ item }) => (
    <TouchableOpacity 
      style={styles.workoutCard}
      onPress={() => navigation.navigate('WorkoutDetail', { workout: item })}
    >
      <Image source={{ uri: item.image }} style={styles.workoutImage} />
      <View style={styles.workoutInfo}>
        <Text style={styles.workoutName}>{item.name}</Text>
        <View style={styles.workoutMeta}>
          <Text style={styles.workoutMetaText}>
            <Ionicons name="time-outline" size={14} color="#666" /> {item.duration}
          </Text>
          <Text style={styles.workoutMetaText}>
            <Ionicons name="barbell-outline" size={14} color="#666" /> {item.difficulty}
          </Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#999" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Workout Plans</Text>
        <TouchableOpacity>
          <Ionicons name="filter" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={workoutPlans}
        renderItem={renderWorkoutPlan}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  list: {
    paddingBottom: 24,
  },
  workoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  workoutImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  workoutMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  workoutMetaText: {
    color: '#666',
    fontSize: 14,
  },
});

export default WorkoutScreen;
