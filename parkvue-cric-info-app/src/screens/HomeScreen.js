import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { fetchAllMatches } from '../services/MatchService';

export default function HomeScreen({ navigation }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadMatches = async () => {
    setLoading(true);
    const data = await fetchAllMatches();
    setMatches(data);
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    const data = await fetchAllMatches();
    setMatches(data);
    setRefreshing(false);
  };

  useEffect(() => {
    loadMatches();
  }, []);

  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#004d40" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>Matches</Text>
        <TouchableOpacity 
          style={styles.adminBtn}
          onPress={() => navigation.navigate('AdminDashboard')}
        >
          <Text style={styles.adminBtnText}>Admin</Text>
        </TouchableOpacity>
      </View>
      {matches.length === 0 ? (
        <View style={styles.centered}>
          <Text>No matches found</Text>
        </View>
      ) : (
        <FlatList
          data={matches}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.matchCard}
              onPress={() => navigation.navigate('MatchCenter', { matchId: item.id })}
            >
              <Text style={styles.matchName}>
                {item.team1?.name} vs {item.team2?.name}
              </Text>
              <Text style={styles.matchStatus}>{item.status}</Text>
              <Text style={styles.matchVenue}>{item.venue}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginTop: 40, 
    marginBottom: 16 
  },
  header: { fontSize: 24, fontWeight: 'bold' },
  adminBtn: { 
    backgroundColor: '#004d40', 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 4 
  },
  adminBtnText: { color: '#fff', fontWeight: '600' },
  matchCard: { 
    padding: 16, 
    backgroundColor: '#fff', 
    borderRadius: 8, 
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3 
  },
  matchName: { fontSize: 18, fontWeight: '600' },
  matchStatus: { fontSize: 14, color: '#d32f2f', fontWeight: 'bold', marginTop: 4 },
  matchVenue: { fontSize: 14, color: '#666', marginTop: 2 },
});
