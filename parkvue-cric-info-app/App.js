import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './src/screens/HomeScreen';
import MatchCenter from './src/screens/MatchCenter';
import AdminDashboard from './src/screens/admin/AdminDashboard';
import LiveScoring from './src/screens/admin/LiveScoring';
import ManageEntityScreen from './src/screens/admin/ManageEntityScreen';
import SelectMatchScoring from './src/screens/admin/SelectMatchScoring';
import ManageSquadScreen from './src/screens/admin/ManageSquadScreen';
import MatchManagementScreen from './src/screens/admin/MatchManagementScreen';
import PlayerListScreen from './src/screens/PlayerListScreen';
import PlayerAnalyticsScreen from './src/screens/PlayerAnalyticsScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Home"
        screenOptions={{
          headerStyle: { backgroundColor: '#0B2447' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ title: 'parkvue cric-info', headerShadowVisible: false }}
        />
        <Stack.Screen 
          name="MatchCenter" 
          component={MatchCenter} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="PlayerList" 
          component={PlayerListScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="PlayerAnalytics" 
          component={PlayerAnalyticsScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="AdminDashboard" 
          component={AdminDashboard} 
          options={{ title: 'Admin Command Center' }}
        />
        <Stack.Screen 
          name="ManageEntity" 
          component={ManageEntityScreen} 
        />
        <Stack.Screen 
          name="SelectMatchScoring" 
          component={SelectMatchScoring} 
          options={{ title: 'Select Match' }}
        />
        <Stack.Screen 
          name="ManageSquad" 
          component={ManageSquadScreen} 
        />
        <Stack.Screen 
          name="LiveScoring" 
          component={LiveScoring} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="MatchManagement" 
          component={MatchManagementScreen} 
          options={{ title: 'Match Schedules' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
