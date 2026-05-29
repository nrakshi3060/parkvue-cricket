import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, ActivityIndicator, FlatList } from 'react-native';
import { fetchMatchSummary } from '../services/MatchService';

export default function MatchCenter({ route }) {
  const { matchId } = route.params;
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadSummary = async () => {
    const data = await fetchMatchSummary(matchId);
    setSummary(data);
    setLoading(false);
  };

  useEffect(() => {
    loadSummary();
    // Poll every 10 seconds for updates
    const interval = setInterval(loadSummary, 10000);
    return () => clearInterval(interval);
  }, [matchId]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#004d40" />
      </View>
    );
  }

  if (!summary) {
    return (
      <View style={styles.centered}>
        <Text>Match data not found</Text>
      </View>
    );
  }

  const currentInnings = summary.innings?.[0] || {};

  return (
    <View style={styles.container}>
      <View style={styles.scoreBoard}>
        <Text style={styles.matchName}>
          {summary.match?.team1?.name} vs {summary.match?.team2?.name}
        </Text>
        <Text style={styles.scoreText}>
          {currentInnings.totalRuns || 0} / {currentInnings.totalWickets || 0}
        </Text>
        <Text style={styles.infoText}>
          Overs: {currentInnings.totalOvers || '0.0'}
        </Text>
      </View>
      
      <Text style={styles.commentaryHeader}>Recent Deliveries</Text>
      <FlatList
        data={summary.recentDeliveries || []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.deliveryItem}>
            <Text style={styles.deliveryBall}>{item.overNumber}.{item.ballNumber}</Text>
            <Text style={styles.deliveryText}>{item.commentary}</Text>
            <Text style={styles.runsText}>{item.runsBatter} runs</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No deliveries recorded yet</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  matchName: { color: '#e0e0e0', fontSize: 14, marginBottom: 8 },
  scoreBoard: { padding: 20, backgroundColor: '#004d40', borderRadius: 12, alignItems: 'center', marginBottom: 20 },
  scoreText: { fontSize: 40, fontWeight: 'bold', color: '#fff' },
  infoText: { fontSize: 18, color: '#e0e0e0', marginTop: 4 },
  commentaryHeader: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  deliveryItem: { 
    flexDirection: 'row', 
    paddingVertical: 12, 
    borderBottomWidth: 1, 
    borderBottomColor: '#eee',
    alignItems: 'center'
  },
  deliveryBall: { fontWeight: 'bold', width: 45, color: '#004d40' },
  deliveryText: { flex: 1, fontSize: 14 },
  runsText: { fontWeight: 'bold', marginLeft: 8 },
  emptyText: { textAlign: 'center', marginTop: 20, color: '#999' }
});
