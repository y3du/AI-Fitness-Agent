import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create a navigation reference
const navigationRef = React.createRef();

// Onboarding Screens
import WelcomeScreen from '../screens/WelcomeScreen';
import UserInfoScreen from '../screens/onboarding/UserInfoScreen';
import BodyFatScreen from '../screens/onboarding/BodyFatScreen';
import ExperienceLevelScreen from '../screens/onboarding/ExperienceLevelScreen';
import StrengthScreen from '../screens/onboarding/StrengthScreen';
import WorkoutPreferenceScreen from '../screens/onboarding/WorkoutPreferenceScreen';
import EquipmentScreen from '../screens/onboarding/EquipmentScreen';
import GymEquipmentScreen from '../screens/onboarding/GymEquipmentScreen';
import FitnessGoalScreen from '../screens/onboarding/FitnessGoalScreen';

// Main App Screens
import HomeScreen from '../screens/HomeScreen';
import WorkoutScreen from '../screens/WorkoutScreen';
import ProgressScreen from '../screens/ProgressScreen';
import ProfileScreen from '../screens/ProfileScreen';
import WorkoutDetailsScreen from '../screens/WorkoutDetailsScreen';
import ExerciseScreen from '../screens/ExerciseScreen';

// Debug component import
if (!HomeScreen) {
  console.error('HomeScreen component is undefined. Check import path or export in HomeScreen.js');
}

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="HomeMain" 
        component={HomeScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="WorkoutDetails" 
        component={WorkoutDetailsScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Exercise" 
        component={ExerciseScreen} 
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

function MainTabNavigator({ onLogout }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Workout') {
            iconName = focused ? 'barbell' : 'barbell-outline';
          } else if (route.name === 'Progress') {
            iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Workout" component={WorkoutScreen} />
      <Tab.Screen name="Progress" component={ProgressScreen} />
      <Tab.Screen name="Profile">
        {() => <ProfileScreen onLogout={onLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState('Welcome');

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const [hasCompletedOnboarding, isLoggedIn, userId, userProfile] = await Promise.all([
          AsyncStorage.getItem('hasCompletedOnboarding'),
          AsyncStorage.getItem('isLoggedIn'),
          AsyncStorage.getItem('user_id'),
          AsyncStorage.getItem('userProfile'),
        ]);

        console.log('Auth Status:', { hasCompletedOnboarding, isLoggedIn, userId, userProfile });

        if (
          hasCompletedOnboarding === 'true' &&
          isLoggedIn === 'true' &&
          userId &&
          userProfile &&
          JSON.parse(userProfile)?.name
        ) {
          setInitialRoute('Main');
          setIsAuthenticated(true);
        } else {
          await AsyncStorage.clear();
          setInitialRoute('Welcome');
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error checking auth status:', error.message);
        await AsyncStorage.clear();
        setInitialRoute('Welcome');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const handleOnboardingComplete = async () => {
    try {
      await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
      if (navigationRef.current) {
        console.log('Navigating to UserInfo');
        navigationRef.current.navigate('UserInfo');
      }
    } catch (error) {
      console.error('Error completing welcome screen:', error.message);
    }
  };

  const handleOnboardingCompleteFinal = async () => {
    try {
      await Promise.all([
        AsyncStorage.setItem('hasCompletedOnboarding', 'true'),
        AsyncStorage.setItem('isLoggedIn', 'true'),
      ]);
      
      setIsAuthenticated(true);
      setInitialRoute('Main');
      
      if (navigationRef.current) {
        console.log('Resetting to Main');
        navigationRef.current.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        });
      }
    } catch (error) {
      console.error('Error completing onboarding:', error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      setIsAuthenticated(false);
      setInitialRoute('Welcome');
      
      if (navigationRef.current) {
        navigationRef.current.reset({
          index: 0,
          routes: [{ name: 'Welcome' }],
        });
      }
    } catch (error) {
      console.error('Error during logout:', error.message);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator 
        initialRouteName={initialRoute}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen 
          name="Welcome" 
          options={{ headerShown: false, gestureEnabled: false }}
          component={WelcomeScreen}
        />
        
        <Stack.Screen 
          name="UserInfo"
          options={{ headerShown: false }}
        >
          {props => <UserInfoScreen {...props} />}
        </Stack.Screen>

        <Stack.Screen 
          name="BodyFat"
          options={{ headerShown: false }}
          component={BodyFatScreen}
        />

        <Stack.Screen 
          name="ExperienceLevel"
          options={{ headerShown: false }}
          component={ExperienceLevelScreen}
        />

        <Stack.Screen 
          name="Strength"
          options={{ headerShown: false }}
          component={StrengthScreen}
        />

        <Stack.Screen 
          name="WorkoutPreference" 
          options={{ headerShown: false, gestureEnabled: false }}
          component={WorkoutPreferenceScreen}
        />
        
        <Stack.Screen 
          name="Equipment" 
          options={{ headerShown: false, gestureEnabled: false }}
          component={EquipmentScreen}
        />
        
        <Stack.Screen 
          name="GymEquipment" 
          options={{ headerShown: false, gestureEnabled: false }}
          component={GymEquipmentScreen}
        />
        
        <Stack.Screen 
          name="FitnessGoal" 
          options={{ headerShown: false, gestureEnabled: false }}
        >
          {(props) => (
            <FitnessGoalScreen 
              {...props} 
              onComplete={handleOnboardingCompleteFinal} 
            />
          )}
        </Stack.Screen>
        
        <Stack.Screen 
          name="Main" 
          options={{
            headerShown: false,
            gestureEnabled: false,
          }}
        >
          {() => isAuthenticated ? <MainTabNavigator onLogout={handleLogout} /> : null}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default AppNavigator;