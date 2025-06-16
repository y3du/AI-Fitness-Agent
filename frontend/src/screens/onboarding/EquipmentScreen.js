import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const equipmentOptions = [
  { id: 'dumbbells', label: 'Dumbbells', icon: 'fitness-outline' },
  { id: 'resistance_bands', label: 'Resistance Bands', icon: 'barbell-outline' },
  { id: 'yoga_mat', label: 'Yoga Mat', icon: 'barbell-outline' },
  { id: 'pullup_bar', label: 'Pull-up Bar', icon: 'barbell-outline' },
  { id: 'kettlebells', label: 'Kettlebells', icon: 'barbell-outline' },
  { id: 'jump_rope', label: 'Jump Rope', icon: 'barbell-outline' },
  { id: 'none', label: 'No Equipment', icon: 'close-circle-outline' },
];

export default function EquipmentScreen({ navigation, route }) {
  const [selectedEquipment, setSelectedEquipment] = useState([]);
  const { userData } = route.params || {};

  const toggleEquipment = (equipmentId) => {
    if (equipmentId === 'none') {
      setSelectedEquipment(['none']);
    } else {
      setSelectedEquipment((prev) => {
        const newSelection = prev.includes('none')
          ? [equipmentId]
          : prev.includes(equipmentId)
          ? prev.filter((id) => id !== equipmentId)
          : [...prev, equipmentId];
        return newSelection.length === 0 ? ['none'] : newSelection.filter((id) => id !== 'none');
      });
    }
  };

  const handleNext = () => {
    if (selectedEquipment.length === 0) {
      Alert.alert('Selection Required', 'Please select at least one piece of equipment or choose "No Equipment".');
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
          <Text style={styles.title}>What equipment do you have at home?</Text>
          <Text style={styles.subtitle}>Select all that apply</Text>

          <View style={styles.optionsContainer}>
            {equipmentOptions.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.option,
                  styles.optionButton,
                  selectedEquipment.includes(item.id) && styles.optionButtonSelected,
                ]}
                onPress={() => toggleEquipment(item.id)}
              >
                <Ionicons
                  name={item.icon}
                  size={24}
                  color={selectedEquipment.includes(item.id) ? '#007AFF' : '#666'}
                />
                <Text
                  style={[
                    styles.optionText,
                    selectedEquipment.includes(item.id) && styles.optionTextSelected,
                  ]}
                >
                  {item.label}
                </Text>
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
          <Text style={styles.instructionText}>Select your equipment to continue</Text>
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  optionButton: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  optionButtonSelected: {
    backgroundColor: '#f0f7ff',
    borderColor: '#007AFF',
  },
  optionText: {
    fontSize: 15,
    color: '#333',
    flex: 1,
  },
  optionTextSelected: {
    color: '#007AFF',
    fontWeight: '500',
  },
  checkIcon: {
    marginLeft: 8,
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