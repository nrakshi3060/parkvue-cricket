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

  const getEntitySingular = useCallback(() => {
    if (entityType === 'matches') return 'Match';
    if (entityType === 'players') return 'Player';
    if (entityType === 'teams') return 'Team';
    if (entityType === 'tournaments') return 'Tournament';
    return entityType.slice(0, -1);
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
        if (formData.team1.id === formData.team2.id) {
            Alert.alert("Selection Error", "Team 1 and Team 2 cannot be the same.");
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
      Alert.alert('Error', 'Failed to save changes.');
    }
  };

  const handleDelete = (id) => {
    Alert.alert('Confirm Delete', 'This action cannot be undone.', [
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

  const handleSquadPress = (match) => {
    Alert.alert(
      'Manage Squad',
      'Select a team:',
      [
        { text: match.team1?.name, onPress: () => navigation.navigate('ManageSquad', { matchId: match.id, teamId: match.team1.id, teamName: match.team1.name }) },
        { text: match.team2?.name, onPress: () => navigation.navigate('ManageSquad', { matchId: match.id, teamId: match.team2.id, teamName: match.team2.name }) },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
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

  const openSelector = (title, options, field, displayField) => {
    setSelectorConfig({ title, options, field, displayField });
    setSelectorVisible(true);
  };

  const updateFormField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const MatchCard = ({ item }) => {
    const status = item.status?.toLowerCase();
    const statusColor = status === 'live' ? THEME.live : status === 'completed' ? THEME.completed : THEME.upcoming;

    return (
      <View style={styles.verboseCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.venueTag}>{item.venue || 'TBA Venue'}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{item.status?.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.teamsDisplay}>
          <View style={styles.teamLine}>
            <Text style={styles.teamNameText}>{item.team1?.name || 'TBD'}</Text>
            <Text style={styles.teamAbbr}>{item.team1?.shortName || 'T1'}</Text>
          </View>
          <View style={styles.vsContainer}>
             <Text style={styles.vsText}>VS</Text>
          </View>
          <View style={[styles.teamLine, { justifyContent: 'flex-end' }]}>
            <Text style={styles.teamAbbr}>{item.team2?.shortName || 'T2'}</Text>
            <Text style={styles.teamNameText}>{item.team2?.name || 'TBD'}</Text>
          </View>
        </View>

        <Text style={styles.tournamentTag}>{item.tournament?.name || 'Unofficial Match'}</Text>

        <View style={styles.actionBar}>
          <TouchableOpacity style={styles.primaryAction} onPress={() => handleSquadPress(item)}>
            <Text style={styles.primaryActionText}>MANAGE SQUAD</Text>
          </TouchableOpacity>
          <View style={styles.secondaryActions}>
            <TouchableOpacity onPress={() => openModal(item)} style={styles.iconBtn}>
              <Text style={styles.iconText}>✎</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.iconBtn}>
              <Text style={[styles.iconText, { color: THEME.danger }]}>🗑</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const GenericCard = ({ item }) => (
    <View style={styles.genericCard}>
      <View style={{ flex: 1 }}>
        <Text style={styles.genericTitle}>
          {item.name || `${item.firstName} ${item.lastName}`}
        </Text>
        <Text style={styles.genericSubtitle}>{item.shortName || item.role || item.status}</Text>
      </View>
      <View style={styles.genericActions}>
        <TouchableOpacity onPress={() => openModal(item)} style={styles.actionLink}>
          <Text style={{ color: THEME.secondary, fontWeight: 'bold' }}>EDIT</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.actionLink}>
          <Text style={{ color: THEME.danger, fontWeight: 'bold' }}>DELETE</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {loading ? <ActivityIndicator size="large" color={THEME.primary} style={{ marginTop: 50 }} /> : (
        <>
          <FlatList
            data={data}
            renderItem={({ item }) => entityType === 'matches' ? <MatchCard item={item} /> : <GenericCard item={item} />}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
          />
          <TouchableOpacity style={styles.fab} onPress={() => openModal()}>
            <Text style={styles.fabText}>+</Text>
          </TouchableOpacity>
        </>
      )}

      {/* Main Entry Modal */}
      <Modal visible={modalVisible} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{editingItem ? 'Edit' : 'Create New'} {getEntitySingular()}</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={{ padding: 25 }} keyboardShouldPersistTaps="handled">
            {entityType === 'teams' && (
              <>
                <Text style={styles.label}>TEAM NAME</Text>
                <TextInput placeholder="e.g. Parkvue Panthers" style={styles.input} value={formData.name} onChangeText={v => updateFormField('name', v)} />
                <Text style={styles.label}>ABBREVIATION</Text>
                <TextInput placeholder="e.g. PVP" style={styles.input} value={formData.shortName} onChangeText={v => updateFormField('shortName', v)} />
              </>
            )}
            {entityType === 'players' && (
              <>
                <Text style={styles.label}>FIRST NAME</Text>
                <TextInput placeholder="e.g. John" style={styles.input} value={formData.firstName} onChangeText={v => updateFormField('firstName', v)} />
                <Text style={styles.label}>LAST NAME</Text>
                <TextInput placeholder="e.g. Smith" style={styles.input} value={formData.lastName} onChangeText={v => updateFormField('lastName', v)} />
                <Text style={styles.label}>ROLE</Text>
                <View style={styles.chipRow}>
                  {['Batsman', 'Bowler', 'All-rounder', 'WK'].map(role => (
                    <TouchableOpacity 
                      key={role} 
                      style={[styles.chip, formData.role === role && styles.chipActive]} 
                      onPress={() => updateFormField('role', role)}
                    >
                      <Text style={[styles.chipText, formData.role === role && styles.whiteText]}>{role}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
            {entityType === 'tournaments' && (
              <>
                <Text style={styles.label}>TOURNAMENT NAME</Text>
                <TextInput placeholder="e.g. Summer League 2024" style={styles.input} value={formData.name} onChangeText={v => updateFormField('name', v)} />
                <Text style={styles.label}>STATUS</Text>
                <TextInput placeholder="Upcoming / Ongoing / Completed" style={styles.input} value={formData.status} onChangeText={v => updateFormField('status', v)} />
              </>
            )}

            {entityType === 'matches' && (
              <View style={styles.matchForm}>
                <Text style={styles.sectionHeader}>LEAGUE CONTEXT</Text>
                <Text style={styles.label}>TOURNAMENT</Text>
                <TouchableOpacity 
                    style={styles.selectorBtn} 
                    onPress={() => openSelector('Select Tournament', allTournaments, 'tournament', 'tournamentName')}
                >
                    <Text style={[styles.selectorBtnText, !formData.tournamentName && {color: '#999'}]}>
                        {formData.tournamentName || 'Select Tournament...'}
                    </Text>
                </TouchableOpacity>

                <Text style={styles.sectionHeader}>TEAM SELECTION</Text>
                <View style={styles.teamsGrid}>
                    <View style={{flex: 1}}>
                        <Text style={styles.label}>TEAM 1 (HOME)</Text>
                        <TouchableOpacity 
                            style={styles.selectorBtn} 
                            onPress={() => openSelector('Select Team 1', allTeams, 'team1', 'team1Name')}
                        >
                            <Text style={[styles.selectorBtnText, !formData.team1Name && {color: '#999'}]}>
                                {formData.team1Name || 'Pick Team...'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.vsSpacer}><Text style={styles.vsLabel}>vs</Text></View>
                    <View style={{flex: 1}}>
                        <Text style={styles.label}>TEAM 2 (AWAY)</Text>
                        <TouchableOpacity 
                            style={styles.selectorBtn} 
                            onPress={() => openSelector('Select Team 2', allTeams, 'team2', 'team2Name')}
                        >
                            <Text style={[styles.selectorBtnText, !formData.team2Name && {color: '#999'}]}>
                                {formData.team2Name || 'Pick Team...'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <Text style={styles.sectionHeader}>LOGISTICS & STATUS</Text>
                <Text style={styles.label}>VENUE / GROUND</Text>
                <TextInput 
                    placeholder="e.g. Central Park Ground" 
                    style={styles.input} 
                    value={formData.venue} 
                    onChangeText={v => updateFormField('venue', v)} 
                />
                
                <Text style={styles.label}>MATCH STATUS</Text>
                <View style={styles.chipRow}>
                  {['Upcoming', 'Live', 'Completed'].map(s => (
                    <TouchableOpacity 
                      key={s} 
                      style={[styles.chip, formData.status === s && styles.chipActive]} 
                      onPress={() => updateFormField('status', s)}
                    >
                      <Text style={[styles.chipText, formData.status === s && styles.whiteText]}>{s}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.9}>
              <Text style={styles.saveBtnText}>CONFIRM & SAVE</Text>
            </TouchableOpacity>
            <View style={{ height: 50 }} />
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Modern Searchable-style Selector Overlay */}
      <Modal visible={selectorVisible} transparent={true} animationType="fade">
        <View style={styles.overlay}>
            <View style={styles.selectorContent}>
                <View style={styles.selectorHeader}>
                    <Text style={styles.selectorTitle}>{selectorConfig.title}</Text>
                    <TouchableOpacity onPress={() => setSelectorVisible(false)}>
                        <Text style={{color: THEME.muted}}>Cancel</Text>
                    </TouchableOpacity>
                </View>
                <FlatList
                    data={selectorConfig.options}
                    keyExtractor={item => item.id}
                    renderItem={({item}) => (
                        <TouchableOpacity 
                            style={styles.optionBtn} 
                            onPress={() => { 
                                setFormData(prev => ({
                                    ...prev, 
                                    [selectorConfig.field]: {id: item.id}, 
                                    [selectorConfig.displayField]: item.name
                                })); 
                                setSelectorVisible(false); 
                            }}
                        >
                            <Text style={styles.optionText}>{item.name}</Text>
                            <Text style={styles.optionSub}>{item.shortName || 'Tournament'}</Text>
                        </TouchableOpacity>
                    )}
                    ListEmptyComponent={<Text style={styles.emptyText}>No items found. Create them first in Setup.</Text>}
                />
            </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.background },
  listContent: { padding: 20 },
  verboseCard: { 
    backgroundColor: '#fff', 
    borderRadius: 24, 
    padding: 20, 
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  venueTag: { fontSize: 11, fontWeight: 'bold', color: THEME.muted, letterSpacing: 0.5 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { color: '#fff', fontSize: 9, fontWeight: '900' },
  teamsDisplay: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginBottom: 10
  },
  teamLine: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  teamNameText: { fontSize: 14, fontWeight: 'bold', color: THEME.primary },
  teamAbbr: { fontSize: 10, color: THEME.muted, marginHorizontal: 6, fontWeight: 'bold' },
  vsContainer: { backgroundColor: THEME.background, padding: 8, borderRadius: 10 },
  vsText: { fontSize: 10, fontWeight: '900', color: THEME.secondary },
  tournamentTag: { fontSize: 12, color: THEME.muted, fontStyle: 'italic', marginBottom: 15 },
  actionBar: { flexDirection: 'row', alignItems: 'center' },
  primaryAction: { 
    flex: 1, 
    backgroundColor: 'rgba(25, 167, 206, 0.1)', 
    paddingVertical: 12, 
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THEME.secondary,
    alignItems: 'center'
  },
  primaryActionText: { color: THEME.secondary, fontWeight: '900', fontSize: 11, letterSpacing: 1 },
  secondaryActions: { flexDirection: 'row', marginLeft: 15, gap: 10 },
  iconBtn: { 
    width: 40, height: 40, 
    backgroundColor: THEME.background, 
    borderRadius: 10, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  iconText: { fontSize: 18 },
  genericCard: { backgroundColor: '#fff', padding: 18, borderRadius: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', elevation: 2 },
  genericTitle: { fontSize: 16, fontWeight: 'bold', color: THEME.primary },
  genericSubtitle: { fontSize: 12, color: THEME.muted, marginTop: 2 },
  genericActions: { flexDirection: 'row', gap: 15 },
  actionLink: { padding: 5 },
  fab: { position: 'absolute', right: 25, bottom: 25, width: 60, height: 60, borderRadius: 30, backgroundColor: THEME.primary, justifyContent: 'center', alignItems: 'center', elevation: 8 },
  fabText: { color: '#fff', fontSize: 32, fontWeight: '300' },
  modalContainer: { flex: 1, backgroundColor: '#fff' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 25, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  modalTitle: { fontSize: 20, fontWeight: '900', color: THEME.primary, letterSpacing: -0.5 },
  closeBtn: { padding: 5 },
  closeIcon: { fontSize: 20, color: THEME.muted },
  sectionHeader: { fontSize: 12, fontWeight: 'bold', color: THEME.secondary, marginTop: 10, marginBottom: 15, letterSpacing: 1 },
  label: { fontSize: 10, fontWeight: '900', color: THEME.muted, marginBottom: 8, letterSpacing: 1 },
  input: { backgroundColor: THEME.background, padding: 15, borderRadius: 12, marginBottom: 20, fontSize: 15, color: THEME.primary, borderWidth: 1, borderColor: THEME.border },
  selectorBtn: { backgroundColor: THEME.background, padding: 15, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: THEME.border, flexDirection: 'row', justifyContent: 'space-between' },
  selectorBtnText: { fontSize: 14, color: THEME.primary, fontWeight: '700' },
  teamsGrid: { flexDirection: 'row', alignItems: 'flex-start', gap: 0 },
  vsSpacer: { paddingHorizontal: 10, paddingTop: 35 },
  vsLabel: { fontSize: 12, fontWeight: 'bold', color: THEME.muted },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  chip: { paddingHorizontal: 15, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: '#ddd', backgroundColor: '#fff' },
  chipActive: { backgroundColor: THEME.primary, borderColor: THEME.primary },
  chipText: { fontSize: 13, fontWeight: '600', color: THEME.primary },
  whiteText: { color: '#fff' },
  saveBtn: { backgroundColor: THEME.primary, padding: 20, borderRadius: 15, marginTop: 20, alignItems: 'center', shadowColor: THEME.primary, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  saveBtnText: { color: '#fff', fontWeight: 'bold', letterSpacing: 1 },
  overlay: { flex: 1, backgroundColor: 'rgba(11, 36, 71, 0.8)', justifyContent: 'flex-end' },
  selectorContent: { backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, maxHeight: '80%' },
  selectorHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  selectorTitle: { fontSize: 18, fontWeight: '900', color: THEME.primary },
  optionBtn: { paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: THEME.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  optionText: { fontSize: 16, fontWeight: '700', color: THEME.primary },
  optionSub: { fontSize: 12, color: THEME.muted, fontWeight: 'bold' },
  emptyText: { textAlign: 'center', color: THEME.muted, marginTop: 40 }
});
