import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, ScrollView, ActivityIndicator, 
  SafeAreaView, StatusBar, TouchableOpacity 
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AnalyticsService } from '../services/AnalyticsService';

const THEME = {
  primary: '#0B2447',
  secondary: '#19A7CE',
  background: '#F8F9FA',
  card: '#FFFFFF',
  text: '#2D3436',
  muted: '#636E72',
  white: '#FFFFFF',
  accent: '#A5D7E8'
};

export default function PlayerAnalyticsScreen({ route, navigation }) {
  const { playerId, playerName } = route.params;
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [playerId]);

  const loadStats = async () => {
    setLoading(true);
    const data = await AnalyticsService.getPlayerStats(playerId);
    setStats(data);
    setLoading(false);
  };

  const StatBox = ({ label, value, subLabel }) => (
    <View style={styles.statBox}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
      {subLabel && <Text style={styles.statSubLabel}>{subLabel}</Text>}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={THEME.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={THEME.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>{playerName}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Batting Card */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="cricket" size={24} color={THEME.primary} />
            <Text style={styles.sectionTitle}>BATTING ANALYTICS</Text>
          </View>
          
          <View style={styles.statsGrid}>
            <StatBox label="TOTAL RUNS" value={stats?.totalRuns || 0} />
            <StatBox label="HIGHEST SCORE" value={stats?.highestScore || 0} />
            <StatBox label="AVERAGE" value={stats?.battingAverage?.toFixed(2) || '0.00'} />
            <StatBox label="STRIKE RATE" value={stats?.strikeRate?.toFixed(2) || '0.00'} />
            <StatBox label="MATCHES" value={stats?.matchesPlayed || 0} />
            <StatBox label="BALLS FACED" value={stats?.ballsFaced || 0} />
            <StatBox label="4s" value={stats?.fours || 0} />
            <StatBox label="6s" value={stats?.sixes || 0} />
          </View>
        </View>

        {/* Bowling Card */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="baseball-outline" size={24} color={THEME.secondary} />
            <Text style={styles.sectionTitle}>BOWLING ANALYTICS</Text>
          </View>
          
          <View style={styles.statsGrid}>
            <StatBox label="WICKETS" value={stats?.totalWickets || 0} />
            <StatBox label="ECONOMY" value={stats?.economyRate?.toFixed(2) || '0.00'} />
            <StatBox label="BEST FIGURES" value={stats?.bestFigures || '0/0'} />
            <StatBox label="OVERS" value={stats?.oversBowled?.toString() || '0.0'} />
            <StatBox label="RUNS CONC." value={stats?.runsConceded || 0} />
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee', flexDirection: 'row', alignItems: 'center' },
  backBtn: { marginRight: 15 },
  title: { fontSize: 20, fontWeight: '900', color: THEME.primary },
  scrollContent: { padding: 20 },
  sectionCard: { 
    backgroundColor: '#fff', 
    borderRadius: 20, 
    padding: 20, 
    marginBottom: 25,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 15
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#f5f5f5', paddingBottom: 15 },
  sectionTitle: { fontSize: 14, fontWeight: '900', color: THEME.primary, marginLeft: 10, letterSpacing: 1 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 15, justifyContent: 'space-between' },
  statBox: { width: '47%', backgroundColor: THEME.background, padding: 15, borderRadius: 15, alignItems: 'center' },
  statLabel: { fontSize: 9, fontWeight: 'bold', color: THEME.muted, marginBottom: 5, textTransform: 'uppercase' },
  statValue: { fontSize: 20, fontWeight: '900', color: THEME.primary },
  statSubLabel: { fontSize: 10, color: THEME.muted, marginTop: 4 }
});
