import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createUser } from '../../utils/api';

const fitnessGoals = [
  {
    id: 'lose_weight',
    title: 'Lose Weight',
    description: 'Burn fat and get lean',
    icon: 'trending-down-outline',
  },
  {
    id: 'build_muscle',
    title: 'Build Muscle',
    description: 'Gain strength and size',
    icon: 'barbell-outline',
  },
  {
    id: 'stay_fit',
    title: 'Stay Fit',
    description: 'Maintain current fitness level',
    icon: 'heart-outline',
  },
  {
    id: 'improve_endurance',
    title: 'Improve Endurance',
    description: 'Build stamina and cardiovascular health',
    icon: 'speedometer-outline',
  },
  {
    id: 'increase_flexibility',
    title: 'Increase Flexibility',
    description: 'Improve mobility and reduce injury risk',
    icon: 'body-outline',
  },
];

export default function FitnessGoalScreen({ navigation, route, onComplete }) {
  const [selectedGoal, setSelectedGoal] = useState(null);
  const { userData } = route.params || {};

  const handleComplete = async () => {
    if (!selectedGoal) {
      Alert.alert('Selection Required', 'Please select a fitness goal.');
      return;
    }

    const finalUserData = {
      ...userData,
      fitness_goal: selectedGoal,
    };

    try {
      const response = await createUser(finalUserData);
      await AsyncStorage.setItem('user_id', String(response.user_id));
      await AsyncStorage.setItem('userProfile', JSON.stringify({
        ...finalUserData,
        onboardingCompleted: true,
      }));
      if (onComplete) {
        await onComplete(); // Call handleOnboardingCompleteFinal
      } else {
        await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
        await AsyncStorage.setItem('isLoggedIn', 'true');
        navigation.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        });
      }
    } catch (error) {
      console.error('Error saving user profile:', error);
      Alert.alert('Error', error.message || 'Failed to save your profile. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>What's your main goal?</Text>
          <Text style={styles.subtitle}>We'll create a personalized plan for you</Text>
        </View>

        <View style={styles.goalsContainer}>
          {fitnessGoals.map((goal) => (
            <TouchableOpacity
              key={goal.id}
              style={[
                styles.goalCard,
                selectedGoal === goal.id && styles.goalCardSelected,
              ]}
              onPress={() => setSelectedGoal(goal.id)}
            >
              <View
                style={[
                  styles.iconContainer,
                  selectedGoal === goal.id && styles.iconContainerSelected,
                ]}
              >
                <Ionicons
                  name={goal.icon}
                  size={28}
                  color={selectedGoal === goal.id ? '#007AFF' : '#666'}
                />
              </View>
              <Text style={styles.goalTitle}>{goal.title}</Text>
              <Text style={styles.goalDescription}>{goal.description}</Text>
              {selectedGoal === goal.id && (
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
          style={[styles.completeButton, !selectedGoal && styles.completeButtonDisabled]}
          onPress={handleComplete}
          disabled={!selectedGoal}
        >
          <Text style={styles.completeButtonText}>Get Started</Text>
        </TouchableOpacity>
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
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 20,
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
  },
  goalsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  goalCard: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  goalCardSelected: {
    backgroundColor: '#f0f7ff',
    borderColor: '#007AFF',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#e9f2ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  iconContainerSelected: {
    backgroundColor: '#d0e3ff',
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  goalDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
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
  completeButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  completeButtonDisabled: {
    backgroundColor: '#a0c8ff',
  },
  completeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});