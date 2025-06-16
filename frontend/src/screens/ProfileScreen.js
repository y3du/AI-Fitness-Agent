import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileScreen = ({ onLogout }) => {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUserData = async () => {
    try {
      const userProfile = await AsyncStorage.getItem('userProfile');
      if (userProfile) {
        const userData = JSON.parse(userProfile);
        setUser({
          ...userData,
          joinDate: userData.joinDate || `Member since ${new Date().toLocaleString('default', { month: 'long' })} ${new Date().getFullYear()}`,
          stats: {
            workouts: 0,
            minutes: 0,
            streak: 0,
            ...userData.stats
          }
        });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadUserData();
    }, [])
  );

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text>No user data found</Text>
      </View>
    );
  }

  const menuItems = [
    { 
      icon: 'person-outline', 
      label: 'Edit Profile',
      onPress: () => navigation.navigate('UserInfo', { isEditing: true, userData: user })
    },
    { 
      icon: 'notifications-outline', 
      label: 'Notifications',
      onPress: () => {}
    },
    { 
      icon: 'lock-closed-outline', 
      label: 'Privacy & Security',
      onPress: () => {}
    },
    { 
      icon: 'help-circle-outline', 
      label: 'Help & Support',
      onPress: () => {}
    },
    { 
      icon: 'information-circle-outline', 
      label: 'About',
      onPress: () => {}
    },
    { 
      icon: 'log-out-outline', 
      label: 'Logout', 
      color: '#FF3B30',
      onPress: () => {
        Alert.alert(
          'Logout',
          'Are you sure you want to logout?',
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Logout',
              style: 'destructive',
              onPress: () => onLogout && onLogout(),
            },
          ]
        );
      }
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
            <TouchableOpacity style={styles.editAvatar}>
              <Ionicons name="camera" size={16} color="white" />
            </TouchableOpacity>
          </View>
          <Text style={styles.name}>{user.name || 'User'}</Text>
          <Text style={styles.email}>{user.email || ''}</Text>
          <Text style={styles.joinDate}>{user.joinDate}</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.stats.workouts}</Text>
            <Text style={styles.statLabel}>Workouts</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.stats.minutes}</Text>
            <Text style={styles.statLabel}>Minutes</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.stats.streak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
        </View>

        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.menuItem}
              onPress={item.onPress || (() => {})}
            >
              <View style={styles.menuItemLeft}>
                <Ionicons 
                  name={item.icon} 
                  size={22} 
                  color={item.color || '#000'} 
                  style={styles.menuIcon} 
                />
                <Text style={[styles.menuText, item.color && { color: item.color }]}>
                  {item.label}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    alignItems: 'center',
    padding: 24,
    paddingTop: 16,
    backgroundColor: 'white',
    marginBottom: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#007AFF',
  },
  editAvatar: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#007AFF',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    color: '#666',
    marginBottom: 4,
  },
  joinDate: {
    color: '#999',
    fontSize: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    color: '#666',
    fontSize: 12,
  },
  menuContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    marginRight: 16,
    width: 24,
    textAlign: 'center',
  },
  menuText: {
    fontSize: 16,
  },
});

export default ProfileScreen;
