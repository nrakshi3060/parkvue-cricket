import React, { useState, useEffect, useCallback } from 'react';
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
  border: '#F1F2F6',
  accent: '#A5D7E8'
};

export default function MatchManagementScreen({ navigation }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMatch, setEditingMatch] = useState(null);
  const [formData, setFormData] = useState({ status: 'Upcoming', venue: '' });

  // Relational Dependencies
  const [allTeams, setAllTeams] = useState([]);
  const [allTournaments, setAllTournaments] = useState([]);
  
  // Custom Selector State
  const [selectorVisible, setSelectorVisible] = useState(false);
  const [selectorTitle, setSelectorTitle] = useState('');
  const [selectorOptions, setSelectorOptions] = useState([]);
  const [targetField, setTargetField] = useState('');
  const [targetDisplayField, setTargetDisplayField] = useState('');

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

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const openSelector = (title, options, field, displayField) => {
    setSelectorTitle(title);
    setSelectorOptions(options);
    setTargetField(field);
    setTargetDisplayField(displayField);
    setSelectorVisible(true);
  };

  const handleSelect = (item) => {
    setFormData(prev => ({
        ...prev,
        [targetField]: { id: item.id },
        [targetDisplayField]: item.name
    }));
    setSelectorVisible(false);
  };

  const handleSave = async () => {
    if (!formData.tournament?.id || !formData.team1?.id || !formData.team2?.id) {
        Alert.alert("Missing Fields", "Tournament and both Teams are mandatory.");
        return;
    }
    if (formData.team1.id === formData.team2.id) {
        Alert.alert("Invalid Matchup", "A team cannot play against itself.");
        return;
    }

    try {
      if (editingMatch) {
        await AdminService.updateMatch(editingMatch.id, formData);
      } else {
        await AdminService.createMatch(formData);
      }
      setModalVisible(false);
      loadAll();
    } catch (e) {
      Alert.alert('Error', 'Failed to save match data.');
    }
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Fixture', 'This will erase all live scoring data for this match. Proceed?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete Permanently', style: 'destructive', onPress: async () => {
        try {
          await AdminService.deleteMatch(id);
          loadAll();
        } catch (e) { Alert.alert('Error', 'Failed to delete'); }
      }}
    ]);
  };

  const openModal = (match = null) => {
    if (match) {
        setEditingMatch(match);
        setFormData({
            ...match,
            tournamentName: match.tournament?.name,
            team1Name: match.team1?.name,
            team2Name: match.team2?.name
        });
    } else {
        setEditingMatch(null);
        setFormData({ status: 'Upcoming', venue: '' });
    }
    setModalVisible(true);
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
          <Text style={styles.venueText}>{item.venue || 'Venue TBA'}</Text>
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

        <Text style={styles.tournamentLabel}>{item.tournament?.name || 'Unofficial Fixture'}</Text>

        <View style={styles.cardFooter}>
            <TouchableOpacity 
                style={styles.actionPill} 
                onPress={() => navigation.navigate('ManageSquad', { matchId: item.id, teamId: item.team1.id, teamName: item.team1.name })}
            >
                <Text style={styles.actionPillText}>MANAGE SQUAD</Text>
            </TouchableOpacity>
            <View style={styles.controlGroup}>
                <TouchableOpacity onPress={() => openModal(item)} style={styles.circleBtn}>
                    <Text style={styles.circleBtnText}>✎</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item.id)} style={[styles.circleBtn, { backgroundColor: 'rgba(230, 57, 70, 0.1)' }]}>
                    <Text style={[styles.circleBtnText, { color: THEME.danger }]}>🗑</Text>
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
            <Text style={styles.syncIcon}>🔄</Text>
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
                <Text style={styles.emptyIcon}>📅</Text>
                <Text style={styles.emptyText}>No matches scheduled.</Text>
            </View>
          }
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => openModal()} activeOpacity={0.9}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* CREATE / EDIT MODAL */}
      <Modal visible={modalVisible} animationType="slide">
        <SafeAreaView style={styles.modalContent}>
            <View style={styles.modalHeader}>
                <View>
                    <Text style={styles.modalLabel}>{editingMatch ? 'EDITING FIXTURE' : 'NEW FIXTURE'}</Text>
                    <Text style={styles.modalTitle}>{editingMatch ? 'Update Match' : 'Schedule Match'}</Text>
                </View>
                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                    <Text style={styles.closeText}>✕</Text>
                </TouchableOpacity>
            </View>
            
            <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="always" contentContainerStyle={{ padding: 25 }}>
                <View style={styles.formSection}>
                    <Text style={styles.sectionHeader}>LEAGUE & TEAMS</Text>
                    
                    <Text style={styles.inputLabel}>TOURNAMENT / SERIES</Text>
                    <TouchableOpacity 
                        style={styles.modernSelect} 
                        onPress={() => startSelection('Select Tournament', allTournaments, 'tournament', 'tournamentName')}
                    >
                        <Text style={[styles.selectText, !formData.tournamentName && {color: '#999'}]}>
                            {formData.tournamentName || 'Pick a Tournament'}
                        </Text>
                        <Text style={styles.selectArrow}>▾</Text>
                    </TouchableOpacity>

                    <View style={styles.formRow}>
                        <View style={{flex: 1}}>
                            <Text style={styles.inputLabel}>HOME TEAM</Text>
                            <TouchableOpacity 
                                style={styles.modernSelect} 
                                onPress={() => startSelection('Select Home Team', allTeams, 'team1', 'team1Name')}
                            >
                                <Text style={[styles.selectText, !formData.team1Name && {color: '#999'}]} numberOfLines={1}>
                                    {formData.team1Name || 'Select'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.vsDivider}><Text style={styles.vsDividerText}>vs</Text></View>
                        <View style={{flex: 1}}>
                            <Text style={styles.inputLabel}>AWAY TEAM</Text>
                            <TouchableOpacity 
                                style={styles.modernSelect} 
                                onPress={() => startSelection('Select Away Team', allTeams, 'team2', 'team2Name')}
                            >
                                <Text style={[styles.selectText, !formData.team2Name && {color: '#999'}]} numberOfLines={1}>
                                    {formData.team2Name || 'Select'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                <View style={styles.formSection}>
                    <Text style={styles.sectionHeader}>LOGISTICS & STATE</Text>
                    
                    <Text style={styles.inputLabel}>VENUE / STADIUM</Text>
                    <TextInput 
                        style={styles.modernInput} 
                        value={formData.venue} 
                        onChangeText={v => updateField('venue', v)} 
                        placeholder="Enter stadium name" 
                        placeholderTextColor="#999"
                    />

                    <Text style={styles.inputLabel}>MATCH STATUS</Text>
                    <View style={styles.chipRow}>
                      {['Upcoming', 'Live', 'Completed'].map(s => (
                        <TouchableOpacity 
                          key={s} 
                          style={[styles.statusChip, formData.status === s && styles.statusChipActive]} 
                          onPress={() => updateField('status', s)}
                        >
                          <Text style={[styles.statusChipText, formData.status === s && {color: '#fff'}]}>{s}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                </View>

                <TouchableOpacity style={styles.confirmBtn} onPress={handleSave} activeOpacity={0.8}>
                    <Text style={styles.confirmBtnText}>{editingMatch ? 'UPDATE FIXTURE' : 'CONFIRM SCHEDULE'}</Text>
                </TouchableOpacity>
                <View style={{ height: 100 }} />
            </ScrollView>

            {/* SELECTION OVERLAY (INSTANT FEEDBACK) */}
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
                                    <Text style={styles.optionSub}>{item.shortName || 'Active Entry'}</Text>
                                </View>
                                <Text style={styles.optionArrow}>→</Text>
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
  syncIcon: { fontSize: 18 },
  listContainer: { padding: 20 },
  
  // Premium Card Redesign
  premiumCard: { 
    backgroundColor: THEME.card, 
    borderRadius: 25, 
    padding: 20, 
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
  tournamentLabel: { fontSize: 12, color: THEME.muted, fontStyle: 'italic', marginBottom: 20 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  actionPill: { backgroundColor: 'rgba(25, 167, 206, 0.12)', paddingHorizontal: 18, paddingVertical: 12, borderRadius: 15, borderWidth: 1, borderColor: THEME.secondary },
  actionPillText: { color: THEME.secondary, fontSize: 11, fontWeight: '900', letterSpacing: 1 },
  controlGroup: { flexDirection: 'row', gap: 10 },
  circleBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: THEME.background, justifyContent: 'center', alignItems: 'center' },
  circleBtnText: { fontSize: 18 },
  
  fab: { position: 'absolute', right: 25, bottom: 25, width: 65, height: 65, borderRadius: 33, backgroundColor: THEME.primary, justifyContent: 'center', alignItems: 'center', elevation: 10, shadowColor: THEME.primary, shadowOpacity: 0.4, shadowRadius: 15 },
  fabText: { color: '#fff', fontSize: 35, fontWeight: '200' },
  
  emptyContainer: { alignItems: 'center', marginTop: 80 },
  emptyIcon: { fontSize: 50, marginBottom: 15, opacity: 0.3 },
  emptyText: { color: THEME.muted, fontSize: 16, fontWeight: '600' },

  // Modal UI Overhaul
  modalContent: { flex: 1, backgroundColor: '#fff' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 25, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  modalLabel: { fontSize: 10, fontWeight: '900', color: THEME.secondary, letterSpacing: 2, marginBottom: 4 },
  modalTitle: { fontSize: 24, fontWeight: '900', color: THEME.primary, letterSpacing: -0.5 },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: THEME.background, justifyContent: 'center', alignItems: 'center' },
  closeText: { fontSize: 16, color: THEME.muted },
  formSection: { marginBottom: 35 },
  sectionHeader: { fontSize: 12, fontWeight: 'bold', color: THEME.primary, marginBottom: 20, letterSpacing: 1.5, opacity: 0.8 },
  inputLabel: { fontSize: 10, fontWeight: '800', color: THEME.muted, marginBottom: 10, letterSpacing: 0.5 },
  modernInput: { backgroundColor: THEME.background, padding: 20, borderRadius: 18, fontSize: 16, color: THEME.primary, fontWeight: '600', borderWidth: 1, borderColor: '#eee' },
  modernSelect: { backgroundColor: THEME.background, padding: 20, borderRadius: 18, marginBottom: 20, borderWidth: 1, borderColor: '#eee', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  selectText: { fontSize: 15, fontWeight: '700', color: THEME.primary },
  selectArrow: { color: THEME.muted, fontSize: 18 },
  formRow: { flexDirection: 'row', alignItems: 'center' },
  vsDivider: { width: 40, alignItems: 'center', paddingTop: 30 },
  vsDividerText: { fontSize: 12, fontWeight: '900', color: THEME.secondary, opacity: 0.5 },
  chipRow: { flexDirection: 'row', gap: 10, marginTop: 5 },
  statusChip: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 15, backgroundColor: THEME.background, borderWidth: 1, borderColor: '#eee' },
  statusChipActive: { backgroundColor: THEME.primary, borderColor: THEME.primary },
  statusChipText: { fontSize: 13, fontWeight: 'bold', color: THEME.primary },
  confirmBtn: { backgroundColor: THEME.primary, padding: 22, borderRadius: 20, alignItems: 'center', shadowColor: THEME.primary, shadowOpacity: 0.3, shadowRadius: 20, elevation: 8 },
  confirmBtnText: { color: '#fff', fontWeight: '900', letterSpacing: 1.5, fontSize: 14 },

  // Selector UI Overhaul
  selectorOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: '#fff', zIndex: 2000 },
  overlayHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 25, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  overlayTitle: { fontSize: 20, fontWeight: '900', color: THEME.primary },
  overlayClose: { padding: 10 },
  overlayCloseText: { color: THEME.danger, fontWeight: 'bold' },
  optionRow: { padding: 25, borderBottomWidth: 1, borderBottomColor: '#f9f9f8', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  optionMain: { fontSize: 17, fontWeight: '800', color: THEME.primary },
  optionSub: { fontSize: 11, color: THEME.muted, fontWeight: 'bold', marginTop: 4, textTransform: 'uppercase' },
  optionArrow: { color: THEME.secondary, fontSize: 20, fontWeight: 'bold' }
});
