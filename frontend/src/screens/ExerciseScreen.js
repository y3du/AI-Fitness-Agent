import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { submitFeedback } from '../utils/api';

const ExerciseScreen = ({ navigation, route }) => {
  const { workout, currentExerciseIndex } = route.params || {};
  const exercises = workout?.exercises || [];
  const currentExercise = exercises[currentExerciseIndex] || {};
  const [feedback, setFeedback] = useState({
    sets_completed: '',
    reps_completed: '',
    difficulty: '',
    notes: '',
    soreness_level: '',
  });
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const loadUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('user_id');
        if (!storedUserId || isNaN(parseInt(storedUserId))) {
          throw new Error('Invalid user ID. Please log in again.');
        }
        setUserId(parseInt(storedUserId));
      } catch (error) {
        console.error('Error loading user ID:', error.message);
        Alert.alert('Error', error.message, [
          {
            text: 'OK',
            onPress: async () => {
              await AsyncStorage.clear();
              navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
            },
          },
        ]);
      }
    };

    loadUserId();
  }, [navigation]);

  const handleInputChange = (field, value) => {
    setFeedback((prev) => ({ ...prev, [field]: value }));
  };

  const handleDone = async () => {
    const { sets_completed, reps_completed, difficulty, notes, soreness_level } = feedback;
    if (!sets_completed || !reps_completed || !difficulty || isNaN(sets_completed) || isNaN(reps_completed) || isNaN(difficulty)) {
      Alert.alert('Invalid Input', 'Please enter valid numbers for sets, reps, and difficulty (1-5).');
      return;
    }
    if (parseInt(difficulty) < 1 || parseInt(difficulty) > 5 || (soreness_level && (isNaN(soreness_level) || parseInt(soreness_level) < 1 || parseInt(soreness_level) > 5))) {
      Alert.alert('Invalid Input', 'Difficulty and soreness must be between 1 and 5.');
      return;
    }
    if (!workout?.day) {
      Alert.alert('Error', 'Workout day is missing. Please try again.');
      return;
    }
    if (!userId) {
      Alert.alert('Error', 'User ID is missing. Please log in again.');
      return;
    }

    try {
      const feedbackData = {
        day: workout.day,
        feedback: [
          {
            name: currentExercise.name,
            sets_completed: parseInt(sets_completed),
            reps_completed: parseInt(reps_completed) || 'AMRAP',
            difficulty: parseInt(difficulty),
            notes: notes || null,
            soreness_level: soreness_level ? parseInt(soreness_level) : null,
          },
        ],
      };

      // Submit feedback to the Feedback table
      await submitFeedback(userId, feedbackData);

      // Move to next exercise or complete workout
      if (currentExerciseIndex < exercises.length - 1) {
        navigation.replace('Exercise', {
          workout,
          currentExerciseIndex: currentExerciseIndex + 1,
        });
      } else {
        Alert.alert('Workout Completed!', 'Great job! Your feedback has been saved.', [
          { text: 'OK', onPress: () => navigation.navigate('Home') },
        ]);
      }
    } catch (error) {
      console.error('Error saving feedback:', error);
      Alert.alert('Error', error.message || 'Failed to save feedback. Please try again.');
    }
  };

  if (!currentExercise.name) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>{currentExercise.name}</Text>
          <Text style={styles.subtitle}>
            Sets: {currentExercise.sets} • Reps: {currentExercise.reps}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Log Your Performance</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Sets Completed</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 3"
              keyboardType="numeric"
              value={feedback.sets_completed}
              onChangeText={(value) => handleInputChange('sets_completed', value)}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Reps Completed</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 10"
              keyboardType="numeric"
              value={feedback.reps_completed}
              onChangeText={(value) => handleInputChange('reps_completed', value)}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Difficulty (1-5)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 3"
              keyboardType="numeric"
              value={feedback.difficulty}
              onChangeText={(value) => handleInputChange('difficulty', value)}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Notes (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Any comments about this exercise?"
              multiline
              value={feedback.notes}
              onChangeText={(value) => handleInputChange('notes', value)}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Soreness Level (1-5, Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 2"
              keyboardType="numeric"
              value={feedback.soreness_level}
              onChangeText={(value) => handleInputChange('soreness_level', value)}
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
          <Text style={styles.doneButtonText}>Done</Text>
          <Ionicons name="checkmark" size={20} color="white" style={{ marginLeft: 8 }} />
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
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#555',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  doneButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  doneButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ExerciseScreen;