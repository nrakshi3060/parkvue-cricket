import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';

const THEME = {
  primary: '#0B2447',
  secondary: '#19A7CE',
  background: '#F8F9FA',
  card: '#FFFFFF',
  text: '#2D3436',
  muted: '#636E72'
};

export default function AdminDashboard({ navigation }) {
  const MenuButton = ({ title, subtitle, icon, onPress }) => (
    <TouchableOpacity style={styles.menuBtn} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.iconContainer}>
        <Text style={styles.menuIcon}>{icon}</Text>
      </View>
      <View style={styles.menuTextContainer}>
        <Text style={styles.menuTitle}>{title}</Text>
        <Text style={styles.menuSubtitle}>{subtitle}</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Admin Command Center</Text>
          <Text style={styles.headerSubtitle}>Manage tournaments, teams, and live matches</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>CORE SETUP</Text>
          <MenuButton 
            title="Tournaments" 
            subtitle="Create and manage leagues" 
            icon="🏆"
            onPress={() => navigation.navigate('ManageEntity', { entityType: 'tournaments' })}
          />
          <MenuButton 
            title="Teams" 
            subtitle="Manage participating squads" 
            icon="🛡️"
            onPress={() => navigation.navigate('ManageEntity', { entityType: 'teams' })}
          />
          <MenuButton 
            title="Players" 
            subtitle="Global player registry" 
            icon="👤"
            onPress={() => navigation.navigate('ManageEntity', { entityType: 'players' })}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>MATCH OPERATIONS</Text>
          <MenuButton 
            title="Schedules" 
            subtitle="Manage match fixtures" 
            icon="📅"
            onPress={() => navigation.navigate('ManageEntity', { entityType: 'matches' })}
          />
          <MenuButton 
            title="Live Scoring" 
            subtitle="Enter ball-by-ball data" 
            icon="🏏"
            onPress={() => navigation.navigate('SelectMatchScoring')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.background },
  scrollContent: { padding: 20 },
  header: { marginBottom: 30, marginTop: 10 },
  headerTitle: { fontSize: 24, fontWeight: '900', color: THEME.primary, letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 14, color: THEME.muted, marginTop: 5 },
  section: { marginBottom: 25 },
  sectionLabel: { fontSize: 12, fontWeight: '900', color: THEME.secondary, marginBottom: 15, letterSpacing: 1 },
  menuBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: THEME.card, 
    padding: 18, 
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2
  },
  iconContainer: { 
    width: 45, 
    height: 45, 
    borderRadius: 12, 
    backgroundColor: 'rgba(25, 167, 206, 0.1)', 
    justifyContent: 'center', 
    alignItems: 'center',
    marginRight: 15
  },
  menuIcon: { fontSize: 20 },
  menuTextContainer: { flex: 1 },
  menuTitle: { fontSize: 16, fontWeight: 'bold', color: THEME.primary },
  menuSubtitle: { fontSize: 12, color: THEME.muted, marginTop: 2 },
  chevron: { fontSize: 24, color: '#D1D1D6', fontWeight: '300' }
});
