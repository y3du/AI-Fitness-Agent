import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Switch, Button, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { saveDietaryPreferences } from '../utils/api';

const DietaryPreferencesScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { userId } = route.params;

    const [allergies, setAllergies] = useState('');
    const [isVegan, setIsVegan] = useState(false);
    const [isVegetarian, setIsVegetarian] = useState(false);

    const handleSave = async () => {
        if (!userId) {
            Alert.alert('Error', 'User ID is missing.');
            return;
        }

        const preferences = {
            allergies: allergies.split(',').map(item => item.trim()).filter(item => item),
            is_vegan: isVegan,
            is_vegetarian: isVegetarian,
        };

        try {
            await saveDietaryPreferences(userId, preferences);
            Alert.alert('Success', 'Your dietary preferences have been saved.');
            navigation.goBack();
        } catch (error) {
            Alert.alert('Error', `Failed to save preferences: ${error.message}`);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Dietary Preferences</Text>

            <Text style={styles.label}>Allergies (comma-separated)</Text>
            <TextInput
                style={styles.input}
                placeholder="e.g., peanuts, shellfish, gluten"
                value={allergies}
                onChangeText={setAllergies}
            />

            <View style={styles.switchContainer}>
                <Text style={styles.label}>Vegan</Text>
                <Switch
                    value={isVegan}
                    onValueChange={(value) => {
                        setIsVegan(value);
                        if (value) {
                            setIsVegetarian(true);
                        }
                    }}
                />
            </View>

            <View style={styles.switchContainer}>
                <Text style={styles.label}>Vegetarian</Text>
                <Switch
                    value={isVegetarian}
                    onValueChange={(value) => {
                        setIsVegetarian(value);
                        if (!value) {
                            setIsVegan(false);
                        }
                    }}
                    disabled={isVegan}
                />
            </View>

            <Button title="Save Preferences" onPress={handleSave} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    label: {
        fontSize: 18,
        marginBottom: 10,
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        padding: 10,
        fontSize: 16,
        marginBottom: 20,
    },
    switchContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
});

export default DietaryPreferencesScreen;
