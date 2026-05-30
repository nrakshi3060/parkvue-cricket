import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, 
  Alert, ScrollView, ActivityIndicator, SafeAreaView, StatusBar 
} from 'react-native';
import { submitDelivery, fetchInningsByMatchId, createInnings, fetchMatchDetails } from '../../services/MatchService';

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

export default function LiveScoring({ route, navigation }) {
  const { matchId, matchName } = route.params;
  const [runs, setRuns] = useState(0);
  const [extra, setExtra] = useState('None');
  const [isWicket, setIsWicket] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [inningsId, setInningsId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const setupScoring = async () => {
      try {
        const innings = await fetchInningsByMatchId(matchId);
        if (innings && innings.length > 0) {
          setInningsId(innings[0].id);
        } else {
          const match = await fetchMatchDetails(matchId);
          if (match) {
            const newInnings = await createInnings({
              match: { id: matchId },
              battingTeam: { id: match.team1.id },
              bowlingTeam: { id: match.team2.id },
              inningsNumber: 1
            });
            setInningsId(newInnings.id);
          }
        }
      } catch (error) {
        Alert.alert("Initialization Error", "Could not prepare match for scoring.");
      } finally {
        setLoading(false);
      }
    };
    setupScoring();
  }, [matchId]);

  const handleSubmit = async () => {
    if (!inningsId) {
      Alert.alert("Error", "No active innings found to score.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        innings: { id: inningsId }, 
        runsBatter: runs,
        extrasType: extra,
        wicket: isWicket,
        overNumber: 0,
        ballNumber: 0,
        commentary: `${runs} runs scored. ${extra !== 'None' ? extra : ''} ${isWicket ? 'WICKET!' : ''}`
      };
      
      await submitDelivery(payload);
      // Reset local state for next ball
      setRuns(0);
      setExtra('None');
      setIsWicket(false);
    } catch (error) {
      Alert.alert('Error', 'Could not submit ball.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={THEME.secondary} />
        <Text style={styles.loadingText}>Configuring Match Engine...</Text>
      </View>
    );
  }

  const RunButton = ({ value }) => (
    <TouchableOpacity 
      style={[styles.runBtn, runs === value && styles.runBtnActive]} 
      onPress={() => setRuns(value)}
    >
      <Text style={[styles.runText, runs === value && styles.whiteText]}>{value}</Text>
    </TouchableOpacity>
  );

  const ExtraButton = ({ type }) => (
    <TouchableOpacity 
      style={[styles.extraBtn, extra === type && styles.extraBtnActive]} 
      onPress={() => setExtra(type)}
    >
      <Text style={[styles.extraText, extra === type && styles.whiteText]}>{type}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Match Official</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.matchCard}>
          <Text style={styles.matchNameText}>{matchName}</Text>
          <View style={styles.inningsBadge}>
            <Text style={styles.inningsText}>INNINGS 1</Text>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>RUNS OFF BAT</Text>
          <View style={styles.grid}>
            {[0, 1, 2, 3, 4, 6].map(v => <RunButton key={v} value={v} />)}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>EXTRAS</Text>
          <View style={styles.grid}>
            {['None', 'Wide', 'No-Ball', 'Bye', 'Leg-Bye'].map(t => <ExtraButton key={t} type={t} />)}
          </View>
        </View>

        <View style={styles.section}>
          <TouchableOpacity 
            activeOpacity={0.8}
            style={[styles.wicketBtn, isWicket && styles.wicketBtnActive]} 
            onPress={() => setIsWicket(!isWicket)}
          >
            <Text style={[styles.wicketBtnText, isWicket && styles.whiteText]}>
              {isWicket ? 'WICKET SELECTED' : 'OUT!'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          activeOpacity={0.9}
          style={[styles.submitBtn, submitting && styles.disabled]} 
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.submitBtnText}>SUBMIT DELIVERY</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: THEME.background },
  loadingText: { marginTop: 15, color: THEME.primary, fontWeight: 'bold' },
  topBar: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 20,
    backgroundColor: THEME.white,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border
  },
  backIcon: { fontSize: 20, color: THEME.primary, fontWeight: 'bold' },
  topBarTitle: { fontSize: 16, fontWeight: 'bold', color: THEME.primary, textTransform: 'uppercase', letterSpacing: 1 },
  scrollContent: { padding: 20 },
  matchCard: { 
    backgroundColor: THEME.primary, 
    borderRadius: 16, 
    padding: 20, 
    alignItems: 'center',
    marginBottom: 25
  },
  matchNameText: { color: THEME.white, fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
  inningsBadge: { 
    backgroundColor: THEME.secondary, 
    paddingHorizontal: 10, 
    paddingVertical: 4, 
    borderRadius: 4, 
    marginTop: 10 
  },
  inningsText: { color: THEME.white, fontSize: 10, fontWeight: '900' },
  section: { marginBottom: 30 },
  sectionLabel: { fontSize: 12, fontWeight: '900', color: THEME.muted, marginBottom: 15, letterSpacing: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  runBtn: { 
    width: 65, 
    height: 65, 
    borderRadius: 33, 
    backgroundColor: THEME.white, 
    justifyContent: 'center', 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    elevation: 2
  },
  runBtnActive: { backgroundColor: THEME.primary, borderColor: THEME.primary },
  runText: { fontSize: 20, fontWeight: 'bold', color: THEME.primary },
  extraBtn: { 
    paddingHorizontal: 18, 
    paddingVertical: 12, 
    borderRadius: 10, 
    backgroundColor: THEME.white,
    borderWidth: 1,
    borderColor: THEME.border
  },
  extraBtnActive: { backgroundColor: THEME.secondary, borderColor: THEME.secondary },
  extraText: { fontSize: 14, fontWeight: 'bold', color: THEME.primary },
  wicketBtn: { 
    width: '100%', 
    padding: 20, 
    borderRadius: 12, 
    borderWidth: 2, 
    borderColor: THEME.live, 
    alignItems: 'center' 
  },
  wicketBtnActive: { backgroundColor: THEME.live },
  wicketBtnText: { color: THEME.live, fontWeight: '900', fontSize: 18, letterSpacing: 2 },
  footer: { 
    padding: 20, 
    backgroundColor: THEME.white, 
    borderTopWidth: 1, 
    borderTopColor: THEME.border 
  },
  submitBtn: { 
    backgroundColor: THEME.primary, 
    padding: 20, 
    borderRadius: 12, 
    alignItems: 'center' 
  },
  submitBtnText: { color: THEME.white, fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },
  whiteText: { color: THEME.white },
  disabled: { opacity: 0.7 }
});
