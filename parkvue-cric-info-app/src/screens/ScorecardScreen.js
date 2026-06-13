import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, ScrollView, ActivityIndicator, 
  SafeAreaView, StatusBar, TouchableOpacity, FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fetchMatchScorecard } from '../services/MatchService';

const THEME = {
  primary: '#0B2447',
  secondary: '#19A7CE',
  background: '#F8F9FA',
  card: '#FFFFFF',
  text: '#2D3436',
  muted: '#636E72',
  white: '#FFFFFF',
  border: '#F1F2F6'
};

export default function ScorecardScreen({ route, navigation }) {
  const { matchId } = route.params;
  const [scorecard, setScorecard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeInningsIndex, setActiveInningsIndex] = useState(0);

  useEffect(() => {
    loadScorecard();
  }, [matchId]);

  const loadScorecard = async () => {
    setLoading(true);
    const data = await fetchMatchScorecard(matchId);
    setScorecard(data);
    setLoading(false);
  };

  const TableHeader = ({ labels }) => (
    <View style={styles.tableHeader}>
      {labels.map((label, idx) => (
        <Text key={idx} style={[styles.headerCell, idx === 0 && { flex: 2, textAlign: 'left' }]}>
          {label}
        </Text>
      ))}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={THEME.primary} />
      </View>
    );
  }

  if (!scorecard || !scorecard.innings || scorecard.innings.length === 0) {
    return (
      <View style={styles.centered}>
        <Text>No scorecard data available.</Text>
      </View>
    );
  }

  const currentInningsData = scorecard.innings[activeInningsIndex];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Premium Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={THEME.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Full Scorecard</Text>
        <TouchableOpacity onPress={loadScorecard} style={styles.refreshBtn}>
          <Ionicons name="refresh" size={20} color={THEME.primary} />
        </TouchableOpacity>
      </View>

      {/* Innings Tabs */}
      <View style={styles.tabs}>
        {scorecard.innings.map((inn, idx) => (
          <TouchableOpacity 
            key={inn.innings.id} 
            style={[styles.tab, activeInningsIndex === idx && styles.activeTab]}
            onPress={() => setActiveInningsIndex(idx)}
          >
            <Text style={[styles.tabText, activeInningsIndex === idx && styles.activeTabText]}>
              INN {inn.innings.inningsNumber}
            </Text>
            <Text style={[styles.tabSub, activeInningsIndex === idx && styles.activeTabText]}>
                {inn.innings.battingTeam.shortName}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Batting Table */}
        <View style={styles.section}>
            <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionTitle}>BATTING</Text>
                <Text style={styles.teamInningsName}>{currentInningsData.innings.battingTeam.name}</Text>
            </View>
            
            <TableHeader labels={['BATTER', 'R', 'B', '4s', '6s', 'SR']} />
            {currentInningsData.batting.map((row, idx) => (
                <View key={idx} style={[styles.row, idx % 2 === 0 && styles.zebra]}>
                    <View style={{ flex: 2 }}>
                        <Text style={styles.playerName}>{row.playerName}</Text>
                        <Text style={styles.dismissal}>{row.dismissalInfo}</Text>
                    </View>
                    <Text style={[styles.cell, styles.bold]}>{row.runs}</Text>
                    <Text style={styles.cell}>{row.balls}</Text>
                    <Text style={styles.cell}>{row.fours}</Text>
                    <Text style={styles.cell}>{row.sixes}</Text>
                    <Text style={styles.cell}>{row.strikeRate.toFixed(1)}</Text>
                </View>
            ))}

            <View style={styles.totalRow}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.totalLabel}>TOTAL</Text>
                    <Text style={styles.totalOvers}>({currentInningsData.innings.totalOvers} Overs)</Text>
                </View>
                <Text style={styles.totalValue}>{currentInningsData.innings.totalRuns}/{currentInningsData.innings.totalWickets}</Text>
            </View>
        </View>

        {/* Bowling Table */}
        <View style={[styles.section, { marginTop: 30 }]}>
            <Text style={styles.sectionTitle}>BOWLING</Text>
            <TableHeader labels={['BOWLER', 'O', 'M', 'R', 'W', 'ECON']} />
            {currentInningsData.bowling.map((row, idx) => (
                <View key={idx} style={[styles.row, idx % 2 === 0 && styles.zebra]}>
                    <Text style={[styles.playerName, { flex: 2 }]}>{row.playerName}</Text>
                    <Text style={styles.cell}>{row.overs.toFixed(1)}</Text>
                    <Text style={styles.cell}>{row.maidens}</Text>
                    <Text style={styles.cell}>{row.runsConceded}</Text>
                    <Text style={[styles.cell, styles.bold, { color: THEME.secondary }]}>{row.wickets}</Text>
                    <Text style={styles.cell}>{row.economy.toFixed(2)}</Text>
                </View>
            ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: THEME.border },
  headerTitle: { fontSize: 18, fontWeight: '900', color: THEME.primary },
  backBtn: { padding: 5 },
  refreshBtn: { padding: 5 },
  
  tabs: { flexDirection: 'row', backgroundColor: THEME.primary, paddingHorizontal: 15 },
  tab: { flex: 1, paddingVertical: 15, alignItems: 'center', borderBottomWidth: 3, borderBottomColor: 'transparent', opacity: 0.6 },
  activeTab: { borderBottomColor: THEME.secondary, opacity: 1 },
  tabText: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
  tabSub: { color: THEME.secondary, fontSize: 10, fontWeight: '900' },
  activeTabText: { color: '#fff' },

  content: { flex: 1, padding: 20 },
  section: { backgroundColor: '#fff', borderRadius: 20, padding: 15, elevation: 4, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
  sectionTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#f5f5f5', paddingBottom: 10 },
  sectionTitle: { fontSize: 12, fontWeight: '900', color: THEME.secondary, letterSpacing: 1 },
  teamInningsName: { fontSize: 12, fontWeight: 'bold', color: THEME.muted },
  
  tableHeader: { flexDirection: 'row', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
  headerCell: { flex: 1, fontSize: 10, fontWeight: 'bold', color: THEME.muted, textAlign: 'center' },
  
  row: { flexDirection: 'row', paddingVertical: 12, alignItems: 'center' },
  zebra: { backgroundColor: '#fafafa' },
  playerName: { fontSize: 14, fontWeight: 'bold', color: THEME.primary },
  dismissal: { fontSize: 10, color: THEME.muted, marginTop: 2 },
  cell: { flex: 1, fontSize: 13, color: THEME.primary, textAlign: 'center' },
  bold: { fontWeight: '900' },
  
  totalRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, marginTop: 10, borderTopWidth: 2, borderTopColor: THEME.primary },
  totalLabel: { fontSize: 16, fontWeight: '900', color: THEME.primary },
  totalOvers: { fontSize: 11, color: THEME.muted, fontWeight: 'bold' },
  totalValue: { fontSize: 24, fontWeight: '900', color: THEME.primary }
});
