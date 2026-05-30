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
  border: '#F1F2F6'
};

export default function ManageEntityScreen({ route, navigation }) {
  const { entityType } = route.params;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals and Forms
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});

  // Sub-Selector State (Using View instead of nested Modal for stability)
  const [allTeams, setAllTeams] = useState([]);
  const [allTournaments, setAllTournaments] = useState([]);
  const [selectorVisible, setSelectorVisible] = useState(false);
  const [selectorTitle, setSelectorTitle] = useState('');
  const [selectorOptions, setSelectorOptions] = useState([]);
  const [targetField, setTargetField] = useState('');
  const [targetDisplayField, setTargetDisplayField] = useState('');

  const getEntityLabel = useCallback(() => {
    if (entityType === 'matches') return 'Match';
    if (entityType === 'players') return 'Player';
    if (entityType === 'teams') return 'Team';
    if (entityType === 'tournaments') return 'Tournament';
    return 'Item';
  }, [entityType]);

  useEffect(() => {
    navigation.setOptions({ 
        title: `Manage ${entityType.charAt(0).toUpperCase() + entityType.slice(1)}`,
        headerStyle: { backgroundColor: THEME.background },
        headerTintColor: THEME.primary,
        headerShadowVisible: false,
    });
    loadData();
    if (entityType === 'matches') {
        loadDependencies();
    }
  }, [entityType]);

  const loadData = async () => {
    setLoading(true);
    try {
      let result;
      if (entityType === 'tournaments') result = await AdminService.getTournaments();
      if (entityType === 'teams') result = await AdminService.getTeams();
      if (entityType === 'players') result = await AdminService.getPlayers();
      if (entityType === 'matches') result = await AdminService.getMatches();
      setData(result || []);
    } catch (e) {
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadDependencies = async () => {
    try {
        const teams = await AdminService.getTeams();
        const tournaments = await AdminService.getTournaments();
        setAllTeams(teams || []);
        setAllTournaments(tournaments || []);
    } catch (e) {
        console.error("Failed to load match dependencies", e);
    }
  };

  const handleSave = async () => {
    if (entityType === 'matches' && (!formData.tournament?.id || !formData.team1?.id || !formData.team2?.id)) {
        Alert.alert("Required Fields", "Please select Tournament and both Teams.");
        return;
    }

    try {
      if (editingItem) {
        if (entityType === 'tournaments') await AdminService.updateTournament(editingItem.id, formData);
        if (entityType === 'teams') await AdminService.updateTeam(editingItem.id, formData);
        if (entityType === 'players') await AdminService.updatePlayer(editingItem.id, formData);
        if (entityType === 'matches') await AdminService.updateMatch(editingItem.id, formData);
      } else {
        if (entityType === 'tournaments') await AdminService.createTournament(formData);
        if (entityType === 'teams') await AdminService.createTeam(formData);
        if (entityType === 'players') await AdminService.createPlayer(formData);
        if (entityType === 'matches') await AdminService.createMatch(formData);
      }
      setModalVisible(false);
      loadData();
    } catch (e) {
      Alert.alert('Error', 'Failed to save.');
    }
  };

  const handleDelete = (id) => {
    Alert.alert('Delete', 'Confirm deletion?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          if (entityType === 'tournaments') await AdminService.deleteTournament(id);
          if (entityType === 'teams') await AdminService.deleteTeam(id);
          if (entityType === 'players') await AdminService.deletePlayer(id);
          if (entityType === 'matches') await AdminService.deleteMatch(id);
          loadData();
        } catch (e) { Alert.alert('Error', 'Failed to delete'); }
      }}
    ]);
  };

  const openModal = (item = null) => {
    setEditingItem(item);
    if (item) {
        const initialForm = { ...item };
        if (entityType === 'matches') {
            initialForm.tournamentName = item.tournament?.name;
            initialForm.team1Name = item.team1?.name;
            initialForm.team2Name = item.team2?.name;
        }
        setFormData(initialForm);
    } else {
        setFormData({ status: 'Upcoming', venue: '' });
    }
    setModalVisible(true);
  };

  const startSelection = (title, options, field, displayField) => {
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

  const MatchCard = ({ item }) => {
    const status = item.status?.toLowerCase();
    const statusColor = status === 'live' ? THEME.live : status === 'completed' ? THEME.completed : THEME.upcoming;
    return (
      <View style={styles.verboseCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.venueTag}>{item.venue || 'TBA'}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}><Text style={styles.statusText}>{item.status?.toUpperCase()}</Text></View>
        </View>
        <Text style={styles.teamNameText}>{item.team1?.shortName || 'T1'} VS {item.team2?.shortName || 'T2'}</Text>
        <View style={styles.actionBar}>
          <TouchableOpacity onPress={() => openModal(item)} style={styles.iconBtn}><Text>✎</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.iconBtn}><Text style={{color: THEME.danger}}>🗑</Text></TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {loading ? <ActivityIndicator size="large" color={THEME.primary} style={{ marginTop: 50 }} /> : (
        <FlatList data={data} renderItem={({ item }) => entityType === 'matches' ? <MatchCard item={item} /> : <View style={styles.genericCard}><Text>{item.name || item.firstName}</Text></View>} keyExtractor={item => item.id} contentContainerStyle={styles.listContent} />
      )}
      <TouchableOpacity style={styles.fab} onPress={() => openModal()}><Text style={styles.fabText}>+</Text></TouchableOpacity>

      {/* Main Form Modal */}
      <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{editingItem ? 'Edit' : 'Create New'} {getEntityLabel()}</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}><Text style={styles.closeIcon}>✕</Text></TouchableOpacity>
          </View>
          
          <ScrollView style={{ flex: 1, padding: 25 }} keyboardShouldPersistTaps="always">
            {entityType === 'matches' && (
              <>
                <Text style={styles.label}>TOURNAMENT</Text>
                <TouchableOpacity style={styles.selectorBtn} onPress={() => startSelection('Pick Tournament', allTournaments, 'tournament', 'tournamentName')}>
                    <Text style={[styles.selectorBtnText, !formData.tournamentName && {color: '#999'}]}>{formData.tournamentName || 'Select Tournament...'}</Text>
                </TouchableOpacity>

                <Text style={styles.label}>TEAM 1 (HOME)</Text>
                <TouchableOpacity style={styles.selectorBtn} onPress={() => startSelection('Pick Team 1', allTeams, 'team1', 'team1Name')}>
                    <Text style={[styles.selectorBtnText, !formData.team1Name && {color: '#999'}]}>{formData.team1Name || 'Pick Team...'}</Text>
                </TouchableOpacity>

                <Text style={styles.label}>TEAM 2 (AWAY)</Text>
                <TouchableOpacity style={styles.selectorBtn} onPress={() => startSelection('Pick Team 2', allTeams, 'team2', 'team2Name')}>
                    <Text style={[styles.selectorBtnText, !formData.team2Name && {color: '#999'}]}>{formData.team2Name || 'Pick Team...'}</Text>
                </TouchableOpacity>

                <Text style={styles.label}>VENUE / GROUND</Text>
                <TextInput 
                    style={styles.input} 
                    value={formData.venue} 
                    onChangeText={v => setFormData(prev => ({...prev, venue: v}))} 
                    placeholder="e.g. Central Park" 
                />
              </>
            )}

            {entityType === 'teams' && (
                <>
                    <Text style={styles.label}>TEAM NAME</Text>
                    <TextInput style={styles.input} value={formData.name} onChangeText={v => setFormData(prev => ({...prev, name: v}))} placeholder="Enter Team Name" />
                </>
            )}

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>SAVE {getEntityLabel().toUpperCase()}</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Inline Selection Overlay (Replaces Nested Modal) */}
          {selectorVisible && (
            <View style={styles.selectorOverlay}>
                <View style={styles.selectorHeader}>
                    <Text style={styles.selectorTitle}>{selectorTitle}</Text>
                    <TouchableOpacity onPress={() => setSelectorVisible(false)}><Text style={{color: THEME.danger}}>Cancel</Text></TouchableOpacity>
                </View>
                <FlatList 
                    data={selectorOptions} 
                    keyExtractor={item => item.id} 
                    renderItem={({item}) => (
                        <TouchableOpacity style={styles.optionBtn} onPress={() => handleSelect(item)}>
                            <Text style={styles.optionText}>{item.name}</Text>
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
  listContent: { padding: 20 },
  verboseCard: { backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 15, elevation: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  venueTag: { fontSize: 10, fontWeight: 'bold', color: THEME.muted },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 5 },
  statusText: { color: '#fff', fontSize: 9, fontWeight: 'bold' },
  teamNameText: { fontSize: 18, fontWeight: 'bold', color: THEME.primary },
  actionBar: { flexDirection: 'row', justifyContent: 'flex-end', gap: 15, marginTop: 10 },
  iconBtn: { padding: 5 },
  genericCard: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 10 },
  fab: { position: 'absolute', right: 20, bottom: 20, width: 60, height: 60, borderRadius: 30, backgroundColor: THEME.primary, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  fabText: { color: '#fff', fontSize: 30 },
  modalContainer: { flex: 1, backgroundColor: '#fff' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#eee' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: THEME.primary },
  closeIcon: { fontSize: 20, color: THEME.muted },
  label: { fontSize: 12, fontWeight: 'bold', color: THEME.muted, marginBottom: 8, marginTop: 15 },
  input: { backgroundColor: THEME.background, padding: 15, borderRadius: 10, fontSize: 16, borderWidth: 1, borderColor: '#eee' },
  selectorBtn: { backgroundColor: THEME.background, padding: 18, borderRadius: 10, borderWidth: 1, borderColor: '#eee' },
  selectorBtnText: { fontSize: 16, color: THEME.primary, fontWeight: '500' },
  saveBtn: { backgroundColor: THEME.primary, padding: 20, borderRadius: 10, marginTop: 30, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: 'bold' },

  // Selection Overlay Styles
  selectorOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: '#fff', paddingTop: 20 },
  selectorHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#eee' },
  selectorTitle: { fontSize: 18, fontWeight: 'bold', color: THEME.primary },
  optionBtn: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  optionText: { fontSize: 16, color: THEME.primary },
  closeSelector: { marginTop: 15, alignItems: 'center' }
});
