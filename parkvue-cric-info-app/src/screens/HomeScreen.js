import React from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';

export default function HomeScreen({ navigation }) {
  // Mock data for initial view
  const liveMatches = [
    { id: '1', name: 'Panthers vs Challengers', score: '156/4 (18.2)' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Live Matches</Text>
      <FlatList
        data={liveMatches}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.matchCard}
            onPress={() => navigation.navigate('MatchCenter', { matchId: item.id })}
          >
            <Text style={styles.matchName}>{item.name}</Text>
            <Text style={styles.matchScore}>{item.score}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  matchCard: { padding: 16, backgroundColor: '#fff', borderRadius: 8, elevation: 2 },
  matchName: { fontSize: 18, fontWeight: '600' },
  matchScore: { fontSize: 16, color: '#666', marginTop: 4 },
});
