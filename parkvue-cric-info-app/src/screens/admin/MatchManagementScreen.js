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
      Alert.alert('Error', 'Failed to sync with server.');
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
        Alert.alert("Missing Information", "Tournament and both Teams are required.");
        return;
    }
    if (formData.team1.id === formData.team2.id) {
        Alert.alert("Selection Error", "A team cannot play against itself.");
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
      Alert.alert('Error', 'Could not save match fixture.');
    }
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Match', 'This will remove all score history. Continue?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
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

  const MatchCard = ({ item }) => {
    const status = item.status?.toLowerCase();
    const statusColor = status === 'live' ? THEME.live : status === 'completed' ? THEME.completed : THEME.upcoming;
    
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.venueText}>{item.venue || 'TBA Venue'}</Text>
          <View style={[styles.badge, { backgroundColor: statusColor }]}>
            <Text style={styles.badgeText}>{item.status?.toUpperCase()}</Text>
          </View>
        </View>
        
        <View style={styles.matchMain}>
            <View style={styles.teamBox}>
                <Text style={styles.teamName}>{item.team1?.shortName || 'T1'}</Text>
                <Text style={styles.teamFull}>{item.team1?.name}</Text>
            </View>
            <View style={styles.vsCircle}><Text style={styles.vsText}>VS</Text></View>
            <View style={[styles.teamBox, { alignItems: 'flex-end' }]}>
                <Text style={styles.teamName}>{item.team2?.shortName || 'T2'}</Text>
                <Text style={styles.teamFull}>{item.team2?.name}</Text>
            </View>
        </View>

        <Text style={styles.tournamentText}>{item.tournament?.name}</Text>

        <View style={styles.cardFooter}>
            <TouchableOpacity style={styles.squadBtn} onPress={() => Alert.alert("Squad Flow Integrated")}>
                <Text style={styles.squadBtnText}>MANAGE SQUAD</Text>
            </TouchableOpacity>
            <View style={styles.actionGroup}>
                <TouchableOpacity onPress={() => openModal(item)} style={styles.iconBtn}><Text style={styles.icon}>✎</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.iconBtn}><Text style={[styles.icon, {color: THEME.danger}]}>🗑</Text></TouchableOpacity>
            </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Match Schedules</Text>
        <TouchableOpacity style={styles.refreshBtn} onPress={loadAll}>
            <Text style={styles.refreshText}>🔄</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={THEME.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList 
          data={matches} 
          renderItem={({ item }) => <MatchCard item={item} />} 
          keyExtractor={item => item.id} 
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>No matches scheduled yet.</Text>}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => openModal()}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* CREATE / EDIT MODAL */}
      <Modal visible={modalVisible} animationType="slide">
        <SafeAreaView style={styles.modalBg}>
            <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{editingMatch ? 'Edit Match' : 'Schedule New Match'}</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}><Text style={styles.closeIcon}>✕</Text></TouchableOpacity>
            </View>
            
            <ScrollView style={{ flex: 1, padding: 25 }} keyboardShouldPersistTaps="always">
                <Text style={styles.sectionLabel}>LEAGUE & TEAMS</Text>
                
                <Text style={styles.inputLabel}>TOURNAMENT</Text>
                <TouchableOpacity style={styles.selectBtn} onPress={() => startSelection('Select Tournament', allTournaments, 'tournament', 'tournamentName')}>
                    <Text style={[styles.selectBtnText, !formData.tournamentName && {color: '#999'}]}>{formData.tournamentName || 'Choose Tournament...'}</Text>
                </TouchableOpacity>

                <View style={styles.row}>
                    <View style={{flex: 1}}>
                        <Text style={styles.inputLabel}>TEAM 1 (HOME)</Text>
                        <TouchableOpacity style={styles.selectBtn} onPress={() => startSelection('Select Team 1', allTeams, 'team1', 'team1Name')}>
                            <Text style={[styles.selectBtnText, !formData.team1Name && {color: '#999'}]}>{formData.team1Name || 'Pick Team...'}</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{width: 15}} />
                    <View style={{flex: 1}}>
                        <Text style={styles.inputLabel}>TEAM 2 (AWAY)</Text>
                        <TouchableOpacity style={styles.selectBtn} onPress={() => startSelection('Select Team 2', allTeams, 'team2', 'team2Name')}>
                            <Text style={[styles.selectBtnText, !formData.team2Name && {color: '#999'}]}>{formData.team2Name || 'Pick Team...'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <Text style={styles.sectionLabel}>LOGISTICS</Text>
                <Text style={styles.inputLabel}>VENUE</Text>
                <TextInput 
                    style={styles.input} 
                    value={formData.venue} 
                    onChangeText={v => updateField('venue', v)} 
                    placeholder="e.g. Lords Cricket Ground" 
                />

                <Text style={styles.inputLabel}>MATCH STATUS</Text>
                <View style={styles.chipRow}>
                  {['Upcoming', 'Live', 'Completed'].map(s => (
                    <TouchableOpacity 
                      key={s} 
                      style={[styles.chip, formData.status === s && styles.chipActive]} 
                      onPress={() => updateField('status', s)}
                    >
                      <Text style={[styles.chipText, formData.status === s && styles.whiteText]}>{s}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                    <Text style={styles.saveBtnText}>CONFIRM SCHEDULE</Text>
                </TouchableOpacity>
                <View style={{ height: 100 }} />
            </ScrollView>

            {/* SELECTION OVERLAY */}
            {selectorVisible && (
                <View style={styles.overlay}>
                    <View style={styles.overlayHeader}>
                        <Text style={styles.overlayTitle}>{selectorTitle}</Text>
                        <TouchableOpacity onPress={() => setSelectorVisible(false)}><Text style={{color: THEME.danger}}>Cancel</Text></TouchableOpacity>
                    </View>
                    <FlatList 
                        data={selectorOptions} 
                        keyExtractor={item => item.id} 
                        renderItem={({item}) => (
                            <TouchableOpacity style={styles.option} onPress={() => handleSelect(item)}>
                                <Text style={styles.optionText}>{item.name}</Text>
                                <Text style={styles.optionSub}>{item.shortName || 'Series'}</Text>
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 25, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  headerTitle: { fontSize: 22, fontWeight: '900', color: THEME.primary },
  refreshBtn: { padding: 5 },
  list: { padding: 20 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 20, elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  venueText: { fontSize: 11, fontWeight: 'bold', color: THEME.muted, letterSpacing: 0.5 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: '900' },
  matchMain: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f5f5f5', marginBottom: 12 },
  teamBox: { flex: 1 },
  teamName: { fontSize: 20, fontWeight: '900', color: THEME.primary },
  teamFull: { fontSize: 11, color: THEME.muted, marginTop: 2 },
  vsCircle: { width: 34, height: 34, borderRadius: 17, backgroundColor: THEME.background, justifyContent: 'center', alignItems: 'center', marginHorizontal: 15 },
  vsText: { fontSize: 10, fontWeight: '900', color: THEME.secondary },
  tournamentText: { fontSize: 12, color: THEME.muted, fontStyle: 'italic', marginBottom: 15 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  squadBtn: { backgroundColor: 'rgba(25, 167, 206, 0.1)', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: THEME.secondary },
  squadBtnText: { color: THEME.secondary, fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  actionGroup: { flexDirection: 'row', gap: 12 },
  iconBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: THEME.background, justifyContent: 'center', alignItems: 'center' },
  icon: { fontSize: 16 },
  fab: { position: 'absolute', right: 25, bottom: 25, width: 65, height: 65, borderRadius: 33, backgroundColor: THEME.primary, justifyContent: 'center', alignItems: 'center', elevation: 8 },
  fabText: { color: '#fff', fontSize: 35, fontWeight: '200' },
  empty: { textAlign: 'center', marginTop: 50, color: THEME.muted },

  modalBg: { flex: 1, backgroundColor: '#fff' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 25, borderBottomWidth: 1, borderBottomColor: '#eee' },
  modalTitle: { fontSize: 20, fontWeight: '900', color: THEME.primary },
  closeIcon: { fontSize: 22, color: THEME.muted },
  sectionLabel: { fontSize: 11, fontWeight: 'bold', color: THEME.secondary, marginTop: 10, marginBottom: 15, letterSpacing: 1 },
  inputLabel: { fontSize: 10, fontWeight: '900', color: THEME.muted, marginBottom: 8, letterSpacing: 0.5 },
  input: { backgroundColor: THEME.background, padding: 18, borderRadius: 15, marginBottom: 20, fontSize: 16, borderWidth: 1, borderColor: '#eee' },
  selectBtn: { backgroundColor: THEME.background, padding: 18, borderRadius: 15, marginBottom: 20, borderWidth: 1, borderColor: '#eee' },
  selectBtnText: { fontSize: 15, fontWeight: '700', color: THEME.primary },
  row: { flexDirection: 'row' },
  chipRow: { flexDirection: 'row', gap: 8, marginBottom: 25 },
  chip: { paddingHorizontal: 15, paddingVertical: 10, borderRadius: 10, backgroundColor: THEME.background, borderWidth: 1, borderColor: '#eee' },
  chipActive: { backgroundColor: THEME.primary, borderColor: THEME.primary },
  chipText: { fontSize: 13, fontWeight: 'bold', color: THEME.primary },
  whiteText: { color: '#fff' },
  saveBtn: { backgroundColor: THEME.primary, padding: 20, borderRadius: 15, alignItems: 'center', elevation: 5 },
  saveBtnText: { color: '#fff', fontWeight: 'bold', letterSpacing: 1 },

  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: '#fff', zIndex: 1000 },
  overlayHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 25, borderBottomWidth: 1, borderBottomColor: '#eee' },
  overlayTitle: { fontSize: 18, fontWeight: '900', color: THEME.primary },
  option: { padding: 25, borderBottomWidth: 1, borderBottomColor: '#f5f5f5', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  optionText: { fontSize: 16, fontWeight: '700', color: THEME.primary },
  optionSub: { fontSize: 11, color: THEME.muted, fontWeight: 'bold' }
});
