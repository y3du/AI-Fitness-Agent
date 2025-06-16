import AsyncStorage from '@react-native-async-storage/async-storage';

export const resetAppState = async () => {
  try {
    // Clear all stored data
    await AsyncStorage.clear();
    console.log('App state has been reset');
    return true;
  } catch (error) {
    console.error('Error resetting app state:', error);
    return false;
  }
};

// For development purposes - uncomment to reset app state on import
//resetAppState().then(() => console.log('App state reset complete'));
