import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Modal, TextInput, Alert, ScrollView } from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { getNutritionPlan, getDietaryPreferences, submitNutritionFeedback } from '../utils/api';

const NutritionScreen = ({ route, navigation }) => {
  const { userId } = route.params;
  const [weeklyPlan, setWeeklyPlan] = useState([]);
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [feedbackModal, setFeedbackModal] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [satisfaction, setSatisfaction] = useState(3);
  const [notes, setNotes] = useState('');


  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const currentDay = daysOfWeek[new Date().getDay()];

  useFocusEffect(
    useCallback(() => {
      const checkPreferencesAndLoadPlan = async () => {
        if (!userId) {
          Alert.alert('Error', 'User ID not found.');
          navigation.goBack();
          return;
        }
        try {
          await getDietaryPreferences(userId);
          fetchNutritionPlan();
        } catch (error) {
          if (error.message && error.message.includes('not found')) {
            Alert.alert(
              'Set Your Preferences',
              'To get a personalized nutrition plan, please set your dietary preferences first.',
              [
                {
                  text: 'OK',
                  onPress: () => navigation.navigate('DietaryPreferences', { userId }),
                },
              ],
              { cancelable: false }
            );
          } else {
            Alert.alert('Error', `Failed to load your data: ${error.message}`);
          }
        }
      };

      checkPreferencesAndLoadPlan();
      setSelectedDay(currentDay);
    }, [userId])
  );

  const fetchNutritionPlan = async () => {
    try {
      const response = await getNutritionPlan(userId);
      setWeeklyPlan(response);
    } catch (error) {
      Alert.alert('Error', `Failed to load nutrition plan: ${error.message}`);
    }
  };

  const handleFeedback = (meal) => {
    if (selectedDay !== currentDay) {
      Alert.alert('Info', `You can only rate meals for today (${currentDay}).`);
      return;
    }
    setSelectedMeal(meal);
    setFeedbackModal(true);
  };

  const submitFeedback = async () => {
    if (!selectedMeal) return;
    try {
      const feedback = {
        day: currentDay,
        feedback: [{ meal_id: selectedMeal.meal_id, satisfaction, notes }],
      };
      await submitNutritionFeedback(userId, feedback);
      setFeedbackModal(false);
      setSatisfaction(3);
      setNotes('');
      Alert.alert('Success', 'Feedback submitted successfully');
      fetchNutritionPlan();
    } catch (error) {
      Alert.alert('Error', 'Failed to submit feedback');
    }
  };



  const renderMeal = ({ item }) => (
    <Animated.View 
      entering={FadeIn} 
      exiting={FadeOut} 
      style={[styles.mealCard, item.meal_type === 'snack' && styles.snackCard]}
    >
      <Text style={styles.mealTitle}>{item.name}</Text>
      <Text style={styles.mealType}>{item.meal_type}</Text>
      <Text style={styles.mealDetails}>
        Calories: {(item.portion_size_multiplier * 100).toFixed(0)} kcal
      </Text>
      {selectedDay === currentDay && (
        <TouchableOpacity style={styles.feedbackButton} onPress={() => handleFeedback(item)}>
          <Ionicons name="chatbubble-outline" size={20} color="#007AFF" />
          <Text style={styles.feedbackButtonText}>Rate Meal</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );

  const renderDayPreview = ({ item }) => (
    <Animated.View entering={FadeIn} style={styles.dayPreviewCard}>
      <Text style={styles.dayPreviewTitle}>{item.day}</Text>
      {item.meals.map((meal) => (
        <Text key={`${meal.meal_id}-${meal.meal_type}`} style={styles.dayPreviewMeal}>
          {meal.meal_type}: {meal.name} ({(meal.portion_size_multiplier * 100).toFixed(0)} kcal)
        </Text>
      ))}
    </Animated.View>
  );

  const currentDayPlan = weeklyPlan.find((plan) => plan.day === selectedDay) || { meals: [] };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Nutrition Plan</Text>
        <TouchableOpacity onPress={() => navigation.navigate('DietaryPreferences', { userId })}>
          <Ionicons name="settings-outline" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Weekly Preview</Text>
        <FlatList
          horizontal
          data={weeklyPlan}
          renderItem={renderDayPreview}
          keyExtractor={(item) => item.day}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.previewList}
          ListEmptyComponent={<Text style={styles.emptyText}>No meal plans available</Text>}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Meals: {selectedDay}</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedDay}
            onValueChange={(itemValue) => setSelectedDay(itemValue)}
            style={styles.picker}
          >
            {daysOfWeek.map((day) => (
              <Picker.Item key={day} label={day} value={day} />
            ))}
          </Picker>
        </View>
        <FlatList
          data={currentDayPlan.meals}
          renderItem={renderMeal}
          keyExtractor={(item) => `${item.meal_id}-${item.meal_type}`}
          ListEmptyComponent={<Text style={styles.emptyText}>No meals planned for {selectedDay}</Text>}
          contentContainerStyle={styles.mealList}
        />
      </View>

      <Modal visible={feedbackModal} animationType="slide" transparent>
        <Animated.View entering={SlideInDown} exiting={SlideOutDown} style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Rate {selectedMeal?.name}</Text>
            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5].map((num) => (
                <TouchableOpacity
                  key={num}
                  style={[styles.ratingButton, satisfaction === num && styles.ratingButtonSelected]}
                  onPress={() => setSatisfaction(num)}
                >
                  <Text style={styles.ratingText}>{num}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={styles.notesInput}
              placeholder="Optional notes..."
              value={notes}
              onChangeText={setNotes}
              multiline
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButton} onPress={() => setFeedbackModal(false)}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.submitButton]} onPress={submitFeedback}>
                <Text style={styles.modalButtonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  previewList: {
    paddingVertical: 8,
  },
  dayPreviewCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    width: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dayPreviewTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  dayPreviewMeal: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  pickerContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  picker: {
    height: 44,
  },
  mealList: {
    paddingBottom: 16,
  },
  mealCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  snackCard: {
    backgroundColor: '#FFF8E1', // Light yellow to distinguish snacks
  },
  mealTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  mealType: {
    fontSize: 14,
    color: '#666',
    textTransform: 'capitalize',
    marginBottom: 4,
  },
  mealDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  feedbackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    padding: 8,
    borderRadius: 8,
  },
  feedbackButtonText: {
    color: '#007AFF',
    fontWeight: '600',
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  modalSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  ratingButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingButtonSelected: {
    backgroundColor: '#007AFF',
  },
  ratingText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 8,
    marginBottom: 16,
    minHeight: 80,
  },
  optionButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 8,
  },
  optionButtonSelected: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderColor: '#007AFF',
  },
  optionText: {
    fontSize: 16,
    textTransform: 'capitalize',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 0.48,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  modalButtonText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default NutritionScreen;