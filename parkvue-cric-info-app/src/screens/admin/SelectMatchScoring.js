import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, FlatList, TouchableOpacity, 
  ActivityIndicator, SafeAreaView 
} from 'react-native';
import { fetchAllMatches } from '../../services/MatchService';

const THEME = {
  primary: '#0B2447',
  secondary: '#19A7CE',
  background: '#F8F9FA',
  card: '#FFFFFF',
  text: '#2D3436',
  muted: '#636E72'
};

export default function SelectMatchScoring({ navigation }) {
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
        <ActivityIndicator size="large" color={THEME.secondary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Select Match to Score</Text>
      <FlatList
        data={matches}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20 }}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.matchCard}
            onPress={() => navigation.navigate('LiveScoring', { 
                matchId: item.id, 
                matchName: `${item.team1?.shortName || 'T1'} vs ${item.team2?.shortName || 'T2'}` 
            })}
          >
            <View style={styles.cardInfo}>
              <Text style={styles.matchName}>
                {item.team1?.name} <Text style={{ color: THEME.secondary }}>vs</Text> {item.team2?.name}
              </Text>
              <Text style={styles.matchStatus}>{item.status} • {item.venue}</Text>
            </View>
            <Text style={styles.chevron}>🏏</Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { fontSize: 18, fontWeight: 'bold', padding: 20, color: THEME.primary },
  matchCard: { 
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.card, 
    padding: 20, 
    borderRadius: 16, 
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5
  },
  cardInfo: { flex: 1 },
  matchName: { fontSize: 15, fontWeight: 'bold', color: THEME.primary },
  matchStatus: { fontSize: 12, color: THEME.muted, marginTop: 4 },
  chevron: { fontSize: 20 }
});
