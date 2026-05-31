import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, FlatList, TouchableOpacity, 
  ActivityIndicator, SafeAreaView, Alert 
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
  success: '#2A9D8F'
};

export default function ManageSquadScreen({ route, navigation }) {
  const { matchId, teamId, teamName } = route.params;
  const [allPlayers, setPlayers] = useState([]);
  const [squad, setSquad] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    navigation.setOptions({ title: `${teamName} Squad` });
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [players, currentSquad] = await Promise.all([
          AdminService.getPlayers(),
          AdminService.getSquad(matchId)
      ]);
      setPlayers(players || []);
      setSquad(currentSquad ? currentSquad.filter(s => s.team?.id === teamId) : []);
    } catch (e) {
      Alert.alert('Error', 'Failed to load squad data');
    } finally {
      setLoading(false);
    }
  };

  const togglePlayer = async (player) => {
    const inSquad = squad.find(s => s.player?.id === player.id);
    try {
      if (inSquad) {
        await AdminService.removeFromSquad(inSquad.id);
      } else {
        await AdminService.addToSquad({
          match: { id: matchId },
          team: { id: teamId },
          player: { id: player.id },
          playingXi: true
        });
      }
      loadData();
    } catch (e) {
      Alert.alert('Error', 'Failed to update squad');
    }
  };

  const renderPlayer = ({ item }) => {
    const isSelected = squad.some(s => s.player?.id === item.id);
    return (
      <TouchableOpacity 
        style={[styles.playerCard, isSelected && styles.selectedCard]}
        onPress={() => togglePlayer(item)}
        activeOpacity={0.8}
      >
        <View style={{ flex: 1 }}>
          <Text style={[styles.playerName, isSelected && styles.whiteText]}>
            {item.firstName} {item.lastName}
          </Text>
          <Text style={[styles.playerRole, isSelected && { color: 'rgba(255,255,255,0.7)' }]}>
            {item.role}
          </Text>
        </View>
        {isSelected ? (
            <Ionicons name="checkmark-circle" size={24} color="#fff" />
        ) : (
            <Ionicons name="add-circle-outline" size={24} color={THEME.muted} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
            <Text style={styles.headerTitle}>{teamName}</Text>
            <Text style={styles.headerCount}>{squad.length} Players Selected</Text>
        </View>
        <Ionicons name="people-outline" size={32} color={THEME.secondary} />
      </View>

      {loading ? <ActivityIndicator size="large" color={THEME.primary} style={{ marginTop: 50 }} /> : (
        <FlatList
          data={allPlayers}
          renderItem={renderPlayer}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 20 }}
          ListEmptyComponent={<Text style={styles.emptyText}>No players in registry.</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.background },
  header: { padding: 25, backgroundColor: THEME.primary, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '900' },
  headerCount: { color: THEME.secondary, fontSize: 12, marginTop: 4, fontWeight: 'bold', letterSpacing: 1 },
  playerCard: { 
    backgroundColor: '#fff', 
    padding: 18, 
    borderRadius: 15, 
    marginBottom: 10, 
    flexDirection: 'row', 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
    elevation: 2
  },
  selectedCard: { backgroundColor: THEME.secondary, borderColor: THEME.secondary },
  playerName: { fontSize: 16, fontWeight: 'bold', color: THEME.primary },
  playerRole: { fontSize: 12, color: THEME.muted, marginTop: 2 },
  whiteText: { color: '#fff' },
  emptyText: { textAlign: 'center', marginTop: 50, color: THEME.muted }
});
