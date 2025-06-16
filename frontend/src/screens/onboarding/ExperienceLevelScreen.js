import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const experienceLevels = [
  { id: 1, title: 'Beginner', description: 'New to fitness or less than 6 months of training' },
  { id: 2, title: 'Intermediate', description: '6 months to 2 years of consistent training' },
  { id: 3, title: 'Expert', description: 'Over 2 years of advanced training' },
];

export default function ExperienceLevelScreen({ navigation, route }) {
  const [selectedLevel, setSelectedLevel] = useState(null);
  const { userData } = route.params || {};

  const handleNext = () => {
    if (!selectedLevel) {
      Alert.alert('Selection Required', 'Please select your experience level.');
      return;
    }

    navigation.navigate('WorkoutPreference', {
      userData: {
        ...userData,
        experience_level: selectedLevel,
      },
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>What’s your fitness experience level?</Text>
        <Text style={styles.subtitle}>This helps us customize your workouts</Text>

        <View style={styles.optionsContainer}>
          {experienceLevels.map((level) => (
            <TouchableOpacity
              key={level.id}
              style={[
                styles.optionCard,
                selectedLevel === level.id && styles.optionCardSelected,
              ]}
              onPress={() => setSelectedLevel(level.id)}
            >
              <Text style={styles.optionTitle}>{level.title}</Text>
              <Text style={styles.optionDescription}>{level.description}</Text>
              {selectedLevel === level.id && (
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
          style={[styles.nextButton, !selectedLevel && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={!selectedLevel}
        >
          <Text style={styles.nextButtonText}>Next</Text>
          <Ionicons name="arrow-forward" size={20} color="white" style={{ marginLeft: 8 }} />
        </TouchableOpacity>
        {!selectedLevel && (
          <Text style={styles.instructionText}>Select your experience level to continue</Text>
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
  nextButtonDisabled: {
    backgroundColor: '#a0c8ff',
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  instructionText: {
    marginTop: 10,
    color: '#666',
    textAlign: 'center',
  },
});