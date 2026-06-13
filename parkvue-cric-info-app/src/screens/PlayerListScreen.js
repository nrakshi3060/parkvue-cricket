import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, FlatList, TouchableOpacity, 
  ActivityIndicator, SafeAreaView, TextInput, StatusBar 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AnalyticsService } from '../services/AnalyticsService';

const THEME = {
  primary: '#0B2447',
  secondary: '#19A7CE',
  background: '#F8F9FA',
  card: '#FFFFFF',
  text: '#2D3436',
  muted: '#636E72',
};

export default function PlayerListScreen({ navigation }) {
  const [players, setPlayers] = useState([]);
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadPlayers();
  }, []);

  const loadPlayers = async () => {
    setLoading(true);
    const data = await AnalyticsService.getPlayers();
    setPlayers(data);
    setFilteredPlayers(data);
    setLoading(false);
  };

  const handleSearch = (text) => {
    setSearch(text);
    if (!text) {
      setFilteredPlayers(players);
      return;
    }
    const filtered = players.filter(p => 
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredPlayers(filtered);
  };

  const renderPlayer = ({ item }) => (
    <TouchableOpacity 
      style={styles.playerCard}
      onPress={() => navigation.navigate('PlayerAnalytics', { playerId: item.id, playerName: `${item.firstName} ${item.lastName}` })}
      activeOpacity={0.8}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.firstName[0]}{item.lastName[0]}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.playerName}>{item.firstName} {item.lastName}</Text>
        <Text style={styles.playerRole}>{item.role}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={THEME.muted} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={THEME.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>Player Analytics</Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={THEME.muted} style={{ marginRight: 10 }} />
        <TextInput 
          style={styles.searchInput}
          placeholder="Search players..."
          value={search}
          onChangeText={handleSearch}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={THEME.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={filteredPlayers}
          renderItem={renderPlayer}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>No players found.</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.background },
  header: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  backBtn: { marginRight: 15 },
  title: { fontSize: 20, fontWeight: '900', color: THEME.primary },
  searchContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#fff', 
    margin: 20, 
    paddingHorizontal: 15, 
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#eee'
  },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 16 },
  list: { paddingHorizontal: 20 },
  playerCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#fff', 
    padding: 15, 
    borderRadius: 15, 
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5
  },
  avatar: { 
    width: 45, 
    height: 45, 
    borderRadius: 22.5, 
    backgroundColor: THEME.primary, 
    justifyContent: 'center', 
    alignItems: 'center',
    marginRight: 15
  },
  avatarText: { color: '#fff', fontWeight: 'bold' },
  playerName: { fontSize: 16, fontWeight: 'bold', color: THEME.primary },
  playerRole: { fontSize: 12, color: THEME.muted, marginTop: 2 },
  empty: { textAlign: 'center', marginTop: 50, color: THEME.muted }
});
