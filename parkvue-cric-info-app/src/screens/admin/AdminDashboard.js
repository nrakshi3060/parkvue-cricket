import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { fetchAllMatches } from '../../services/MatchService';

export default function AdminDashboard({ navigation }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMatches = async () => {
      const data = await fetchAllMatches();
      setMatches(data);
      setLoading(false);
    };
    loadMatches();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#004d40" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Select Match to Score</Text>
      <FlatList
        data={matches}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.matchCard}
            onPress={() => navigation.navigate('LiveScoring', { matchId: item.id, matchName: `${item.team1?.name} vs ${item.team2?.name}` })}
          >
            <Text style={styles.matchName}>{item.team1?.name} vs {item.team2?.name}</Text>
            <Text style={styles.matchStatus}>{item.status}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  matchCard: { 
    padding: 16, 
    backgroundColor: '#fff', 
    borderRadius: 8, 
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#004d40'
  },
  matchName: { fontSize: 16, fontWeight: '600' },
  matchStatus: { fontSize: 14, color: '#666', marginTop: 4 },
});
