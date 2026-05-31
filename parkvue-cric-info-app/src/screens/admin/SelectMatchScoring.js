import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, FlatList, TouchableOpacity, 
  ActivityIndicator, SafeAreaView 
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
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
      setMatches(data || []);
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
            activeOpacity={0.8}
            onPress={() => navigation.navigate('LiveScoring', { 
                matchId: item.id, 
                matchName: `${item.team1?.shortName || 'T1'} vs ${item.team2?.shortName || 'T2'}` 
            })}
          >
            <View style={styles.cardInfo}>
              <Text style={styles.matchName}>
                {item.team1?.name} <Text style={{ color: THEME.secondary }}>vs</Text> {item.team2?.name}
              </Text>
              <Text style={styles.matchStatus}>{item.status} • {item.venue || 'Venue TBA'}</Text>
            </View>
            <MaterialCommunityIcons name="cricket" size={28} color={THEME.secondary} />
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No matches available to score.</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { fontSize: 18, fontWeight: 'bold', padding: 20, color: THEME.primary, letterSpacing: 1 },
  matchCard: { 
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.card, 
    padding: 22, 
    borderRadius: 20, 
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10
  },
  cardInfo: { flex: 1 },
  matchName: { fontSize: 16, fontWeight: '900', color: THEME.primary },
  matchStatus: { fontSize: 12, color: THEME.muted, marginTop: 4, fontWeight: '600' },
  empty: { textAlign: 'center', marginTop: 50, color: THEME.muted }
});
