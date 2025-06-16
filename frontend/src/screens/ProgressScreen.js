import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';

const screenWidth = Dimensions.get('window').width;

const ProgressScreen = () => {
  const [selectedTab, setSelectedTab] = useState('weekly');

  // Sample data for the chart
  const data = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        data: [20, 45, 28, 80, 99, 43, 65],
        color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
        strokeWidth: 2
      }
    ],
    legend: ['Workout Minutes']
  };

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#007AFF'
    }
  };

  // Sample workout history
  const workoutHistory = [
    { id: '1', name: 'Full Body Workout', date: 'Today', duration: '45 min', calories: '320' },
    { id: '2', name: 'Upper Body Strength', date: 'Yesterday', duration: '35 min', calories: '280' },
    { id: '3', name: 'Lower Body Burn', date: '2 days ago', duration: '40 min', calories: '350' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>Your Progress</Text>
          <TouchableOpacity>
            <Ionicons name="calendar-outline" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.tabs}>
          <TouchableOpacity 
            style={[styles.tab, selectedTab === 'weekly' && styles.activeTab]}
            onPress={() => setSelectedTab('weekly')}
          >
            <Text style={[styles.tabText, selectedTab === 'weekly' && styles.activeTabText]}>Weekly</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, selectedTab === 'monthly' && styles.activeTab]}
            onPress={() => setSelectedTab('monthly')}
          >
            <Text style={[styles.tabText, selectedTab === 'monthly' && styles.activeTabText]}>Monthly</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, selectedTab === 'yearly' && styles.activeTab]}
            onPress={() => setSelectedTab('yearly')}
          >
            <Text style={[styles.tabText, selectedTab === 'yearly' && styles.activeTabText]}>Yearly</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>5</Text>
            <Text style={styles.statLabel}>Workouts</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>250<span style={{ fontSize: 16 }}>min</span></Text>
            <Text style={styles.statLabel}>Total Time</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>1,850<span style={{ fontSize: 16 }}>cal</span></Text>
            <Text style={styles.statLabel}>Burned</Text>
          </View>
        </View>

        <View style={styles.chartContainer}>
          <Text style={styles.sectionTitle}>Activity</Text>
          <LineChart
            data={data}
            width={screenWidth - 32}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        </View>

        <View style={styles.recentWorkouts}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Workouts</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {workoutHistory.map((workout) => (
            <View key={workout.id} style={styles.workoutCard}>
              <View style={styles.workoutIcon}>
                <Ionicons name="barbell" size={20} color="#007AFF" />
              </View>
              <View style={styles.workoutInfo}>
                <Text style={styles.workoutName}>{workout.name}</Text>
                <Text style={styles.workoutMeta}>{workout.date} • {workout.duration} • {workout.calories} cal</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flex: 0.32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  chartContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 12,
  },
  recentWorkouts: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAll: {
    color: '#007AFF',
    fontWeight: '500',
  },
  workoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
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
  workoutIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  workoutMeta: {
    color: '#666',
    fontSize: 14,
  },
});

export default ProgressScreen;
