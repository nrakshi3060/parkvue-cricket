import React, { useState } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import HomeScreen from './src/screens/HomeScreen';
import MatchCenter from './src/screens/MatchCenter';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('Home');
  const [selectedMatchId, setSelectedMatchId] = useState(null);

  const navigate = (screen, params) => {
    setCurrentScreen(screen);
    if (params?.matchId) setSelectedMatchId(params.matchId);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {currentScreen === 'Home' ? (
        <HomeScreen navigation={{ navigate }} />
      ) : (
        <MatchCenter route={{ params: { matchId: selectedMatchId } }} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
