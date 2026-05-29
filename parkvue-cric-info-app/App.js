import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './src/screens/HomeScreen';
import MatchCenter from './src/screens/MatchCenter';
import AdminDashboard from './src/screens/admin/AdminDashboard';
import LiveScoring from './src/screens/admin/LiveScoring';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ title: 'parkvue-cric-info' }}
        />
        <Stack.Screen 
          name="MatchCenter" 
          component={MatchCenter} 
          options={{ title: 'Match Center' }}
        />
        <Stack.Screen 
          name="AdminDashboard" 
          component={AdminDashboard} 
          options={{ title: 'Scorer Admin' }}
        />
        <Stack.Screen 
          name="LiveScoring" 
          component={LiveScoring} 
          options={{ title: 'Live Control' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
