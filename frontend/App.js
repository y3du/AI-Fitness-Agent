import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppNavigator from './src/navigation/AppNavigator';
import { WorkoutProvider } from './src/context/WorkoutContext';
import { resetAppState } from './src/utils/resetAppState';

// Uncomment the next line to reset app state on app load (for development)
//resetAppState().then(() => console.log('App state reset complete'));

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <WorkoutProvider>
          <StatusBar style="dark" />
          <AppNavigator />
        </WorkoutProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
