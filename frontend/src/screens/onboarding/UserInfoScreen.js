import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createUser } from '../../utils/api';

const UserInfoScreen = ({ navigation, route }) => {
  const { isEditing = false, userData: initialData = null } = route.params || {};
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    height: '',
    weight: '',
    gender: 'male',
  });

  useEffect(() => {
    if (isEditing && initialData) {
      setFormData((prev) => ({
        ...prev,
        ...initialData,
        height: initialData.height_cm?.toString() || '',
        weight: initialData.weight_kg?.toString() || '',
      }));
    }
  }, [isEditing, initialData]);

  const handleNext = useCallback(async () => {
    const { name, age, height, weight, gender } = formData;
    if (!name || !height || !weight || !gender) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }
    if (isNaN(height) || isNaN(weight) || (age && isNaN(age))) {
      Alert.alert('Error', 'Age, height, and weight must be valid numbers.');
      return;
    }

    const formattedData = {
      name,
      height_cm: parseFloat(height),
      weight_kg: parseFloat(weight),
      gender,
      ...(age && { age: parseInt(age) }),
    };

    try {
      if (isEditing) {
        const userProfile = await AsyncStorage.getItem('userProfile');
        const updatedProfile = userProfile ? JSON.parse(userProfile) : {};
        await AsyncStorage.setItem(
          'userProfile',
          JSON.stringify({
            ...updatedProfile,
            ...formattedData,
            updatedAt: new Date().toISOString(),
          })
        );
        navigation.goBack();
      } else {
        navigation.navigate('BodyFat', { userData: formattedData });
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save profile.');
    }
  }, [formData, navigation, isEditing]);

  const isFormValid = formData.name && formData.height && formData.weight && formData.gender;

  const updateFormData = (updates) => {
    setFormData((prevData) => ({
      ...prevData,
      ...updates,
    }));
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>{isEditing ? 'Edit Profile' : 'Tell us about yourself'}</Text>
          {isEditing && (
            <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your name"
            value={formData.name}
            onChangeText={(text) => updateFormData({ name: text })}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Age (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your age"
            keyboardType="numeric"
            value={formData.age}
            onChangeText={(text) => updateFormData({ age: text })}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputContainer, { flex: 1, marginRight: 10 }]}>
            <Text style={styles.label}>Height (cm)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 175"
              keyboardType="numeric"
              value={formData.height}
              onChangeText={(text) => updateFormData({ height: text })}
            />
          </View>

          <View style={[styles.inputContainer, { flex: 1 }]}>
            <Text style={styles.label}>Weight (kg)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 70"
              keyboardType="numeric"
              value={formData.weight}
              onChangeText={(text) => updateFormData({ weight: text })}
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Gender</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.gender}
              onValueChange={(itemValue) => updateFormData({ gender: itemValue })}
              style={styles.picker}
            >
              <Picker.Item label="Male" value="male" />
              <Picker.Item label="Female" value="female" />
              <Picker.Item label="Other" value="other" />
            </Picker>
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.nextButton, !isFormValid && styles.nextButtonDisabled]}
            onPress={handleNext}
            disabled={!isFormValid}
          >
            <Text style={styles.nextButtonText}>{isEditing ? 'Save Changes' : 'Next'}</Text>
            {!isEditing && (
              <Ionicons name="arrow-forward" size={20} color="white" style={{ marginLeft: 8 }} />
            )}
          </TouchableOpacity>

          {!isFormValid && (
            <Text style={styles.instructionText}>Please fill in all required fields to continue</Text>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  closeButton: {
    padding: 8,
  },
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#333',
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f9f9f9',
  },
  picker: {
    width: '100%',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  nextButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    width: '100%',
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  instructionText: {
    marginTop: 10,
    color: '#666',
    textAlign: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: '#a0c8ff',
  },
});

export default UserInfoScreen;