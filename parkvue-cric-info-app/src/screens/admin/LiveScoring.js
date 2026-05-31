import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, 
  Alert, ScrollView, ActivityIndicator, SafeAreaView, StatusBar, FlatList, Modal
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { submitDelivery, fetchInningsByMatchId, createInnings, fetchMatchDetails } from '../../services/MatchService';
import { AdminService } from '../../services/AdminService';

const THEME = {
  primary: '#0B2447',
  secondary: '#19A7CE',
  background: '#F8F9FA',
  card: '#FFFFFF',
  text: '#2D3436',
  muted: '#636E72',
  danger: '#E63946',
  white: '#FFFFFF',
  border: '#F1F2F6'
};

export default function LiveScoring({ route, navigation }) {
  const { matchId, matchName } = route.params;
  
  // Scoring State
  const [runs, setRuns] = useState(0);
  const [extra, setExtra] = useState('None');
  const [isWicket, setIsWicket] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Match/Innings Context
  const [match, setMatch] = useState(null);
  const [innings, setInnings] = useState(null);
  const [battingSquad, setBattingSquad] = useState([]);
  const [bowlingSquad, setBowlingSquad] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active Players
  const [striker, setStriker] = useState(null);
  const [nonStriker, setNonStriker] = useState(null);
  const [bowler, setBowler] = useState(null);

  // Selector Modal State
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerTitle, setPickerTitle] = useState('');
  const [pickerOptions, setPickerOptions] = useState([]);
  const [pickerType, setPickerType] = useState(''); // 'striker', 'nonStriker', 'bowler'

  useEffect(() => {
    setupScoring();
  }, [matchId]);

  const setupScoring = async () => {
    setLoading(true);
    try {
      const matchData = await fetchMatchDetails(matchId);
      setMatch(matchData);

      const allInnings = await fetchInningsByMatchId(matchId);
      let activeInnings = null;

      if (allInnings && allInnings.length > 0) {
        // Find latest active innings
        activeInnings = allInnings.sort((a, b) => b.inningsNumber - a.inningsNumber)[0];
      } else {
        // Create first innings
        activeInnings = await createInnings({
          match: { id: matchId },
          battingTeam: { id: matchData.team1.id },
          bowlingTeam: { id: matchData.team2.id },
          inningsNumber: 1
        });
      }
      setInnings(activeInnings);

      // Fetch Squads
      const squad = await AdminService.getSquad(matchId);
      setBattingSquad(squad.filter(s => s.team.id === activeInnings.battingTeam.id));
      setBowlingSquad(squad.filter(s => s.team.id === activeInnings.bowlingTeam.id));

    } catch (error) {
      Alert.alert("Setup Error", "Failed to initialize scoring engine.");
    } finally {
      setLoading(false);
    }
  };

  const startNewInnings = async () => {
    if (!match) return;
    setLoading(true);
    try {
        // Invert teams
        const nextInningsNum = (innings?.inningsNumber || 1) + 1;
        if (nextInningsNum > 2) {
            Alert.alert("Match Over", "Maximum innings reached.");
            return;
        }

        const newInnings = await createInnings({
            match: { id: match.id },
            battingTeam: { id: innings.bowlingTeam.id },
            bowlingTeam: { id: innings.battingTeam.id },
            inningsNumber: nextInningsNum
        });
        
        setInnings(newInnings);
        // Clear active players for new innings
        setStriker(null);
        setNonStriker(null);
        setBowler(null);
        
        // Refresh squads
        const squad = await AdminService.getSquad(matchId);
        setBattingSquad(squad.filter(s => s.team.id === newInnings.battingTeam.id));
        setBowlingSquad(squad.filter(s => s.team.id === newInnings.bowlingTeam.id));

        Alert.alert("New Innings", `Started Innings ${nextInningsNum}`);
    } catch (e) {
        Alert.alert("Error", "Could not transition to new innings.");
    } finally {
        setLoading(false);
    }
  };

  const openPicker = (type) => {
    setPickerType(type);
    if (type === 'bowler') {
        setPickerTitle('Select Bowler');
        setPickerOptions(bowlingSquad);
    } else {
        setPickerTitle(type === 'striker' ? 'Select Striker' : 'Select Non-Striker');
        setPickerOptions(battingSquad);
    }
    setPickerVisible(true);
  };

  const handlePlayerSelect = (playerObj) => {
    if (pickerType === 'striker') setStriker(playerObj);
    if (pickerType === 'nonStriker') setNonStriker(playerObj);
    if (pickerType === 'bowler') setBowler(playerObj);
    setPickerVisible(false);
  };

  const handleSubmit = async () => {
    if (!innings || !striker || !nonStriker || !bowler) {
        Alert.alert("Validation", "Please select Striker, Non-Striker, and Bowler first.");
        return;
    }

    setSubmitting(true);
    try {
      const payload = {
        innings: { id: innings.id }, 
        batter: { id: striker.id },
        nonStriker: { id: nonStriker.id },
        bowler: { id: bowler.id },
        runsBatter: runs,
        extrasType: extra,
        wicket: isWicket,
        commentary: `${striker.firstName} scored ${runs} runs. ${extra !== 'None' ? extra : ''} ${isWicket ? 'WICKET!' : ''}`
      };
      
      await submitDelivery(payload);
      
      // Basic automation: swap strike on odd runs
      if (runs % 2 !== 0 && !isWicket) {
          const temp = striker;
          setStriker(nonStriker);
          setNonStriker(temp);
      }

      setRuns(0);
      setExtra('None');
      setIsWicket(false);
      // In a real app we'd fetch updated score here
    } catch (error) {
      Alert.alert('Error', 'Failed to record ball.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={THEME.secondary} />
        <Text style={styles.loadingText}>Initializing Engine...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Top Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backIcon}>
          <Ionicons name="close" size={24} color={THEME.primary} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
            <Text style={styles.matchLabel}>{matchName}</Text>
            <Text style={styles.inningsLabel}>INNINGS {innings?.inningsNumber}</Text>
        </View>
        <TouchableOpacity onPress={startNewInnings} style={styles.endInningsBtn}>
            <Text style={styles.endInningsText}>END</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Active Players Selector */}
        <View style={styles.playerSelectionRow}>
            <TouchableOpacity style={[styles.playerBtn, striker && styles.playerBtnActive]} onPress={() => openPicker('striker')}>
                <Text style={styles.roleLabel}>STRIKER</Text>
                <Text style={[styles.playerName, striker && styles.whiteText]} numberOfLines={1}>{striker ? `${striker.firstName} ${striker.lastName}` : 'Pick'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.playerBtn, nonStriker && styles.playerBtnActive]} onPress={() => openPicker('nonStriker')}>
                <Text style={styles.roleLabel}>NON-STRIKER</Text>
                <Text style={[styles.playerName, nonStriker && styles.whiteText]} numberOfLines={1}>{nonStriker ? `${nonStriker.firstName} ${nonStriker.lastName}` : 'Pick'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.playerBtn, { backgroundColor: '#F1F2F6' }, bowler && { backgroundColor: THEME.primary }]} onPress={() => openPicker('bowler')}>
                <Text style={[styles.roleLabel, bowler && { color: 'rgba(255,255,255,0.6)' }]}>BOWLER</Text>
                <Text style={[styles.playerName, bowler && styles.whiteText]} numberOfLines={1}>{bowler ? `${bowler.firstName} ${bowler.lastName}` : 'Pick'}</Text>
            </TouchableOpacity>
        </View>

        <View style={styles.separator} />

        {/* Runs Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>RUNS OFF BAT</Text>
          <View style={styles.grid}>
            {[0, 1, 2, 3, 4, 6].map(v => (
                <TouchableOpacity 
                    key={v}
                    style={[styles.runBtn, runs === v && styles.runBtnActive]} 
                    onPress={() => setRuns(v)}
                >
                    <Text style={[styles.runText, runs === v && styles.whiteText]}>{v}</Text>
                </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Extras Row */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>EXTRAS</Text>
          <View style={styles.extrasRow}>
            {['None', 'Wide', 'No-Ball', 'Bye', 'Leg-Bye'].map(t => (
                <TouchableOpacity 
                    key={t}
                    style={[styles.extraBtn, extra === t && styles.extraBtnActive]} 
                    onPress={() => setExtra(t)}
                >
                    <Text style={[styles.extraText, extra === t && styles.whiteText]}>{t}</Text>
                </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Wicket Toggle */}
        <TouchableOpacity 
          activeOpacity={0.8}
          style={[styles.wicketBtn, isWicket && styles.wicketBtnActive]} 
          onPress={() => setIsWicket(!isWicket)}
        >
          <MaterialCommunityIcons name="cricket" size={24} color={isWicket ? "#fff" : THEME.danger} style={{marginRight: 10}} />
          <Text style={[styles.wicketBtnText, isWicket && styles.whiteText]}>
            {isWicket ? 'WICKET RECORDED' : 'OUT!'}
          </Text>
        </TouchableOpacity>

      </ScrollView>

      {/* Footer Submit */}
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

      {/* Player Picker Overlay */}
      <Modal visible={pickerVisible} transparent={true} animationType="slide">
        <View style={styles.overlay}>
            <View style={styles.pickerContent}>
                <View style={styles.pickerHeader}>
                    <Text style={styles.pickerTitle}>{pickerTitle}</Text>
                    <TouchableOpacity onPress={() => setPickerVisible(false)}><Ionicons name="close" size={24} color={THEME.muted} /></TouchableOpacity>
                </View>
                <FlatList 
                    data={pickerOptions}
                    keyExtractor={item => item.id}
                    renderItem={({item}) => (
                        <TouchableOpacity style={styles.optionBtn} onPress={() => handlePlayerSelect(item.player)}>
                            <Text style={styles.optionName}>{item.player.firstName} {item.player.lastName}</Text>
                            <Text style={styles.optionRole}>{item.player.role}</Text>
                        </TouchableOpacity>
                    )}
                />
            </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  loadingText: { marginTop: 15, color: THEME.primary, fontWeight: 'bold' },
  topHeader: { flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: THEME.border },
  backIcon: { padding: 5 },
  headerInfo: { flex: 1, alignItems: 'center' },
  matchLabel: { fontSize: 13, color: THEME.muted, fontWeight: 'bold' },
  inningsLabel: { fontSize: 11, color: THEME.secondary, fontWeight: '900', marginTop: 2 },
  endInningsBtn: { backgroundColor: 'rgba(230, 57, 70, 0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  endInningsText: { color: THEME.danger, fontSize: 10, fontWeight: 'bold' },
  scrollContent: { padding: 20 },
  
  playerSelectionRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  playerBtn: { flex: 1, backgroundColor: THEME.white, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: THEME.border, alignItems: 'center' },
  playerBtnActive: { backgroundColor: THEME.secondary, borderColor: THEME.secondary },
  roleLabel: { fontSize: 8, fontWeight: '900', color: THEME.muted, marginBottom: 4 },
  playerName: { fontSize: 11, fontWeight: 'bold', color: THEME.primary },
  whiteText: { color: '#fff' },
  
  separator: { height: 1, backgroundColor: THEME.border, marginVertical: 10, marginBottom: 25 },
  section: { marginBottom: 30 },
  sectionLabel: { fontSize: 11, fontWeight: '900', color: THEME.muted, marginBottom: 15, letterSpacing: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  runBtn: { width: 58, height: 58, borderRadius: 29, backgroundColor: THEME.white, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: THEME.border },
  runBtnActive: { backgroundColor: THEME.primary, borderColor: THEME.primary },
  runText: { fontSize: 18, fontWeight: 'bold', color: THEME.primary },
  
  extrasRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  extraBtn: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, backgroundColor: THEME.white, borderWidth: 1, borderColor: THEME.border },
  extraBtnActive: { backgroundColor: THEME.secondary, borderColor: THEME.secondary },
  extraText: { fontSize: 12, fontWeight: 'bold', color: THEME.primary },
  
  wicketBtn: { width: '100%', padding: 20, borderRadius: 15, borderWidth: 2, borderColor: THEME.danger, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
  wicketBtnActive: { backgroundColor: THEME.danger },
  wicketBtnText: { color: THEME.danger, fontWeight: '900', fontSize: 16, letterSpacing: 1 },
  
  footer: { padding: 20, backgroundColor: THEME.white, borderTopWidth: 1, borderTopColor: THEME.border },
  submitBtn: { backgroundColor: THEME.primary, padding: 20, borderRadius: 15, alignItems: 'center' },
  submitBtnText: { color: THEME.white, fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },
  disabled: { opacity: 0.7 },

  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  pickerContent: { backgroundColor: '#fff', borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 25, maxHeight: '70%' },
  pickerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  pickerTitle: { fontSize: 18, fontWeight: 'bold', color: THEME.primary },
  optionBtn: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  optionName: { fontSize: 16, fontWeight: 'bold', color: THEME.primary },
  optionRole: { fontSize: 12, color: THEME.muted, marginTop: 2 }
});
