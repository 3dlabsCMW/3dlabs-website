import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { LoginScreen } from '../screens/LoginScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { ScheduleScreen } from '../screens/ScheduleScreen';
import { TasksScreen } from '../screens/TasksScreen';
import { AnnouncementsScreen } from '../screens/AnnouncementsScreen';
import { TeamManagementScreen } from '../screens/TeamManagementScreen';
import { ScheduleDetailScreen } from '../screens/ScheduleDetailScreen';
import { useAuth } from '../hooks/useAuth';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const AppTabs = ({ isAdmin }: { isAdmin: boolean }) => (
  <Tab.Navigator>
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Schedule" component={ScheduleScreen} />
    <Tab.Screen name="Tasks" component={TasksScreen} />
    <Tab.Screen name="Announcements" component={AnnouncementsScreen} />
    {isAdmin ? <Tab.Screen name="Team" component={TeamManagementScreen} /> : null}
  </Tab.Navigator>
);

export const AppNavigator = () => {
  const { loading, profile } = useAuth();
  if (loading) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!profile ? (
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        ) : (
          <>
            <Stack.Screen name="Main" options={{ headerShown: false }}>
              {() => <AppTabs isAdmin={profile.role === 'admin'} />}
            </Stack.Screen>
            <Stack.Screen name="ScheduleDetail" component={ScheduleDetailScreen} options={{ title: 'Schedule Details' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
