import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function StrengthScreen({ navigation, route }) {
  const { userData } = route.params || {};
  // Ensure workoutType is passed as 'gym' or 'home' from the previous screen
  if (!userData || !userData.workoutType) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: 'red', fontSize: 16 }}>Error: workoutType not set. Please ensure navigation passes workoutType as 'gym' or 'home'.</Text>
      </View>
    );
  }
  const isGym = userData.workoutType === 'gym';
  const [strengthData, setStrengthData] = useState({
    ...(isGym
      ? { bench_press_max: '', squat_max: '', deadlift_max: '' }
      : { pushups_reps: '', pullups_reps: '', bodyweight_squats_reps: '' }),
  });

  const handleInputChange = (field, value) => {
    setStrengthData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    const fields = isGym
      ? ['bench_press_max', 'squat_max', 'deadlift_max']
      : ['pushups_reps', 'pullups_reps', 'bodyweight_squats_reps'];
    for (const field of fields) {
      if (!strengthData[field] || isNaN(strengthData[field]) || strengthData[field] < 0) {
        Alert.alert('Invalid Input', `Please enter a valid number for ${field.replace('_', ' ')}.`);
        return;
      }
    }

    const formattedStrength = Object.fromEntries(
      Object.entries(strengthData).map(([key, value]) => [key, parseFloat(value)])
    );

    navigation.navigate(isGym ? 'GymEquipment' : 'Equipment', {
      userData: {
        ...userData,
        ...(isGym ? { gym_strength: formattedStrength } : { home_strength: formattedStrength }),
      },
    });
  };

  const inputs = isGym
    ? [
        { field: 'bench_press_max', label: 'Bench Press Max (kg)' },
        { field: 'squat_max', label: 'Squat Max (kg)' },
        { field: 'deadlift_max', label: 'Deadlift Max (kg)' },
      ]
    : [
        { field: 'pushups_reps', label: 'Push-Ups Reps' },
        { field: 'pullups_reps', label: 'Pull-Ups Reps' },
        { field: 'bodyweight_squats_reps', label: 'Bodyweight Squats Reps' },
      ];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Your Strength Level (Optional)</Text>
          <Text style={styles.subtitle}>Enter your current strength metrics</Text>
        </View>

        {inputs.map(({ field, label }) => (
          <View key={field} style={styles.inputContainer}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 50"
              keyboardType="numeric"
              value={strengthData[field]}
              onChangeText={(value) => handleInputChange(field, value)}
            />
          </View>
        ))}

        <View style={styles.footer}>
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>Next</Text>
            <Ionicons name="arrow-forward" size={20} color="white" style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 40,
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
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
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  nextButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});