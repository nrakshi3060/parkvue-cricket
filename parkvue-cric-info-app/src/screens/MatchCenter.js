import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, ActivityIndicator, 
  FlatList, SafeAreaView, StatusBar, TouchableOpacity 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fetchMatchSummary } from '../services/MatchService';

const THEME = {
  primary: '#0B2447',
  secondary: '#19A7CE',
  background: '#F8F9FA',
  card: '#FFFFFF',
  text: '#2D3436',
  muted: '#636E72',
  live: '#E63946',
  white: '#FFFFFF',
  border: '#F1F2F6'
};

export default function MatchCenter({ route, navigation }) {
  const { matchId } = route.params;
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  // We will use standard Fetch for initial load, 
  // and then Polling as a fallback, but REDIS makes the poll near-instant.
  const loadSummary = async () => {
    try {
      const data = await fetchMatchSummary(matchId);
      if (data) setSummary(data);
    } catch (e) {
      console.error("Poll error", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
    // High-frequency polling enabled by Redis (every 3 seconds)
    // This is much more reliable than SSE over unstable tunnels
    const interval = setInterval(loadSummary, 3000); 
    return () => clearInterval(interval);
  }, [matchId]);

  if (loading && !summary) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={THEME.secondary} />
      </View>
    );
  }

  if (!summary) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Match details unavailable.</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentInnings = summary.innings?.sort((a,b) => b.inningsNumber - a.inningsNumber)[0] || {};
  const crr = currentInnings.totalOvers > 0 
    ? (currentInnings.totalRuns / currentInnings.totalOvers).toFixed(2) 
    : '0.00';

  const DeliveryItem = ({ item }) => {
    const isWicket = item.wicket;
    const isBoundary = item.runsBatter === 4 || item.runsBatter === 6;

    return (
      <View style={styles.deliveryCard}>
        <View style={[styles.ballCircle, isWicket && styles.wicketBall, isBoundary && styles.boundaryBall]}>
          <Text style={[styles.ballText, (isWicket || isBoundary) && styles.whiteText]}>
            {isWicket ? 'W' : item.runsBatter}
          </Text>
        </View>
        <View style={styles.deliveryInfo}>
          <Text style={styles.overBallText}>{item.overNumber}.{item.ballNumber}</Text>
          <Text style={styles.commentaryText} numberOfLines={2}>
            {item.commentary}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.jumbotron}>
        <View style={styles.jumboHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtnIcon}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.jumboMatchName}>
            {summary.match?.team1?.shortName} <Text style={{color: THEME.secondary}}>VS</Text> {summary.match?.team2?.shortName}
          </Text>
          <TouchableOpacity onPress={loadSummary}>
            <Ionicons name="refresh-outline" size={22} color="rgba(255,255,255,0.6)" />
          </TouchableOpacity>
        </View>

        <View style={styles.scoreRow}>
          <Text style={styles.mainScore}>{currentInnings.totalRuns || 0}</Text>
          <Text style={styles.wicketScore}>/{currentInnings.totalWickets || 0}</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>OVERS</Text>
            <Text style={styles.statValue}>{currentInnings.totalOvers || '0.0'}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>CRR</Text>
            <Text style={styles.statValue}>{crr}</Text>
          </View>
        </View>

        <TouchableOpacity 
            style={styles.scorecardLink}
            onPress={() => navigation.navigate('Scorecard', { matchId })}
        >
            <Text style={styles.scorecardLinkText}>VIEW FULL SCORECARD</Text>
            <Ionicons name="chevron-forward" size={16} color={THEME.secondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Live Commentary</Text>
          <View style={styles.liveIndicator}>
            <Ionicons name="radio-outline" size={14} color={THEME.live} style={{marginRight: 4}} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        </View>

        <FlatList
          data={summary.recentDeliveries || []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.commentaryList}
          renderItem={({ item }) => <DeliveryItem item={item} />}
          ListEmptyComponent={
            <View style={styles.emptyCommentary}>
              <Ionicons name="chatbox-ellipses-outline" size={40} color="#ccc" />
              <Text style={styles.emptyText}>Waiting for the first ball...</Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.primary },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: THEME.background },
  jumbotron: { backgroundColor: THEME.primary, paddingBottom: 30, paddingHorizontal: 20 },
  jumboHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15 },
  backBtnIcon: { padding: 5 },
  jumboMatchName: { color: '#fff', fontWeight: '900', fontSize: 14, textTransform: 'uppercase', letterSpacing: 1 },
  scoreRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', marginVertical: 10 },
  mainScore: { fontSize: 72, fontWeight: '900', color: THEME.white },
  wicketScore: { fontSize: 32, fontWeight: '600', color: THEME.secondary, marginBottom: 12, marginLeft: 5 },
  statsRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, paddingVertical: 12, marginTop: 10 },
  statItem: { alignItems: 'center', paddingHorizontal: 30 },
  statLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
  statValue: { color: THEME.white, fontSize: 18, fontWeight: 'bold', marginTop: 4 },
  divider: { width: 1, height: '60%', backgroundColor: 'rgba(255,255,255,0.2)' },
  scorecardLink: { 
      flexDirection: 'row', 
      alignItems: 'center', 
      justifyContent: 'center',
      marginTop: 20,
      backgroundColor: 'rgba(25, 167, 206, 0.1)',
      paddingVertical: 10,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: 'rgba(25, 167, 206, 0.3)'
  },
  scorecardLinkText: { color: THEME.secondary, fontWeight: 'bold', fontSize: 11, letterSpacing: 1, marginRight: 5 },
  content: { 
    flex: 1, 
    backgroundColor: THEME.background, 
    borderTopLeftRadius: 30, 
    borderTopRightRadius: 30, 
    paddingTop: 25 
  },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 25, marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: THEME.primary },
  liveIndicator: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(230, 57, 70, 0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  liveText: { color: THEME.live, fontSize: 10, fontWeight: '900' },
  commentaryList: { paddingHorizontal: 20, paddingBottom: 30 },
  deliveryCard: { backgroundColor: THEME.white, borderRadius: 12, padding: 15, flexDirection: 'row', alignItems: 'center', marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  ballCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F1F2F6', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  wicketBall: { backgroundColor: THEME.live },
  boundaryBall: { backgroundColor: THEME.secondary },
  ballText: { fontWeight: 'bold', color: THEME.primary },
  whiteText: { color: '#fff' },
  deliveryInfo: { flex: 1 },
  overBallText: { fontSize: 12, fontWeight: 'bold', color: THEME.muted, marginBottom: 2 },
  commentaryText: { fontSize: 14, color: THEME.text, lineHeight: 20 },
  emptyCommentary: { alignItems: 'center', marginTop: 50 },
  emptyText: { color: THEME.muted, marginTop: 10, fontWeight: '500' },
  errorText: { marginBottom: 20, color: THEME.muted },
  backBtn: { backgroundColor: THEME.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  backBtnText: { color: '#FFF', fontWeight: 'bold' }
});
