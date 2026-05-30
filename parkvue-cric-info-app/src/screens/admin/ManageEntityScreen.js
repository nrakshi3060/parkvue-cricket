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
  danger: '#E63946'
};

export default function ManageEntityScreen({ route, navigation }) {
  const { entityType } = route.params;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    navigation.setOptions({ title: `Manage ${entityType.charAt(0).toUpperCase() + entityType.slice(1)}` });
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
    setFormData(item || {});
    setModalVisible(true);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>
          {item.name || `${item.firstName} ${item.lastName}` || (item.team1?.name + ' vs ' + item.team2?.name)}
        </Text>
        <Text style={styles.cardSubtitle}>{item.shortName || item.role || item.venue || item.status}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => openModal(item)} style={styles.actionBtn}>
          <Text style={{ color: THEME.secondary }}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.actionBtn}>
          <Text style={{ color: THEME.danger }}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {loading ? <ActivityIndicator size="large" style={{ marginTop: 50 }} /> : (
        <>
          <FlatList
            data={data}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            contentContainerStyle={{ padding: 20 }}
          />
          <TouchableOpacity style={styles.fab} onPress={() => openModal()}>
            <Text style={styles.fabText}>+</Text>
          </TouchableOpacity>
        </>
      )}

      <Modal visible={modalVisible} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <Text style={styles.modalTitle}>{editingItem ? 'Edit' : 'Add New'} {entityType}</Text>
          
          <ScrollView style={{ padding: 20 }}>
            {entityType === 'teams' && (
              <>
                <TextInput placeholder="Team Name" style={styles.input} value={formData.name} onChangeText={v => setFormData({...formData, name: v})} />
                <TextInput placeholder="Short Name" style={styles.input} value={formData.shortName} onChangeText={v => setFormData({...formData, shortName: v})} />
              </>
            )}
            {entityType === 'players' && (
              <>
                <TextInput placeholder="First Name" style={styles.input} value={formData.firstName} onChangeText={v => setFormData({...formData, firstName: v})} />
                <TextInput placeholder="Last Name" style={styles.input} value={formData.lastName} onChangeText={v => setFormData({...formData, lastName: v})} />
                <TextInput placeholder="Role (Batsman/Bowler)" style={styles.input} value={formData.role} onChangeText={v => setFormData({...formData, role: v})} />
              </>
            )}
            {entityType === 'tournaments' && (
              <>
                <TextInput placeholder="Tournament Name" style={styles.input} value={formData.name} onChangeText={v => setFormData({...formData, name: v})} />
                <TextInput placeholder="Status" style={styles.input} value={formData.status} onChangeText={v => setFormData({...formData, status: v})} />
              </>
            )}

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 20 }}>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: THEME.primary, flex: 1 }]} onPress={handleSave}>
                <Text style={{ color: '#fff', textAlign: 'center', fontWeight: 'bold' }}>SAVE</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#ccc', flex: 1 }]} onPress={() => setModalVisible(false)}>
                <Text style={{ textAlign: 'center' }}>CANCEL</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.background },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 10, flexDirection: 'row', alignItems: 'center', elevation: 2 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: THEME.primary },
  cardSubtitle: { fontSize: 12, color: THEME.muted, marginTop: 2 },
  actions: { flexDirection: 'row' },
  actionBtn: { padding: 10 },
  fab: { position: 'absolute', right: 20, bottom: 20, width: 60, height: 60, borderRadius: 30, backgroundColor: THEME.primary, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  fabText: { color: '#fff', fontSize: 30, fontWeight: 'bold' },
  modalContainer: { flex: 1, backgroundColor: '#fff' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', padding: 20 },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 8, marginBottom: 15 },
  modalBtn: { padding: 15, borderRadius: 8 }
});
