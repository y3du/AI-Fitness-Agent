import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function BodyFatScreen({ navigation, route }) {
  const [fatPercentage, setFatPercentage] = useState('');
  const { userData } = route.params || {};

  const handleNext = () => {
    // If the field is empty, skip validation and do not add to userData
    if (!fatPercentage) {
      navigation.navigate('ExperienceLevel', {
        userData: {
          ...userData,
        },
      });
      return;
    }
    // If not empty, validate
    if (isNaN(fatPercentage) || fatPercentage < 0 || fatPercentage > 100) {
      Alert.alert('Invalid Input', 'Please enter a valid body fat percentage (0-100).');
      return;
    }
    navigation.navigate('ExperienceLevel', {
      userData: {
        ...userData,
        fat_percentage: parseFloat(fatPercentage),
      },
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Body Fat Percentage (Optional)</Text>
          <Text style={styles.subtitle}>This helps us tailor your plan more accurately</Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Body Fat %</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 20"
            keyboardType="numeric"
            value={fatPercentage}
            onChangeText={setFatPercentage}
          />
        </View>

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