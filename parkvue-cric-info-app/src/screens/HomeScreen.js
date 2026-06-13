import React, { useState, useEffect, useMemo } from 'react';
import { 
  StyleSheet, Text, View, FlatList, TouchableOpacity, 
  ActivityIndicator, RefreshControl, SafeAreaView, StatusBar, ScrollView, TextInput
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { fetchAllMatches } from '../services/MatchService';

const THEME = {
  primary: '#0B2447',
  secondary: '#19A7CE',
  background: '#F8F9FA',
  card: '#FFFFFF',
  text: '#2D3436',
  muted: '#636E72',
  live: '#E63946',
  upcoming: '#ECA154',
  completed: '#2A9D8F',
  white: '#FFFFFF',
  accent: '#A5D7E8'
};

export default function HomeScreen({ navigation }) {
  const [allMatches, setAllMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const loadMatches = async () => {
    const data = await fetchAllMatches();
    setAllMatches(data || []);
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMatches();
    setRefreshing(false);
  };

  useEffect(() => {
    loadMatches();
    // Refresh list every minute
    const interval = setInterval(loadMatches, 60000);
    return () => clearInterval(interval);
  }, []);

  // Categorization Logic
  const filteredData = useMemo(() => {
      const filtered = search 
        ? allMatches.filter(m => 
            m.team1?.name.toLowerCase().includes(search.toLowerCase()) || 
            m.team2?.name.toLowerCase().includes(search.toLowerCase()) ||
            m.tournament?.name.toLowerCase().includes(search.toLowerCase()))
        : allMatches;

      return {
          hero: filtered.find(m => m.status === 'Live'),
          live: filtered.filter(m => m.status === 'Live'),
          upcoming: filtered.filter(m => m.status === 'Upcoming'),
          completed: filtered.filter(m => m.status === 'Completed'),
      };
  }, [allMatches, search]);

  const SectionHeader = ({ title, icon }) => (
    <View style={styles.sectionHeader}>
        <Ionicons name={icon} size={16} color={THEME.muted} style={{ marginRight: 8 }} />
        <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  const MatchCard = ({ item, isSmall = false }) => {
    const isLive = item.status === 'Live';
    return (
        <TouchableOpacity 
          style={[styles.matchCard, isSmall && styles.smallCard]}
          activeOpacity={0.9}
          onPress={() => navigation.navigate('MatchCenter', { matchId: item.id })}
        >
          <View style={styles.cardTop}>
            <Text style={styles.venueText} numberOfLines={1}>{item.venue || 'Venue TBA'}</Text>
            <View style={[styles.miniBadge, { backgroundColor: isLive ? THEME.live : THEME.upcoming }]}>
                <Text style={styles.miniBadgeText}>{item.status?.toUpperCase()}</Text>
            </View>
          </View>
          
          <View style={styles.cardTeams}>
            <View style={styles.teamRow}>
                <Text style={styles.teamAbbr}>{item.team1?.shortName}</Text>
                <Text style={styles.teamFull} numberOfLines={1}>{item.team1?.name}</Text>
            </View>
            <View style={styles.vsLine} />
            <View style={[styles.teamRow, { alignItems: 'flex-end' }]}>
                <Text style={styles.teamAbbr}>{item.team2?.shortName}</Text>
                <Text style={[styles.teamFull, { textAlign: 'right' }]} numberOfLines={1}>{item.team2?.name}</Text>
            </View>
          </View>

          <Text style={styles.tournName}>{item.tournament?.name}</Text>
        </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={THEME.secondary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Premium Header */}
      <View style={styles.header}>
        <View style={styles.topRow}>
            <Text style={styles.brand}>parkvue<Text style={{color: THEME.secondary}}>.cric</Text></Text>
            <View style={styles.actionGroup}>
                <TouchableOpacity onPress={() => navigation.navigate('PlayerList')} style={styles.iconBtn}>
                    <Ionicons name="bar-chart" size={20} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('AdminDashboard')} style={styles.iconBtn}>
                    <Ionicons name="settings" size={20} color="#fff" />
                </TouchableOpacity>
            </View>
        </View>

        <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color="rgba(255,255,255,0.5)" />
            <TextInput 
                style={styles.searchInput}
                placeholder="Find a team or tournament..."
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={search}
                onChangeText={setSearch}
            />
            {search.length > 0 && (
                <TouchableOpacity onPress={() => setSearch('')}>
                    <Ionicons name="close-circle" size={18} color="rgba(255,255,255,0.5)" />
                </TouchableOpacity>
            )}
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={THEME.secondary} />}
      >
        {/* HERO SECTION */}
        {filteredData.hero && (
            <View style={styles.heroSection}>
                <SectionHeader title="PREMIER LIVE" icon="flame" />
                <TouchableOpacity 
                    style={styles.heroCard}
                    activeOpacity={0.9}
                    onPress={() => navigation.navigate('MatchCenter', { matchId: filteredData.hero.id })}
                >
                    <View style={styles.heroBadge}><View style={styles.pulse} /><Text style={styles.heroBadgeText}>LIVE NOW</Text></View>
                    <Text style={styles.heroVenue}>{filteredData.hero.venue}</Text>
                    <View style={styles.heroTeams}>
                        <View style={styles.heroTeam}>
                            <Text style={styles.heroAbbr}>{filteredData.hero.team1?.shortName}</Text>
                            <Text style={styles.heroFullName}>{filteredData.hero.team1?.name}</Text>
                        </View>
                        <View style={styles.heroVs}><Text style={styles.heroVsText}>VS</Text></View>
                        <View style={[styles.heroTeam, { alignItems: 'flex-end' }]}>
                            <Text style={styles.heroAbbr}>{filteredData.hero.team2?.shortName}</Text>
                            <Text style={[styles.heroFullName, { textAlign: 'right' }]}>{filteredData.hero.team2?.name}</Text>
                        </View>
                    </View>
                    <Text style={styles.heroTourn}>{filteredData.hero.tournament?.name}</Text>
                </TouchableOpacity>
            </View>
        )}

        {/* OTHER LIVE MATCHES */}
        {filteredData.live.filter(m => m.id !== filteredData.hero?.id).length > 0 && (
            <View style={styles.section}>
                <SectionHeader title="OTHER LIVE GAMES" icon="radio" />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalList}>
                    {filteredData.live.filter(m => m.id !== filteredData.hero?.id).map(item => (
                        <MatchCard key={item.id} item={item} isSmall={true} />
                    ))}
                </ScrollView>
            </View>
        )}

        {/* UPCOMING */}
        {filteredData.upcoming.length > 0 && (
            <View style={styles.section}>
                <SectionHeader title="UPCOMING FIXTURES" icon="calendar" />
                {filteredData.upcoming.map(item => <MatchCard key={item.id} item={item} />)}
            </View>
        )}

        {/* COMPLETED */}
        {filteredData.completed.length > 0 && (
            <View style={styles.section}>
                <SectionHeader title="RECENT RESULTS" icon="checkmark-done-circle" />
                {filteredData.completed.map(item => <MatchCard key={item.id} item={item} />)}
            </View>
        )}

        {allMatches.length === 0 && (
            <View style={styles.empty}>
                <Ionicons name="documents-outline" size={48} color="#ccc" />
                <Text style={styles.emptyText}>No fixtures scheduled yet.</Text>
            </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: THEME.background },
  header: { 
      backgroundColor: THEME.primary, 
      paddingTop: 10,
      paddingHorizontal: 25, 
      paddingBottom: 25,
      borderBottomLeftRadius: 35,
      borderBottomRightRadius: 35,
      elevation: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.15,
      shadowRadius: 20
  },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  brand: { fontSize: 24, fontWeight: '900', color: '#FFFFFF', letterSpacing: -1 },
  actionGroup: { flexDirection: 'row', gap: 12 },
  iconBtn: { width: 44, height: 44, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  searchBar: { 
      backgroundColor: 'rgba(255,255,255,0.1)', 
      borderRadius: 15, 
      paddingHorizontal: 15, 
      flexDirection: 'row', 
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.1)'
  },
  searchInput: { flex: 1, height: 44, color: '#fff', marginLeft: 10, fontSize: 14, fontWeight: '600' },
  
  scrollContent: { paddingHorizontal: 25, paddingTop: 25 },
  section: { marginBottom: 30 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 12, fontWeight: '900', color: THEME.muted, letterSpacing: 1.5, textTransform: 'uppercase' },
  
  // Hero Card
  heroSection: { marginBottom: 35 },
  heroCard: { 
      backgroundColor: THEME.primary, 
      borderRadius: 30, 
      padding: 25,
      elevation: 8,
      shadowColor: THEME.primary,
      shadowOpacity: 0.3,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 10 }
  },
  heroBadge: { 
      alignSelf: 'flex-start', 
      backgroundColor: 'rgba(230, 57, 70, 0.2)', 
      paddingHorizontal: 12, 
      paddingVertical: 6, 
      borderRadius: 20,
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 15,
      borderWidth: 1,
      borderColor: 'rgba(230, 57, 70, 0.4)'
  },
  pulse: { width: 6, height: 6, borderRadius: 3, backgroundColor: THEME.live, marginRight: 8 },
  heroBadgeText: { color: THEME.live, fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  heroVenue: { color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 15 },
  heroTeams: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  heroTeam: { flex: 1 },
  heroAbbr: { color: '#fff', fontSize: 28, fontWeight: '900', letterSpacing: -1 },
  heroFullName: { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 4, fontWeight: '600' },
  heroVs: { width: 34, height: 34, borderRadius: 17, backgroundColor: THEME.secondary, justifyContent: 'center', alignItems: 'center', marginHorizontal: 15 },
  heroVsText: { color: '#fff', fontSize: 10, fontWeight: '900' },
  heroTourn: { color: THEME.secondary, fontSize: 13, fontWeight: 'bold', fontStyle: 'italic' },

  // List Cards
  horizontalList: { marginHorizontal: -25, paddingHorizontal: 25 },
  smallCard: { width: 280, marginRight: 15 },
  matchCard: { 
      backgroundColor: THEME.card, 
      borderRadius: 20, 
      padding: 20, 
      marginBottom: 15,
      borderWidth: 1,
      borderColor: THEME.border,
      shadowColor: '#000',
      shadowOpacity: 0.03,
      shadowRadius: 10,
      elevation: 2
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  venueText: { fontSize: 10, fontWeight: 'bold', color: THEME.muted, textTransform: 'uppercase', flex: 1 },
  miniBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  miniBadgeText: { color: '#fff', fontSize: 8, fontWeight: '900' },
  cardTeams: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  teamRow: { flex: 1 },
  teamAbbr: { fontSize: 18, fontWeight: '900', color: THEME.primary },
  teamFull: { fontSize: 11, color: THEME.muted, marginTop: 2, fontWeight: '500' },
  vsLine: { width: 1, height: 30, backgroundColor: THEME.border, marginHorizontal: 15 },
  tournName: { fontSize: 11, color: THEME.muted, fontStyle: 'italic', fontWeight: '500' },
  empty: { alignItems: 'center', marginTop: 100 },
  emptyText: { marginTop: 15, color: THEME.muted, fontWeight: '600' }
});
