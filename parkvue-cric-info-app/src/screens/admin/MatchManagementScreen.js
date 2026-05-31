import React, { useState, useEffect, useCallback } from 'react';
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
  border: '#F1F2F6',
  white: '#FFFFFF'
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
      Alert.alert('Network Error', 'Could not sync with the server.');
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
        Alert.alert("Missing Fields", "Tournament and both Teams are mandatory.");
        return;
    }
    if (team1Id === team2Id) {
        Alert.alert("Invalid Matchup", "A team cannot play against itself.");
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
      Alert.alert('Error', 'Failed to save match data.');
    }
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Fixture', 'This will erase all scoring history. Proceed?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete Permanently', style: 'destructive', onPress: async () => {
        try {
          await AdminService.deleteMatch(id);
          loadAll();
        } catch (e) { Alert.alert('Error', 'Failed to delete'); }
      }}
    ]);
  };

  const handleSquadPress = (match) => {
    Alert.alert(
      'Manage Squad',
      'Select a team to edit their playing XI:',
      [
        { text: match.team1?.name || 'Home Team', onPress: () => navigation.navigate('ManageSquad', { matchId: match.id, teamId: match.team1?.id, teamName: match.team1?.name }) },
        { text: match.team2?.name || 'Away Team', onPress: () => navigation.navigate('ManageSquad', { matchId: match.id, teamId: match.team2?.id, teamName: match.team2?.name }) },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const StatusBadge = ({ status }) => {
    const s = status?.toLowerCase();
    const color = s === 'live' ? THEME.live : s === 'completed' ? THEME.completed : THEME.upcoming;
    return (
      <View style={[styles.badge, { backgroundColor: color }]}>
        <Text style={styles.badgeText}>{status?.toUpperCase()}</Text>
      </View>
    );
  };

  const MatchCard = ({ item }) => {
    return (
      <View style={styles.premiumCard}>
        <View style={styles.cardHeader}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Ionicons name="location-outline" size={12} color={THEME.muted} style={{marginRight: 4}} />
            <Text style={styles.venueText}>{item.venue || 'Venue TBA'}</Text>
          </View>
          <StatusBadge status={item.status} />
        </View>
        
        <View style={styles.vsContainer}>
            <View style={styles.teamColumn}>
                <Text style={styles.teamAbbr}>{item.team1?.shortName || 'T1'}</Text>
                <Text style={styles.teamFullName} numberOfLines={1}>{item.team1?.name}</Text>
            </View>
            <View style={styles.vsWrapper}>
                <Text style={styles.vsText}>VS</Text>
            </View>
            <View style={[styles.teamColumn, { alignItems: 'flex-end' }]}>
                <Text style={styles.teamAbbr}>{item.team2?.shortName || 'T2'}</Text>
                <Text style={[styles.teamFullName, { textAlign: 'right' }]} numberOfLines={1}>{item.team2?.name}</Text>
            </View>
        </View>

        <View style={styles.tournamentRow}>
            <Ionicons name="trophy-outline" size={12} color={THEME.muted} style={{marginRight: 6}} />
            <Text style={styles.tournamentLabel}>{item.tournament?.name || 'Unofficial Fixture'}</Text>
        </View>

        <View style={styles.cardFooter}>
            <TouchableOpacity 
                style={styles.actionPill} 
                onPress={() => handleSquadPress(item)}
            >
                <Ionicons name="people-outline" size={14} color={THEME.secondary} style={{marginRight: 6}} />
                <Text style={styles.actionPillText}>MANAGE SQUAD</Text>
            </TouchableOpacity>
            <View style={styles.controlGroup}>
                <TouchableOpacity onPress={() => openModal(item)} style={styles.circleBtn}>
                    <Ionicons name="create-outline" size={18} color={THEME.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item.id)} style={[styles.circleBtn, { backgroundColor: 'rgba(230, 57, 70, 0.1)' }]}>
                    <Ionicons name="trash-outline" size={18} color={THEME.danger} />
                </TouchableOpacity>
            </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.topHeader}>
        <View>
            <Text style={styles.headerTitle}>Match Schedules</Text>
            <Text style={styles.headerSubtitle}>{matches.length} fixtures in database</Text>
        </View>
        <TouchableOpacity style={styles.syncBtn} onPress={loadAll}>
            <Ionicons name="refresh-outline" size={22} color={THEME.primary} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={THEME.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList 
          data={matches} 
          renderItem={({ item }) => <MatchCard item={item} />} 
          keyExtractor={item => item.id} 
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
                <Ionicons name="calendar-outline" size={48} color="#ccc" />
                <Text style={styles.emptyText}>No matches scheduled.</Text>
            </View>
          }
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => openModal()} activeOpacity={0.9}>
        <Ionicons name="add-outline" size={32} color="#fff" />
      </TouchableOpacity>

      {/* Main Creation Modal */}
      <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <SafeAreaView style={styles.modalContent}>
            <View style={styles.modalHeader}>
                <View>
                    <Text style={styles.modalLabel}>{editingMatchId ? 'EDITING FIXTURE' : 'NEW FIXTURE'}</Text>
                    <Text style={styles.modalTitle}>{editingMatchId ? 'Update Match' : 'Schedule Match'}</Text>
                </View>
                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                    <Ionicons name="close-outline" size={24} color={THEME.muted} />
                </TouchableOpacity>
            </View>
            
            <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="always" contentContainerStyle={{ padding: 25 }}>
                <View style={styles.formSection}>
                    <Text style={styles.sectionHeader}>LEAGUE & TEAMS</Text>
                    
                    <Text style={styles.inputLabel}>TOURNAMENT</Text>
                    <TouchableOpacity 
                        style={styles.modernSelect} 
                        onPress={() => startSelection('tournament')}
                    >
                        <Text style={[styles.selectText, !tournamentName && {color: '#999'}]}>
                            {tournamentName || 'Pick a Tournament'}
                        </Text>
                        <Ionicons name="chevron-down" size={18} color={THEME.muted} />
                    </TouchableOpacity>

                    <View style={styles.formRow}>
                        <View style={{flex: 1}}>
                            <Text style={styles.inputLabel}>HOME TEAM</Text>
                            <TouchableOpacity 
                                style={styles.modernSelect} 
                                onPress={() => startSelection('team1')}
                            >
                                <Text style={[styles.selectText, !team1Name && {color: '#999'}]} numberOfLines={1}>
                                    {team1Name || 'Select'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.vsDivider}><Text style={styles.vsDividerText}>vs</Text></View>
                        <View style={{flex: 1}}>
                            <Text style={styles.inputLabel}>AWAY TEAM</Text>
                            <TouchableOpacity 
                                style={styles.modernSelect} 
                                onPress={() => startSelection('team2')}
                            >
                                <Text style={[styles.selectText, !team2Name && {color: '#999'}]} numberOfLines={1}>
                                    {team2Name || 'Select'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                <View style={styles.formSection}>
                    <Text style={styles.sectionHeader}>LOGISTICS & STATUS</Text>
                    
                    <Text style={styles.inputLabel}>VENUE / GROUND</Text>
                    <TextInput 
                        style={styles.modernInput} 
                        value={venue} 
                        onChangeText={setVenue} 
                        placeholder="e.g. Central Park Oval" 
                        placeholderTextColor="#999"
                    />

                    <Text style={styles.inputLabel}>MATCH STATUS</Text>
                    <View style={styles.chipRow}>
                      {['Upcoming', 'Live', 'Completed'].map(s => (
                        <TouchableOpacity 
                          key={s} 
                          style={[styles.statusChip, status === s && styles.statusChipActive]} 
                          onPress={() => setStatus(s)}
                        >
                          <Text style={[styles.statusChipText, status === s && {color: '#fff'}]}>{s}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                </View>

                <TouchableOpacity style={styles.confirmBtn} onPress={handleSave} activeOpacity={0.8}>
                    <Text style={styles.confirmBtnText}>{editingMatchId ? 'UPDATE FIXTURE' : 'CONFIRM SCHEDULE'}</Text>
                </TouchableOpacity>
                <View style={{ height: 100 }} />
            </ScrollView>

            {/* SELECTION OVERLAY (INSTANT UI UPDATE) */}
            {selectorVisible && (
                <View style={styles.selectorOverlay}>
                    <View style={styles.overlayHeader}>
                        <Text style={styles.overlayTitle}>{selectorTitle}</Text>
                        <TouchableOpacity onPress={() => setSelectorVisible(false)} style={styles.overlayClose}>
                            <Text style={styles.overlayCloseText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                    <FlatList 
                        data={selectorOptions} 
                        keyExtractor={item => item.id} 
                        renderItem={({item}) => (
                            <TouchableOpacity style={styles.optionRow} onPress={() => handleSelect(item)}>
                                <View>
                                    <Text style={styles.optionMain}>{item.name}</Text>
                                    <Text style={styles.optionSub}>{item.shortName || 'Registry'}</Text>
                                </View>
                                <Ionicons name="arrow-forward" size={18} color={THEME.secondary} />
                            </TouchableOpacity>
                        )} 
                    />
                </View>
            )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.background },
  topHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 25, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: THEME.border },
  headerTitle: { fontSize: 24, fontWeight: '900', color: THEME.primary, letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 13, color: THEME.muted, marginTop: 4, fontWeight: '600' },
  syncBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: THEME.background, justifyContent: 'center', alignItems: 'center' },
  listContainer: { padding: 20 },
  
  premiumCard: { 
    backgroundColor: THEME.card, 
    borderRadius: 25, 
    padding: 22, 
    marginBottom: 20, 
    elevation: 4, 
    shadowColor: '#000', 
    shadowOpacity: 0.08, 
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 5 }
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  venueText: { fontSize: 11, fontWeight: '800', color: THEME.muted, letterSpacing: 0.8, textTransform: 'uppercase' },
  badge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '900' },
  vsContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f8f8f8', marginBottom: 15 },
  teamColumn: { flex: 1 },
  teamAbbr: { fontSize: 22, fontWeight: '900', color: THEME.primary, letterSpacing: -1 },
  teamFullName: { fontSize: 12, color: THEME.muted, marginTop: 4, fontWeight: '500' },
  vsWrapper: { width: 36, height: 36, borderRadius: 18, backgroundColor: THEME.background, justifyContent: 'center', alignItems: 'center', marginHorizontal: 10 },
  vsText: { fontSize: 10, fontWeight: '900', color: THEME.secondary },
  tournamentRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  tournamentLabel: { fontSize: 12, color: THEME.muted, fontStyle: 'italic', fontWeight: '600' },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  actionPill: { backgroundColor: 'rgba(25, 167, 206, 0.12)', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: THEME.secondary, flexDirection: 'row', alignItems: 'center' },
  actionPillText: { color: THEME.secondary, fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  controlGroup: { flexDirection: 'row', gap: 10 },
  circleBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: THEME.background, justifyContent: 'center', alignItems: 'center' },
  
  fab: { position: 'absolute', right: 25, bottom: 25, width: 65, height: 65, borderRadius: 33, backgroundColor: THEME.primary, justifyContent: 'center', alignItems: 'center', elevation: 10, shadowColor: THEME.primary, shadowOpacity: 0.4, shadowRadius: 15 },
  
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { marginTop: 15, color: THEME.muted, fontWeight: '600' },

  modalContent: { flex: 1, backgroundColor: '#fff' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 25, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  modalLabel: { fontSize: 10, fontWeight: '900', color: THEME.secondary, letterSpacing: 2, marginBottom: 4 },
  modalTitle: { fontSize: 24, fontWeight: '900', color: THEME.primary },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: THEME.background, justifyContent: 'center', alignItems: 'center' },
  formSection: { marginBottom: 35 },
  sectionHeader: { fontSize: 12, fontWeight: 'bold', color: THEME.primary, marginBottom: 20, letterSpacing: 1.5, opacity: 0.8 },
  inputLabel: { fontSize: 10, fontWeight: '800', color: THEME.muted, marginBottom: 10, letterSpacing: 0.5 },
  modernInput: { backgroundColor: THEME.background, padding: 20, borderRadius: 18, fontSize: 16, color: THEME.primary, fontWeight: '600', borderWidth: 1, borderColor: '#eee' },
  modernSelect: { backgroundColor: THEME.background, padding: 20, borderRadius: 18, marginBottom: 20, borderWidth: 1, borderColor: '#eee', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  selectText: { fontSize: 15, fontWeight: '700', color: THEME.primary },
  formRow: { flexDirection: 'row', alignItems: 'center' },
  vsDivider: { width: 40, alignItems: 'center', paddingTop: 30 },
  vsDividerText: { fontSize: 12, fontWeight: '900', color: THEME.secondary, opacity: 0.5 },
  chipRow: { flexDirection: 'row', gap: 10, marginTop: 5 },
  statusChip: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 15, backgroundColor: THEME.background, borderWidth: 1, borderColor: '#eee' },
  statusChipActive: { backgroundColor: THEME.primary, borderColor: THEME.primary },
  statusChipText: { fontSize: 13, fontWeight: 'bold', color: THEME.primary },
  whiteText: { color: '#fff' },
  confirmBtn: { backgroundColor: THEME.primary, padding: 22, borderRadius: 20, alignItems: 'center', shadowColor: THEME.primary, shadowOpacity: 0.3, shadowRadius: 20, elevation: 8 },
  confirmBtnText: { color: '#fff', fontWeight: '900', letterSpacing: 1.5, fontSize: 14 },

  selectorOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: '#fff', zIndex: 2000, paddingTop: 20 },
  overlayHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 25, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  overlayTitle: { fontSize: 20, fontWeight: '900', color: THEME.primary },
  overlayClose: { padding: 10 },
  overlayCloseText: { color: THEME.danger, fontWeight: 'bold' },
  optionRow: { padding: 25, borderBottomWidth: 1, borderBottomColor: '#f9f9f8', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  optionMain: { fontSize: 17, fontWeight: '800', color: THEME.primary },
  optionSub: { fontSize: 11, color: THEME.muted, fontWeight: 'bold', marginTop: 4, textTransform: 'uppercase' }
});
