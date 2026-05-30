import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, FlatList, TouchableOpacity, 
  ActivityIndicator, RefreshControl, SafeAreaView, StatusBar 
} from 'react-native';
import { fetchAllMatches } from '../services/MatchService';

const THEME = {
  primary: '#0B2447',
  secondary: '#19A7CE',
  background: '#F8F9FA',
  card: '#FFFFFF',
  text: '#2D3436',
  muted: '#636E72',
  live: '#E63946',
  upcoming: '#ECA154',
  completed: '#2A9D8F'
};

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

  const StatusBadge = ({ status }) => {
    const isLive = status?.toLowerCase() === 'live';
    const isUpcoming = status?.toLowerCase() === 'upcoming';
    
    let bgColor = THEME.completed;
    if (isLive) bgColor = THEME.live;
    if (isUpcoming) bgColor = THEME.upcoming;

    return (
      <View style={[styles.badge, { backgroundColor: bgColor }]}>
        {isLive && <View style={styles.pulseDot} />}
        <Text style={styles.badgeText}>{status?.toUpperCase()}</Text>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={THEME.secondary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.brand}>parkvue <Text style={{ color: THEME.secondary }}>cric-info</Text></Text>
        <TouchableOpacity 
          style={styles.adminBtn}
          onPress={() => navigation.navigate('AdminDashboard')}
        >
          <Text style={styles.adminBtnText}>ADMIN</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Current Matches</Text>

      {matches.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No active matches at the moment.</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={loadMatches}>
            <Text style={styles.retryText}>Check for Updates</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={matches}
          contentContainerStyle={styles.listContent}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh} 
              tintColor={THEME.secondary}
            />
          }
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.matchCard}
              activeOpacity={0.9}
              onPress={() => navigation.navigate('MatchCenter', { matchId: item.id })}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.venueText}>{item.venue || 'TBA'}</Text>
                <StatusBadge status={item.status} />
              </View>
              
              <View style={styles.teamsRow}>
                <View style={styles.teamInfo}>
                  <Text style={styles.teamName}>{item.team1?.name}</Text>
                  <Text style={styles.teamShort}>{item.team1?.shortName}</Text>
                </View>
                <Text style={styles.vsText}>VS</Text>
                <View style={[styles.teamInfo, { alignItems: 'flex-end' }]}>
                  <Text style={styles.teamName}>{item.team2?.name}</Text>
                  <Text style={styles.teamShort}>{item.team2?.shortName}</Text>
                </View>
              </View>
              
              <View style={styles.cardFooter}>
                <Text style={styles.tournamentName}>
                  {item.tournament?.name || 'Friendly Match'}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: THEME.background },
  header: { 
    backgroundColor: THEME.primary, 
    paddingHorizontal: 20, 
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  brand: { fontSize: 22, fontWeight: '900', color: '#FFFFFF', letterSpacing: -1 },
  adminBtn: { 
    backgroundColor: 'rgba(25, 167, 206, 0.2)', 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 8,
    borderWidth: 1,
    borderColor: THEME.secondary
  },
  adminBtnText: { color: THEME.secondary, fontWeight: 'bold', fontSize: 12 },
  sectionTitle: { 
    fontSize: 14, 
    fontWeight: 'bold', 
    color: THEME.muted, 
    marginTop: 25, 
    marginBottom: 15, 
    marginHorizontal: 20,
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  listContent: { paddingHorizontal: 20, paddingBottom: 20 },
  matchCard: { 
    backgroundColor: THEME.card, 
    borderRadius: 16, 
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3 
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  venueText: { fontSize: 12, color: THEME.muted, fontWeight: '600' },
  badge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 6 
  },
  badgeText: { color: '#FFF', fontSize: 10, fontWeight: '900' },
  pulseDot: { 
    width: 6, 
    height: 6, 
    borderRadius: 3, 
    backgroundColor: '#FFF', 
    marginRight: 5 
  },
  teamsRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F2F6',
    marginBottom: 15
  },
  teamInfo: { flex: 1 },
  teamName: { fontSize: 16, fontWeight: 'bold', color: THEME.primary },
  teamShort: { fontSize: 12, color: THEME.muted, marginTop: 2 },
  vsText: { 
    fontSize: 12, 
    fontWeight: '900', 
    color: THEME.secondary, 
    marginHorizontal: 15,
    backgroundColor: '#F1F2F6',
    padding: 6,
    borderRadius: 20
  },
  tournamentName: { fontSize: 12, color: THEME.muted, fontStyle: 'italic' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyText: { color: THEME.muted, textAlign: 'center', fontSize: 16, marginBottom: 20 },
  retryBtn: { 
    backgroundColor: THEME.primary, 
    paddingHorizontal: 20, 
    paddingVertical: 12, 
    borderRadius: 10 
  },
  retryText: { color: '#FFF', fontWeight: 'bold' }
});
