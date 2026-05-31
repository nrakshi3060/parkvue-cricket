import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, Text, View, FlatList, TouchableOpacity, 
  ActivityIndicator, Modal, TextInput, Alert, SafeAreaView, ScrollView, StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AdminService } from '../../services/AdminService';

const THEME = {
  primary: '#0B2447',
  secondary: '#19A7CE',
  background: '#F8F9FA',
  card: '#FFFFFF',
  text: '#2D3436',
  muted: '#636E72',
  danger: '#E63946',
  white: '#FFFFFF'
};

export default function ManageEntityScreen({ route, navigation }) {
  const { entityType } = route.params;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});

  const getEntityLabel = useCallback(() => {
    switch(entityType) {
        case 'matches': return 'Match';
        case 'players': return 'Player';
        case 'teams': return 'Team';
        case 'tournaments': return 'Tournament';
        default: return 'Item';
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
  }, [entityType]);

  const loadData = async () => {
    setLoading(true);
    try {
      let result;
      if (entityType === 'tournaments') result = await AdminService.getTournaments();
      if (entityType === 'teams') result = await AdminService.getTeams();
      if (entityType === 'players') result = await AdminService.getPlayers();
      setData(result || []);
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
      } else {
        if (entityType === 'tournaments') await AdminService.createTournament(formData);
        if (entityType === 'teams') await AdminService.createTeam(formData);
        if (entityType === 'players') await AdminService.createPlayer(formData);
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
          {item.name || `${item.firstName} ${item.lastName}`}
        </Text>
        <Text style={styles.cardSubtitle}>{item.shortName || item.role || item.status}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => openModal(item)} style={styles.actionBtn}>
          <Ionicons name="create-outline" size={20} color={THEME.secondary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.actionBtn}>
          <Ionicons name="trash-outline" size={20} color={THEME.danger} />
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
            renderItem={renderItem}
            keyExtractor={item => item.id}
            contentContainerStyle={{ padding: 20 }}
            ListEmptyComponent={<Text style={styles.emptyText}>No {entityType} found.</Text>}
          />
          <TouchableOpacity style={styles.fab} onPress={() => openModal()}>
            <Ionicons name="add-outline" size={32} color="#fff" />
          </TouchableOpacity>
        </>
      )}

      <Modal visible={modalVisible} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{editingItem ? 'Edit' : 'Create New'} {getEntityLabel()}</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close-outline" size={28} color={THEME.muted} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={{ padding: 25 }}>
            {entityType === 'teams' && (
              <>
                <Text style={styles.label}>TEAM NAME</Text>
                <TextInput placeholder="e.g. Parkvue Panthers" style={styles.input} value={formData.name} onChangeText={v => setFormData({...formData, name: v})} />
                <Text style={styles.label}>SHORT NAME</Text>
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
                <TextInput placeholder="e.g. Summer League" style={styles.input} value={formData.name} onChangeText={v => setFormData({...formData, name: v})} />
                <Text style={styles.label}>STATUS</Text>
                <TextInput placeholder="Upcoming" style={styles.input} value={formData.status} onChangeText={v => setFormData({...formData, status: v})} />
              </>
            )}

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>SAVE {getEntityLabel().toUpperCase()}</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.background },
  card: { backgroundColor: '#fff', padding: 18, borderRadius: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', elevation: 2 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: THEME.primary },
  cardSubtitle: { fontSize: 12, color: THEME.muted, marginTop: 2 },
  actions: { flexDirection: 'row' },
  actionBtn: { padding: 10 },
  fab: { position: 'absolute', right: 25, bottom: 25, width: 65, height: 65, borderRadius: 33, backgroundColor: THEME.primary, justifyContent: 'center', alignItems: 'center', elevation: 8, shadowColor: THEME.primary, shadowOpacity: 0.3, shadowRadius: 10 },
  modalContainer: { flex: 1, backgroundColor: '#fff' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 25, borderBottomWidth: 1, borderBottomColor: '#eee' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: THEME.primary },
  label: { fontSize: 11, fontWeight: 'bold', color: THEME.muted, marginBottom: 8, marginTop: 15, letterSpacing: 1 },
  input: { backgroundColor: THEME.background, padding: 15, borderRadius: 12, marginBottom: 20, fontSize: 16, borderWidth: 1, borderColor: '#eee' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  chip: { paddingHorizontal: 15, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: '#ddd', backgroundColor: '#fff' },
  chipActive: { backgroundColor: THEME.primary, borderColor: THEME.primary },
  chipText: { fontSize: 13, fontWeight: '600', color: THEME.primary },
  whiteText: { color: '#fff' },
  saveBtn: { backgroundColor: THEME.primary, padding: 20, borderRadius: 12, marginTop: 20, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: 'bold', letterSpacing: 1 },
  emptyText: { textAlign: 'center', marginTop: 50, color: THEME.muted }
});
