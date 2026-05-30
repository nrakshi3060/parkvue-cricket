import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, FlatList, TouchableOpacity, 
  ActivityIndicator, SafeAreaView, Alert 
} from 'react-native';
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

export default function ManageSquadScreen({ route }) {
  const { matchId, teamId, teamName } = route.params;
  const [allPlayers, setPlayers] = useState([]);
  const [squad, setSquad] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const players = await AdminService.getPlayers();
      const currentSquad = await AdminService.getSquad(matchId);
      
      setPlayers(players);
      // Filter squad for the specific team
      setSquad(currentSquad.filter(s => s.team.id === teamId));
    } catch (e) {
      Alert.alert('Error', 'Failed to load squad data');
    } finally {
      setLoading(false);
    }
  };

  const togglePlayer = async (player) => {
    const inSquad = squad.find(s => s.player.id === player.id);
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
      loadData(); // Reload to sync
    } catch (e) {
      Alert.alert('Error', 'Failed to update squad');
    }
  };

  const renderPlayer = ({ item }) => {
    const isSelected = squad.some(s => s.player.id === item.id);
    return (
      <TouchableOpacity 
        style={[styles.playerCard, isSelected && styles.selectedCard]}
        onPress={() => togglePlayer(item)}
      >
        <View style={{ flex: 1 }}>
          <Text style={[styles.playerName, isSelected && styles.whiteText]}>
            {item.firstName} {item.lastName}
          </Text>
          <Text style={[styles.playerRole, isSelected && { color: 'rgba(255,255,255,0.7)' }]}>
            {item.role}
          </Text>
        </View>
        {isSelected && <Text style={styles.check}>✓</Text>}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{teamName} Squad</Text>
        <Text style={styles.headerCount}>{squad.length} Players Selected</Text>
      </View>

      {loading ? <ActivityIndicator size="large" style={{ marginTop: 50 }} /> : (
        <FlatList
          data={allPlayers}
          renderItem={renderPlayer}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 20 }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.background },
  header: { padding: 20, backgroundColor: THEME.primary },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  headerCount: { color: THEME.secondary, fontSize: 12, marginTop: 4, fontWeight: 'bold' },
  playerCard: { 
    backgroundColor: '#fff', 
    padding: 18, 
    borderRadius: 12, 
    marginBottom: 10, 
    flexDirection: 'row', 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee'
  },
  selectedCard: { backgroundColor: THEME.secondary, borderColor: THEME.secondary },
  playerName: { fontSize: 16, fontWeight: 'bold', color: THEME.primary },
  playerRole: { fontSize: 12, color: THEME.muted, marginTop: 2 },
  whiteText: { color: '#fff' },
  check: { color: '#fff', fontSize: 20, fontWeight: 'bold' }
});
