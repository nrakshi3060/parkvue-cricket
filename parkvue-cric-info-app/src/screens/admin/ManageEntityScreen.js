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
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});

  // Dependencies for Matches
  const [allTeams, setAllTeams] = useState([]);
  const [allTournaments, setAllTournaments] = useState([]);
  const [selectorVisible, setSelectorVisible] = useState(false);
  const [selectorConfig, setSelectorConfig] = useState({ title: '', options: [], field: '', displayField: '' });

  const getEntityLabel = useCallback(() => {
    switch(entityType) {
        case 'matches': return 'Match';
        case 'players': return 'Player';
        case 'teams': return 'Team';
        case 'tournaments': return 'Tournament';
        default: return entityType.slice(0, -1);
    }
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
    if (entityType === 'matches') {
        if (!formData.tournament?.id || !formData.team1?.id || !formData.team2?.id) {
            Alert.alert("Required Fields", "Please select Tournament and both Teams.");
            return;
        }
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
    Alert.alert('Delete', 'Are you sure?', [
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
        setFormData({ status: 'Upcoming' });
    }
    setModalVisible(true);
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
        <View style={styles.teamsDisplay}>
          <Text style={styles.teamNameText}>{item.team1?.shortName || 'T1'} VS {item.team2?.shortName || 'T2'}</Text>
        </View>
        <View style={styles.actionBar}>
          <TouchableOpacity onPress={() => openModal(item)} style={styles.iconBtn}><Text>✎</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.iconBtn}><Text style={{color: THEME.danger}}>🗑</Text></TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {loading ? <ActivityIndicator size="large" color={THEME.primary} style={{ marginTop: 50 }} /> : (
        <FlatList data={data} renderItem={({ item }) => entityType === 'matches' ? <MatchCard item={item} /> : <View style={styles.genericCard}><Text>{item.name || item.firstName}</Text></View>} keyExtractor={item => item.id} contentContainerStyle={styles.listContent} />
      )}
      <TouchableOpacity style={styles.fab} onPress={() => openModal()}><Text style={styles.fabText}>+</Text></TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{editingItem ? 'Edit' : 'Create New'} {getEntityLabel()}</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}><Text style={styles.closeIcon}>✕</Text></TouchableOpacity>
          </View>
          <ScrollView style={{ padding: 25 }} keyboardShouldPersistTaps="always">
            {entityType === 'matches' ? (
              <>
                <Text style={styles.label}>TOURNAMENT</Text>
                <TouchableOpacity style={styles.selectorBtn} onPress={() => setSelectorConfig({ title: 'Select Tournament', options: allTournaments, field: 'tournament', displayField: 'tournamentName' }) || setSelectorVisible(true)}>
                    <Text style={[styles.selectorBtnText, !formData.tournamentName && {color: '#999'}]}>{formData.tournamentName || 'Select Tournament...'}</Text>
                </TouchableOpacity>
                <Text style={styles.label}>TEAM 1</Text>
                <TouchableOpacity style={styles.selectorBtn} onPress={() => setSelectorConfig({ title: 'Select Team 1', options: allTeams, field: 'team1', displayField: 'team1Name' }) || setSelectorVisible(true)}>
                    <Text style={[styles.selectorBtnText, !formData.team1Name && {color: '#999'}]}>{formData.team1Name || 'Pick Team...'}</Text>
                </TouchableOpacity>
                <Text style={styles.label}>TEAM 2</Text>
                <TouchableOpacity style={styles.selectorBtn} onPress={() => setSelectorConfig({ title: 'Select Team 2', options: allTeams, field: 'team2', displayField: 'team2Name' }) || setSelectorVisible(true)}>
                    <Text style={[styles.selectorBtnText, !formData.team2Name && {color: '#999'}]}>{formData.team2Name || 'Pick Team...'}</Text>
                </TouchableOpacity>
                <Text style={styles.label}>VENUE</Text>
                <TextInput style={styles.input} value={formData.venue} onChangeText={v => updateField('venue', v)} placeholder="Enter Venue" />
              </>
            ) : (
                <Text>Other entities form here...</Text>
            )}
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}><Text style={styles.saveBtnText}>SAVE {getEntityLabel().toUpperCase()}</Text></TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      <Modal visible={selectorVisible} transparent={true} animationType="fade">
        <View style={styles.overlay}>
            <View style={styles.selectorContent}>
                <Text style={styles.selectorTitle}>{selectorConfig.title}</Text>
                <FlatList data={selectorConfig.options} keyExtractor={item => item.id} renderItem={({item}) => (
                    <TouchableOpacity style={styles.optionBtn} onPress={() => {
                        updateField(selectorConfig.field, {id: item.id});
                        updateField(selectorConfig.displayField, item.name);
                        setSelectorVisible(false);
                    }}>
                        <Text style={styles.optionText}>{item.name}</Text>
                    </TouchableOpacity>
                )} />
                <TouchableOpacity onPress={() => setSelectorVisible(false)} style={styles.closeSelector}><Text>Cancel</Text></TouchableOpacity>
            </View>
        </View>
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
  teamsDisplay: { paddingVertical: 10 },
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
  label: { fontSize: 12, fontWeight: 'bold', color: THEME.muted, marginBottom: 5, marginTop: 15 },
  input: { backgroundColor: THEME.background, padding: 15, borderRadius: 10, fontSize: 16 },
  selectorBtn: { backgroundColor: THEME.background, padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#eee' },
  selectorBtnText: { fontSize: 16, color: THEME.primary },
  saveBtn: { backgroundColor: THEME.primary, padding: 20, borderRadius: 10, marginTop: 30, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: 'bold' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  selectorContent: { backgroundColor: '#fff', borderRadius: 15, padding: 20, maxHeight: '80%' },
  selectorTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  optionBtn: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
  optionText: { fontSize: 16 },
  closeSelector: { marginTop: 15, alignItems: 'center' }
});
