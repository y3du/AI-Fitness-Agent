import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getOrCreateWorkout } from '../utils/api';

const HomeScreen = ({ navigation }) => {
  const [userName, setUserName] = useState('User');
  const [workoutPlan, setWorkoutPlan] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isLoggedIn = await AsyncStorage.getItem('isLoggedIn');
        if (isLoggedIn !== 'true') {
          console.log('Not authenticated, skipping loadData');
          return;
        }
        setIsAuthenticated(true);

        const loadData = async () => {
          try {
            // Load user profile
            const userProfile = await AsyncStorage.getItem('userProfile');
            if (userProfile) {
              const parsedProfile = JSON.parse(userProfile);
              if (parsedProfile.name) {
                setUserName(parsedProfile.name);
              }
            }

            // Load or create workout plan
            const storedUserId = await AsyncStorage.getItem('user_id');
            if (!storedUserId || isNaN(parseInt(storedUserId))) {
              throw new Error('Invalid or missing user ID. Please complete onboarding.');
            }
            const parsedUserId = parseInt(storedUserId);
            setUserId(parsedUserId);
            console.log('Fetching workout for user_id:', parsedUserId);

            const response = await getOrCreateWorkout(parsedUserId);
            // Backend returns a list of workouts; select today's workout
            const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const today = daysOfWeek[new Date().getDay()];
            const todayWorkout = response.find(workout => workout.day === today && workout.exercises.length > 0) || response[0];
            if (!todayWorkout) {
              throw new Error('No workout available for today.');
            }
            setWorkoutPlan(todayWorkout);
          } catch (error) {
            console.error('Error loading data:', error.message);
            Alert.alert('Error', error.message || 'Failed to load workout. Redirecting to onboarding.', [
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

        loadData();
      } catch (error) {
        console.error('Error checking auth:', error.message);
      }
    };

    checkAuth();
  }, [navigation]);

  const handleStartWorkout = () => {
    if (workoutPlan) {
      navigation.navigate('WorkoutDetails', { workout: workoutPlan });
    } else {
      Alert.alert('No Workout', 'No workout plan available. Please try again.');
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.greeting}>Hello, {userName}! 👋</Text>
          <Text style={styles.subtitle}>Ready for your next workout?</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Start</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={[styles.quickAction, { backgroundColor: '#FF6B6B' }]}
              onPress={handleStartWorkout}
            >
              <Ionicons name="barbell" size={24} color="white" />
              <Text style={styles.quickActionText}>Start Workout</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.quickAction, { backgroundColor: '#4ECDC4' }]}
              onPress={() => navigation.navigate('Progress')}
            >
              <Ionicons name="stats-chart" size={24} color="white" />
              <Text style={styles.quickActionText}>View Progress</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.quickAction, { backgroundColor: '#50C878' }]}
              onPress={() => {
                if (userId) {
                  navigation.navigate('Nutrition', { userId });
                } else {
                  Alert.alert('Error', 'Could not get user ID.');
                }
              }}
            >
              <Ionicons name="leaf" size={24} color="white" />
              <Text style={styles.quickActionText}>Track Nutrition</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Plan</Text>
          <View style={styles.planCard}>
            <Text style={styles.planTitle}>
              {workoutPlan ? workoutPlan.day : 'Loading...'}
            </Text>
            <Text style={styles.planDuration}>
              {workoutPlan ? `${workoutPlan.exercises.length} exercises` : 'N/A'}
            </Text>
            <TouchableOpacity style={styles.startButton} onPress={handleStartWorkout}>
              <Text style={styles.startButtonText}>Start Workout</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityCard}>
            <View style={styles.activityIcon}>
              <Ionicons name="barbell" size={20} color="#007AFF" />
            </View>
            <View style={styles.activityDetails}>
              <Text style={styles.activityTitle}>Upper Body Workout</Text>
              <Text style={styles.activitySubtitle}>Yesterday • 40 min</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </View>
        </View>
      </ScrollView>
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
    marginBottom: 24,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  quickAction: {
    flex: 0.31,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  quickActionText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
  },
  planCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  planDuration: {
    color: '#666',
    marginBottom: 16,
  },
  startButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  startButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityDetails: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  activitySubtitle: {
    color: '#999',
    fontSize: 14,
  },
});

export default HomeScreen;