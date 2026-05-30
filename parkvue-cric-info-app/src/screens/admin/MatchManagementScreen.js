import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, FlatList, TouchableOpacity, 
  ActivityIndicator, Modal, TextInput, Alert, SafeAreaView, ScrollView, StatusBar
} from 'react-native';
import { AdminService } from '../../services/AdminService';

const THEME = {
  primary: '#0B2447',
  secondary: '#19A7CE',
  background: '#F8F9FA',
  card: '#FFFFFF',
  text: '#2D3436',
  muted: '#636E72',
  danger: '#E63946',
  live: '#E63946',
  upcoming: '#ECA154',
  completed: '#2A9D8F',
  border: '#F1F2F6'
};

export default function MatchManagementScreen({ navigation }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Dependencies
  const [allTeams, setAllTeams] = useState([]);
  const [allTournaments, setAllTournaments] = useState([]);

  // Form State
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMatchId, setEditingMatchId] = useState(null);
  
  // Using individual states for selection to guarantee immediate re-render
  const [tournamentId, setTournamentId] = useState(null);
  const [tournamentName, setTournamentName] = useState('');
  const [team1Id, setTeam1Id] = useState(null);
  const [team1Name, setTeam1Name] = useState('');
  const [team2Id, setTeam2Id] = useState(null);
  const [team2Name, setTeam2Name] = useState('');
  const [venue, setVenue] = useState('');
  const [status, setStatus] = useState('Upcoming');

  // Selector Overlay State
  const [selectorVisible, setSelectorVisible] = useState(false);
  const [selectorTitle, setSelectorTitle] = useState('');
  const [selectorOptions, setSelectorOptions] = useState([]);
  const [selectorType, setSelectorType] = useState(''); // 'tournament', 'team1', 'team2'

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [m, t, tr] = await Promise.all([
        AdminService.getMatches(),
        AdminService.getTeams(),
        AdminService.getTournaments()
      ]);
      setMatches(m || []);
      setAllTeams(t || []);
      setAllTournaments(tr || []);
    } catch (e) {
      Alert.alert('Error', 'Failed to fetch data.');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (match = null) => {
    if (match) {
        setEditingMatchId(match.id);
        setTournamentId(match.tournament?.id);
        setTournamentName(match.tournament?.name);
        setTeam1Id(match.team1?.id);
        setTeam1Name(match.team1?.name);
        setTeam2Id(match.team2?.id);
        setTeam2Name(match.team2?.name);
        setVenue(match.venue || '');
        setStatus(match.status || 'Upcoming');
    } else {
        setEditingMatchId(null);
        setTournamentId(null);
        setTournamentName('');
        setTeam1Id(null);
        setTeam1Name('');
        setTeam2Id(null);
        setTeam2Name('');
        setVenue('');
        setStatus('Upcoming');
    }
    setModalVisible(true);
  };

  const startSelection = (type) => {
    if (type === 'tournament') {
        setSelectorTitle('Select Tournament');
        setSelectorOptions(allTournaments);
    } else {
        setSelectorTitle(type === 'team1' ? 'Select Home Team' : 'Select Away Team');
        setSelectorOptions(allTeams);
    }
    setSelectorType(type);
    setSelectorVisible(true);
  };

  const handleSelect = (item) => {
    if (selectorType === 'tournament') {
        setTournamentId(item.id);
        setTournamentName(item.name);
    } else if (selectorType === 'team1') {
        setTeam1Id(item.id);
        setTeam1Name(item.name);
    } else if (selectorType === 'team2') {
        setTeam2Id(item.id);
        setTeam2Name(item.name);
    }
    setSelectorVisible(false);
  };

  const handleSave = async () => {
    if (!tournamentId || !team1Id || !team2Id) {
        Alert.alert("Required", "Please select Tournament and both Teams.");
        return;
    }
    if (team1Id === team2Id) {
        Alert.alert("Error", "Teams must be different.");
        return;
    }

    const payload = {
        tournament: { id: tournamentId },
        team1: { id: team1Id },
        team2: { id: team2Id },
        venue,
        status
    };

    try {
      if (editingMatchId) {
        await AdminService.updateMatch(editingMatchId, payload);
      } else {
        await AdminService.createMatch(payload);
      }
      setModalVisible(false);
      loadAll();
    } catch (e) {
      Alert.alert('Error', 'Failed to save match.');
    }
  };

  const handleDelete = (id) => {
    Alert.alert('Delete', 'Delete this match?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await AdminService.deleteMatch(id);
          loadAll();
        } catch (e) { Alert.alert('Error', 'Failed to delete'); }
      }}
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.topHeader}>
        <Text style={styles.headerTitle}>Match Schedules</Text>
        <TouchableOpacity onPress={loadAll}><Text>🔄</Text></TouchableOpacity>
      </View>

      {loading ? <ActivityIndicator size="large" color={THEME.primary} style={{marginTop: 50}} /> : (
        <FlatList 
          data={matches} 
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 20 }}
          renderItem={({item}) => (
            <View style={styles.matchCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.venueTag}>{item.venue || 'TBA'}</Text>
                <View style={[styles.badge, { backgroundColor: item.status === 'Live' ? THEME.live : THEME.upcoming }]}><Text style={styles.badgeText}>{item.status}</Text></View>
              </View>
              <Text style={styles.teamsText}>{item.team1?.shortName} VS {item.team2?.shortName}</Text>
              <View style={styles.cardFooter}>
                <TouchableOpacity onPress={() => openModal(item)} style={styles.iconBtn}><Text>✎ Edit</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.iconBtn}><Text style={{color: THEME.danger}}>🗑 Delete</Text></TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => openModal()}><Text style={styles.fabText}>+</Text></TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <SafeAreaView style={styles.modalBg}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{editingMatchId ? 'Update Match' : 'Create New Match'}</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}><Text style={styles.closeIcon}>✕</Text></TouchableOpacity>
          </View>

          <ScrollView style={{ padding: 25 }} keyboardShouldPersistTaps="always">
            <Text style={styles.label}>TOURNAMENT</Text>
            <TouchableOpacity style={styles.selectBtn} onPress={() => startSelection('tournament')}>
                <Text style={[styles.selectText, !tournamentName && {color: '#999'}]}>{tournamentName || 'Select Tournament...'}</Text>
            </TouchableOpacity>

            <Text style={styles.label}>TEAM 1 (HOME)</Text>
            <TouchableOpacity style={styles.selectBtn} onPress={() => startSelection('team1')}>
                <Text style={[styles.selectText, !team1Name && {color: '#999'}]}>{team1Name || 'Pick Team...'}</Text>
            </TouchableOpacity>

            <Text style={styles.label}>TEAM 2 (AWAY)</Text>
            <TouchableOpacity style={styles.selectBtn} onPress={() => startSelection('team2')}>
                <Text style={[styles.selectText, !team2Name && {color: '#999'}]}>{team2Name || 'Pick Team...'}</Text>
            </TouchableOpacity>

            <Text style={styles.label}>VENUE</Text>
            <TextInput style={styles.input} value={venue} onChangeText={setVenue} placeholder="Enter Venue" />

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}><Text style={styles.saveBtnText}>SAVE MATCH FIXTURE</Text></TouchableOpacity>
          </ScrollView>

          {selectorVisible && (
            <View style={styles.overlay}>
                <View style={styles.overlayHeader}>
                    <Text style={styles.overlayTitle}>{selectorTitle}</Text>
                    <TouchableOpacity onPress={() => setSelectorVisible(false)}><Text style={{color: THEME.danger}}>Cancel</Text></TouchableOpacity>
                </View>
                <FlatList data={selectorOptions} keyExtractor={item => item.id} renderItem={({item}) => (
                    <TouchableOpacity style={styles.option} onPress={() => handleSelect(item)}>
                        <Text style={styles.optionText}>{item.name}</Text>
                    </TouchableOpacity>
                )} />
            </View>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.background },
  topHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 25, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: THEME.primary },
  matchCard: { backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 15, elevation: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  venueTag: { fontSize: 10, color: THEME.muted, fontWeight: 'bold' },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 5 },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: 'bold' },
  teamsText: { fontSize: 20, fontWeight: 'bold', marginVertical: 10, color: THEME.primary },
  cardFooter: { flexDirection: 'row', justifyContent: 'flex-end', gap: 20 },
  iconBtn: { padding: 5 },
  fab: { position: 'absolute', right: 20, bottom: 20, width: 60, height: 60, borderRadius: 30, backgroundColor: THEME.primary, justifyContent: 'center', alignItems: 'center' },
  fabText: { color: '#fff', fontSize: 30 },
  modalBg: { flex: 1, backgroundColor: '#fff' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 25, borderBottomWidth: 1, borderBottomColor: '#eee' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: THEME.primary },
  closeIcon: { fontSize: 22, color: THEME.muted },
  label: { fontSize: 11, fontWeight: 'bold', color: THEME.muted, marginBottom: 8, marginTop: 15 },
  input: { backgroundColor: THEME.background, padding: 18, borderRadius: 12, fontSize: 16, borderWidth: 1, borderColor: '#eee' },
  selectBtn: { backgroundColor: THEME.background, padding: 18, borderRadius: 12, marginBottom: 5, borderWidth: 1, borderColor: '#eee' },
  selectText: { fontSize: 16, fontWeight: '600', color: THEME.primary },
  saveBtn: { backgroundColor: THEME.primary, padding: 20, borderRadius: 15, marginTop: 30, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: 'bold' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: '#fff', zIndex: 1000, paddingTop: 20 },
  overlayHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 25, borderBottomWidth: 1, borderBottomColor: '#eee' },
  overlayTitle: { fontSize: 18, fontWeight: 'bold' },
  option: { padding: 25, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  optionText: { fontSize: 16, fontWeight: 'bold' }
});
