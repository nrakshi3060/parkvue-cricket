import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, FlatList, TouchableOpacity, 
  ActivityIndicator, Modal, TextInput, Alert, SafeAreaView, ScrollView 
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
  completed: '#2A9D8F'
};

export default function ManageEntityScreen({ route, navigation }) {
  const { entityType } = route.params;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    navigation.setOptions({ 
        title: `Manage ${entityType.charAt(0).toUpperCase() + entityType.slice(1)}`,
        headerStyle: { backgroundColor: THEME.background },
        headerTintColor: THEME.primary,
        headerShadowVisible: false,
    });
    loadData();
  }, [entityType]);

  const loadData = async () => {
    setLoading(true);
    try {
      let result;
      if (entityType === 'tournaments') result = await AdminService.getTournaments();
      if (entityType === 'teams') result = await AdminService.getTeams();
      if (entityType === 'players') result = await AdminService.getPlayers();
      if (entityType === 'matches') result = await AdminService.getMatches();
      setData(result);
    } catch (e) {
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
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
      Alert.alert('Error', 'Failed to save');
    }
  };

  const handleDelete = (id) => {
    Alert.alert('Confirm Delete', 'This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete Permanently', style: 'destructive', onPress: async () => {
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
      'Select Team',
      'Which squad do you want to manage?',
      [
        { text: match.team1?.name, onPress: () => navigation.navigate('ManageSquad', { matchId: match.id, teamId: match.team1.id, teamName: match.team1.name }) },
        { text: match.team2?.name, onPress: () => navigation.navigate('ManageSquad', { matchId: match.id, teamId: match.team2.id, teamName: match.team2.name }) },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const openModal = (item = null) => {
    setEditingItem(item);
    setFormData(item || {});
    setModalVisible(true);
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
          <Text style={styles.vsCircle}>VS</Text>
          <View style={styles.teamLine}>
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

      <Modal visible={modalVisible} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{editingItem ? 'Edit' : 'Create New'} {entityType.slice(0, -1)}</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={{ padding: 25 }}>
            {entityType === 'teams' && (
              <>
                <Text style={styles.label}>TEAM NAME</Text>
                <TextInput placeholder="e.g. Parkvue Panthers" style={styles.input} value={formData.name} onChangeText={v => setFormData({...formData, name: v})} />
                <Text style={styles.label}>ABBREVIATION</Text>
                <TextInput placeholder="e.g. PVP" style={styles.input} value={formData.shortName} onChangeText={v => setFormData({...formData, shortName: v})} />
              </>
            )}
            {entityType === 'players' && (
              <>
                <Text style={styles.label}>FIRST NAME</Text>
                <TextInput placeholder="e.g. John" style={styles.input} value={formData.firstName} onChangeText={v => setFormData({...formData, firstName: v})} />
                <Text style={styles.label}>LAST NAME</Text>
                <TextInput placeholder="e.g. Smith" style={styles.input} value={formData.lastName} onChangeText={v => setFormData({...formData, lastName: v})} />
                <Text style={styles.label}>ROLE</Text>
                <View style={styles.chipRow}>
                  {['Batsman', 'Bowler', 'All-rounder', 'WK'].map(role => (
                    <TouchableOpacity 
                      key={role} 
                      style={[styles.chip, formData.role === role && styles.chipActive]} 
                      onPress={() => setFormData({...formData, role: role})}
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
                <TextInput placeholder="e.g. Summer League 2024" style={styles.input} value={formData.name} onChangeText={v => setFormData({...formData, name: v})} />
                <Text style={styles.label}>STATUS</Text>
                <TextInput placeholder="Upcoming / Ongoing / Completed" style={styles.input} value={formData.status} onChangeText={v => setFormData({...formData, status: v})} />
              </>
            )}

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>CONFIRM & SAVE</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.background },
  listContent: { padding: 20 },
  // Verbose Match Card Styles
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
  teamNameText: { fontSize: 15, fontWeight: 'bold', color: THEME.primary },
  teamAbbr: { fontSize: 11, color: THEME.muted, marginHorizontal: 8 },
  vsCircle: { 
    fontSize: 10, 
    fontWeight: '900', 
    color: THEME.secondary, 
    backgroundColor: THEME.background,
    width: 28, height: 28, borderRadius: 14,
    textAlign: 'center', textAlignVertical: 'center',
    lineHeight: 28
  },
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

  // Generic Card Styles
  genericCard: { backgroundColor: '#fff', padding: 18, borderRadius: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', elevation: 2 },
  genericTitle: { fontSize: 16, fontWeight: 'bold', color: THEME.primary },
  genericSubtitle: { fontSize: 12, color: THEME.muted, marginTop: 2 },
  genericActions: { flexDirection: 'row', gap: 15 },
  actionLink: { padding: 5 },

  fab: { position: 'absolute', right: 25, bottom: 25, width: 60, height: 60, borderRadius: 30, backgroundColor: THEME.primary, justifyContent: 'center', alignItems: 'center', elevation: 8, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 10 },
  fabText: { color: '#fff', fontSize: 32, fontWeight: '300' },
  
  // Modal Styles
  modalContainer: { flex: 1, backgroundColor: '#fff' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 25, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  modalTitle: { fontSize: 20, fontWeight: '900', color: THEME.primary },
  closeIcon: { fontSize: 22, color: THEME.muted },
  label: { fontSize: 11, fontWeight: 'bold', color: THEME.muted, marginBottom: 8, letterSpacing: 1 },
  input: { backgroundColor: THEME.background, padding: 15, borderRadius: 12, marginBottom: 20, fontSize: 16, color: THEME.primary, borderWidth: 1, borderColor: '#eee' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  chip: { paddingHorizontal: 15, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: '#ddd', backgroundColor: '#fff' },
  chipActive: { backgroundColor: THEME.primary, borderColor: THEME.primary },
  chipText: { fontSize: 13, fontWeight: '600', color: THEME.primary },
  whiteText: { color: '#fff' },
  saveBtn: { backgroundColor: THEME.primary, padding: 20, borderRadius: 15, marginTop: 10, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: 'bold', letterSpacing: 1 }
});
