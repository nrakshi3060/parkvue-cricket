import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, FlatList, TouchableOpacity, 
  ActivityIndicator, RefreshControl, SafeAreaView, StatusBar 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
    setMatches(data || []);
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    const data = await fetchAllMatches();
    setMatches(data || []);
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
        {isLive && <Ionicons name="radio-outline" size={12} color="#fff" style={{marginRight: 4}} />}
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
          <Ionicons name="settings-outline" size={16} color={THEME.secondary} style={{marginRight: 4}} />
          <Text style={styles.adminBtnText}>ADMIN</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Current Matches</Text>

      {matches.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="calendar-clear-outline" size={60} color="#ccc" />
          <Text style={styles.emptyText}>No active matches found.</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={loadMatches}>
            <Ionicons name="refresh-outline" size={18} color="#fff" style={{marginRight: 6}} />
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
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Ionicons name="location-outline" size={12} color={THEME.muted} style={{marginRight: 4}} />
                    <Text style={styles.venueText}>{item.venue || 'TBA'}</Text>
                </View>
                <StatusBadge status={item.status} />
              </View>
              
              <View style={styles.teamsRow}>
                <View style={styles.teamInfo}>
                  <Text style={styles.teamName}>{item.team1?.name}</Text>
                  <Text style={styles.teamShort}>{item.team1?.shortName}</Text>
                </View>
                <View style={styles.vsContainer}><Text style={styles.vsText}>VS</Text></View>
                <View style={[styles.teamInfo, { alignItems: 'flex-end' }]}>
                  <Text style={[styles.teamName, { textAlign: 'right' }]}>{item.team2?.name}</Text>
                  <Text style={styles.teamShort}>{item.team2?.shortName}</Text>
                </View>
              </View>
              
              <View style={styles.cardFooter}>
                <Ionicons name="trophy-outline" size={12} color={THEME.muted} style={{marginRight: 4}} />
                <Text style={styles.tournamentName}>
                  {item.tournament?.name || 'Unofficial Match'}
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
    paddingHorizontal: 25, 
    paddingVertical: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  brand: { fontSize: 24, fontWeight: '900', color: '#FFFFFF', letterSpacing: -1 },
  adminBtn: { 
    backgroundColor: 'rgba(25, 167, 206, 0.1)', 
    paddingHorizontal: 15, 
    paddingVertical: 8, 
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(25, 167, 206, 0.4)',
    flexDirection: 'row',
    alignItems: 'center'
  },
  adminBtnText: { color: THEME.secondary, fontWeight: '900', fontSize: 11, letterSpacing: 1 },
  sectionTitle: { 
    fontSize: 13, 
    fontWeight: 'bold', 
    color: THEME.muted, 
    marginTop: 30, 
    marginBottom: 20, 
    marginHorizontal: 25,
    textTransform: 'uppercase',
    letterSpacing: 1.5
  },
  listContent: { paddingHorizontal: 20, paddingBottom: 40 },
  matchCard: { 
    backgroundColor: THEME.card, 
    borderRadius: 24, 
    padding: 25,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 4
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  venueText: { fontSize: 11, color: THEME.muted, fontWeight: '700', textTransform: 'uppercase' },
  badge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 10, 
    paddingVertical: 5, 
    borderRadius: 8 
  },
  badgeText: { color: '#FFF', fontSize: 10, fontWeight: '900' },
  teamsRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F9FA',
    marginBottom: 20
  },
  teamInfo: { flex: 1 },
  teamName: { fontSize: 18, fontWeight: '900', color: THEME.primary, letterSpacing: -0.5 },
  teamShort: { fontSize: 12, color: THEME.muted, marginTop: 4, fontWeight: 'bold' },
  vsContainer: { 
    width: 36, height: 36, borderRadius: 18, 
    backgroundColor: THEME.background, 
    justifyContent: 'center', alignItems: 'center',
    marginHorizontal: 15
  },
  vsText: { fontSize: 10, fontWeight: '900', color: THEME.secondary },
  cardFooter: { flexDirection: 'row', alignItems: 'center' },
  tournamentName: { fontSize: 12, color: THEME.muted, fontWeight: '600', fontStyle: 'italic' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 50 },
  emptyText: { color: THEME.muted, textAlign: 'center', fontSize: 16, marginTop: 20, marginBottom: 30, fontWeight: '600' },
  retryBtn: { 
    backgroundColor: THEME.primary, 
    paddingHorizontal: 25, 
    paddingVertical: 15, 
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 5
  },
  retryText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 }
});
