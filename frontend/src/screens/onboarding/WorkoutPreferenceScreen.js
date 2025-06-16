import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function WorkoutPreferenceScreen({ navigation, route }) {
  const [selectedType, setSelectedType] = useState(null);
  const { userData } = route.params || {};

  const workoutTypes = [
    {
      id: 'home',
      title: 'Home Workout',
      description: 'No gym? No problem! Work out with minimal or no equipment.',
      icon: 'home-outline',
    },
    {
      id: 'gym',
      title: 'Gym Workout',
      description: 'Access to gym equipment and facilities for your workouts.',
      icon: 'barbell-outline',
    },
  ];

  const handleNext = () => {
    if (!selectedType) return;

    navigation.navigate('Strength', {
      userData: {
        ...userData,
        workoutType: selectedType, // Use camelCase to match StrengthScreen
      },
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>What type of workout do you prefer?</Text>
        <Text style={styles.subtitle}>This helps us customize your experience</Text>

        <View style={styles.optionsContainer}>
          {workoutTypes.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.optionCard,
                selectedType === type.id && styles.optionCardSelected,
              ]}
              onPress={() => setSelectedType(type.id)}
            >
              <View style={styles.optionIconContainer}>
                <Ionicons
                  name={type.icon}
                  size={32}
                  color={selectedType === type.id ? '#007AFF' : '#666'}
                />
              </View>
              <Text style={styles.optionTitle}>{type.title}</Text>
              <Text style={styles.optionDescription}>{type.description}</Text>
              {selectedType === type.id && (
                <View style={styles.selectedIndicator}>
                  <Ionicons name="checkmark-circle" size={24} color="#007AFF" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.nextButton, !selectedType && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={!selectedType}
        >
          <Text style={styles.nextButtonText}>Next</Text>
          <Ionicons name="arrow-forward" size={20} color="white" style={{ marginLeft: 8 }} />
        </TouchableOpacity>

        {!selectedType && (
          <Text style={styles.instructionText}>Select your workout preference to continue</Text>
        )}
      </View>
    </View>
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
    paddingTop: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  optionsContainer: {
    marginBottom: 20,
  },
  optionCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  optionCardSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f7ff',
  },
  optionIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e9f2ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  instructionText: {
    marginTop: 10,
    color: '#666',
    textAlign: 'center',
  },
  nextButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: '#a0c8ff',
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});