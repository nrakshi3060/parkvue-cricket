import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, FlatList, TouchableOpacity, 
  ActivityIndicator, Modal, TextInput, Alert, SafeAreaView, ScrollView, StatusBar
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
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
  
  // Decoupled selection state to ensure instant UI re-renders
  const [tournamentId, setTournamentId] = useState(null);
  const [tournamentName, setTournamentName] = useState('');
  const [team1Id, setTeam1Id] = useState(null);
  const [team1Name, setTeam1Name] = useState('');
  const [team2Id, setTeam2Id] = useState(null);
  const [team2Name, setTeam2Name] = useState('');
  const [venue, setVenue] = useState('');
  const [status, setStatus] = useState('Upcoming');

  // Inline Selector Overlay State
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
        <TouchableOpacity onPress={loadAll} style={styles.syncBtn}>
            <Ionicons name="refresh-outline" size={22} color={THEME.primary} />
        </TouchableOpacity>
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
                <View style={[styles.badge, { backgroundColor: item.status === 'Live' ? THEME.live : THEME.upcoming }]}>
                    <Text style={styles.badgeText}>{item.status?.toUpperCase()}</Text>
                </View>
              </View>
              <Text style={styles.teamsText}>{item.team1?.shortName} VS {item.team2?.shortName}</Text>
              <View style={styles.cardFooter}>
                <TouchableOpacity onPress={() => openModal(item)} style={styles.iconBtn}>
                    <Ionicons name="create-outline" size={18} color={THEME.secondary} />
                    <Text style={[styles.iconLabel, {color: THEME.secondary}]}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.iconBtn}>
                    <Ionicons name="trash-outline" size={18} color={THEME.danger} />
                    <Text style={[styles.iconLabel, {color: THEME.danger}]}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
                <Ionicons name="calendar-outline" size={48} color="#ccc" />
                <Text style={styles.emptyText}>No matches scheduled</Text>
            </View>
          }
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => openModal()}>
        <Ionicons name="add-outline" size={32} color="#fff" />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <SafeAreaView style={styles.modalBg}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{editingMatchId ? 'Update Match' : 'Create New Match'}</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close-outline" size={28} color={THEME.muted} />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ padding: 25 }} keyboardShouldPersistTaps="always">
            <Text style={styles.label}>TOURNAMENT</Text>
            <TouchableOpacity style={styles.selectBtn} onPress={() => startSelection('tournament')}>
                <Text style={[styles.selectText, !tournamentName && {color: '#999'}]}>{tournamentName || 'Select Tournament...'}</Text>
                <Ionicons name="chevron-down" size={18} color={THEME.muted} />
            </TouchableOpacity>

            <Text style={styles.label}>TEAM 1 (HOME)</Text>
            <TouchableOpacity style={styles.selectBtn} onPress={() => startSelection('team1')}>
                <Text style={[styles.selectText, !team1Name && {color: '#999'}]}>{team1Name || 'Pick Team...'}</Text>
                <Ionicons name="chevron-down" size={18} color={THEME.muted} />
            </TouchableOpacity>

            <Text style={styles.label}>TEAM 2 (AWAY)</Text>
            <TouchableOpacity style={styles.selectBtn} onPress={() => startSelection('team2')}>
                <Text style={[styles.selectText, !team2Name && {color: '#999'}]}>{team2Name || 'Pick Team...'}</Text>
                <Ionicons name="chevron-down" size={18} color={THEME.muted} />
            </TouchableOpacity>

            <Text style={styles.label}>VENUE</Text>
            <TextInput style={styles.input} value={venue} onChangeText={setVenue} placeholder="Enter Venue" />

            <Text style={styles.label}>MATCH STATUS</Text>
            <View style={styles.chipRow}>
              {['Upcoming', 'Live', 'Completed'].map(s => (
                <TouchableOpacity 
                  key={s} 
                  style={[styles.chip, status === s && styles.chipActive]} 
                  onPress={() => setStatus(s)}
                >
                  <Text style={[styles.chipText, status === s && styles.whiteText]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveBtnText}>SAVE MATCH FIXTURE</Text>
            </TouchableOpacity>
          </ScrollView>

          {selectorVisible && (
            <View style={styles.overlay}>
                <View style={styles.overlayHeader}>
                    <Text style={styles.overlayTitle}>{selectorTitle}</Text>
                    <TouchableOpacity onPress={() => setSelectorVisible(false)}>
                        <Ionicons name="close-circle-outline" size={24} color={THEME.danger} />
                    </TouchableOpacity>
                </View>
                <FlatList data={selectorOptions} keyExtractor={item => item.id} renderItem={({item}) => (
                    <TouchableOpacity style={styles.option} onPress={() => handleSelect(item)}>
                        <Text style={styles.optionText}>{item.name}</Text>
                        <Ionicons name="arrow-forward-outline" size={18} color={THEME.secondary} />
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
  topHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 25, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: THEME.primary },
  syncBtn: { padding: 5 },
  matchCard: { backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 15, elevation: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  venueTag: { fontSize: 10, color: THEME.muted, fontWeight: 'bold', textTransform: 'uppercase' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: 'bold' },
  teamsText: { fontSize: 22, fontWeight: '900', marginVertical: 12, color: THEME.primary, letterSpacing: -0.5 },
  cardFooter: { flexDirection: 'row', justifyContent: 'flex-end', gap: 15, marginTop: 5 },
  iconBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: THEME.background, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  iconLabel: { fontSize: 12, fontWeight: 'bold', marginLeft: 6 },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { marginTop: 15, color: THEME.muted, fontWeight: '600' },
  fab: { position: 'absolute', right: 25, bottom: 25, width: 65, height: 65, borderRadius: 33, backgroundColor: THEME.primary, justifyContent: 'center', alignItems: 'center', elevation: 8, shadowColor: THEME.primary, shadowOpacity: 0.3, shadowRadius: 10 },
  fabText: { color: '#fff', fontSize: 30 },
  modalBg: { flex: 1, backgroundColor: '#fff' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 25, borderBottomWidth: 1, borderBottomColor: '#eee' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: THEME.primary },
  label: { fontSize: 11, fontWeight: 'bold', color: THEME.muted, marginBottom: 8, marginTop: 20, letterSpacing: 1 },
  input: { backgroundColor: THEME.background, padding: 18, borderRadius: 15, fontSize: 16, borderWidth: 1, borderColor: '#eee' },
  selectBtn: { backgroundColor: THEME.background, padding: 18, borderRadius: 15, borderWidth: 1, borderColor: '#eee', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  selectText: { fontSize: 16, fontWeight: '600', color: THEME.primary },
  chipRow: { flexDirection: 'row', gap: 8, marginTop: 5 },
  chip: { paddingHorizontal: 15, paddingVertical: 10, borderRadius: 10, backgroundColor: THEME.background, borderWidth: 1, borderColor: '#eee' },
  chipActive: { backgroundColor: THEME.primary, borderColor: THEME.primary },
  chipText: { fontSize: 13, fontWeight: 'bold', color: THEME.primary },
  whiteText: { color: '#fff' },
  saveBtn: { backgroundColor: THEME.primary, padding: 20, borderRadius: 15, marginTop: 40, alignItems: 'center', elevation: 5 },
  saveBtnText: { color: '#fff', fontWeight: 'bold', letterSpacing: 1 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: '#fff', zIndex: 1000, paddingTop: 20 },
  overlayHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 25, borderBottomWidth: 1, borderBottomColor: '#eee' },
  overlayTitle: { fontSize: 18, fontWeight: 'bold' },
  option: { padding: 25, borderBottomWidth: 1, borderBottomColor: '#f5f5f5', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  optionText: { fontSize: 16, fontWeight: 'bold', color: THEME.primary }
});
