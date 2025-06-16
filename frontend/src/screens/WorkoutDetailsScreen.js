import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const WorkoutDetailsScreen = ({ navigation, route }) => {
  const { workout } = route.params || {};
  const exercises = workout?.exercises || [];

  const handleStart = () => {
    if (exercises.length > 0) {
      navigation.navigate('Exercise', { workout, currentExerciseIndex: 0 });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>{workout?.day || 'Workout Plan'}</Text>
          <Text style={styles.subtitle}>
            {exercises.length} exercises
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Exercises</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, { flex: 2 }]}>Exercise</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>Sets</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>Reps</Text>
            </View>
            {exercises.map((exercise, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 2 }]}>{exercise.name}</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>{exercise.sets}</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>{exercise.reps}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.startButton, exercises.length === 0 && styles.startButtonDisabled]}
          onPress={handleStart}
          disabled={exercises.length === 0}
        >
          <Text style={styles.startButtonText}>Let's Start</Text>
          <Ionicons name="play" size={20} color="white" style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 30,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  table: {
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f7ff',
    padding: 12,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  tableHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  tableCell: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  startButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  startButtonDisabled: {
    backgroundColor: '#a0c8ff',
  },
  startButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default WorkoutDetailsScreen;