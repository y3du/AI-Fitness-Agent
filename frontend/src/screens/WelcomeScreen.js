import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const WelcomeScreen = ({ navigation }) => {
  const handleGetStarted = () => {
    console.log('Get Started pressed');
    navigation.navigate('UserInfo');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome to Fitness App!</Text>
        <Text style={styles.subtitle}>Let’s create your personalized workout journey.</Text>
      </View>
      <TouchableOpacity style={styles.button} onPress={handleGetStarted}>
        <Text style={styles.buttonText}>Get Started</Text>
        <Ionicons name="arrow-forward" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 10,
  },
});

export default WelcomeScreen;