import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const gymEquipmentOptions = [
  { id: 'treadmill', label: 'Treadmill', icon: 'walk-outline' },
  { id: 'elliptical', label: 'Elliptical', icon: 'barbell-outline' },
  { id: 'stationary_bike', label: 'Stationary Bike', icon: 'bicycle-outline' },
  { id: 'rowing_machine', label: 'Rowing Machine', icon: 'barbell-outline' },
  { id: 'cable_machine', label: 'Cable Machine', icon: 'barbell-outline' },
  { id: 'smith_machine', label: 'Smith Machine', icon: 'barbell-outline' },
  { id: 'leg_press', label: 'Leg Press', icon: 'barbell-outline' },
  { id: 'lat_pulldown', label: 'Lat Pulldown', icon: 'barbell-outline' },
  { id: 'chest_press', label: 'Chest Press', icon: 'barbell-outline' },
  { id: 'dumbbells', label: 'Dumbbells', icon: 'barbell-outline' },
  { id: 'barbells', label: 'Barbells', icon: 'barbell-outline' },
  { id: 'kettlebells', label: 'Kettlebells', icon: 'barbell-outline' },
  { id: 'resistance_bands', label: 'Resistance Bands', icon: 'barbell-outline' },
  { id: 'yoga_mat', label: 'Yoga Mat', icon: 'barbell-outline' },
];

export default function GymEquipmentScreen({ navigation, route }) {
  const [selectedEquipment, setSelectedEquipment] = useState([]);
  const { userData } = route.params || {};

  const toggleEquipment = (equipmentId) => {
    setSelectedEquipment((prev) =>
      prev.includes(equipmentId)
        ? prev.filter((id) => id !== equipmentId)
        : [...prev, equipmentId]
    );
  };

  const handleNext = () => {
    if (selectedEquipment.length === 0) {
      Alert.alert('Selection Required', 'Please select at least one piece of equipment.');
      return;
    }

    navigation.navigate('FitnessGoal', {
      userData: {
        ...userData,
        equipment: selectedEquipment,
      },
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          <Text style={styles.title}>Available Gym Equipment</Text>
          <Text style={styles.subtitle}>Select all that apply</Text>

          <View style={styles.optionsContainer}>
            {gymEquipmentOptions.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.option,
                  selectedEquipment.includes(item.id) && styles.optionSelected,
                ]}
                onPress={() => toggleEquipment(item.id)}
              >
                <Ionicons
                  name={item.icon}
                  size={24}
                  color={selectedEquipment.includes(item.id) ? '#007AFF' : '#666'}
                />
                <Text style={styles.optionText}>{item.label}</Text>
                {selectedEquipment.includes(item.id) && (
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color="#007AFF"
                    style={styles.checkIcon}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.nextButton, selectedEquipment.length === 0 && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={selectedEquipment.length === 0}
        >
          <Text style={styles.nextButtonText}>Next</Text>
          <Ionicons name="arrow-forward" size={20} color="white" style={{ marginLeft: 8 }} />
        </TouchableOpacity>

        {selectedEquipment.length === 0 && (
          <Text style={styles.instructionText}>Select at least one piece of equipment to continue</Text>
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
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 40,
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  option: {
    width: '48%',
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
  },
  optionSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f7ff',
  },
  optionText: {
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
    color: '#333',
  },
  checkIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
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