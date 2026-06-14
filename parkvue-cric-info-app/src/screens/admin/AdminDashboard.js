import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView, StatusBar, Alert } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const THEME = {
  primary: '#0B2447',
  secondary: '#19A7CE',
  background: '#F8F9FA',
  card: '#FFFFFF',
  text: '#2D3436',
  muted: '#636E72',
  accent: '#A5D7E8'
};

export default function AdminDashboard({ navigation }) {
  const GridButton = ({ title, icon, color, onPress, isIonic = true }) => (
    <TouchableOpacity 
      style={[styles.gridBtn, { borderTopWidth: 4, borderTopColor: color }]} 
      onPress={onPress} 
      activeOpacity={0.8}
    >
      <View style={[styles.gridIconContainer, { backgroundColor: `${color}10` }]}>
        {isIonic ? (
            <Ionicons name={icon} size={24} color={color} />
        ) : (
            <MaterialCommunityIcons name={icon} size={24} color={color} />
        )}
      </View>
      <Text style={styles.gridTitle}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Standardized Admin Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={THEME.primary} />
        </TouchableOpacity>
        <View>
            <Text style={styles.headerTitle}>Command Center</Text>
            <Text style={styles.headerSubtitle}>System Management</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>CORE CONFIGURATION</Text>
          <View style={styles.grid}>
            <GridButton 
              title="Tournaments" 
              icon="trophy-outline" 
              color={THEME.primary}
              onPress={() => navigation.navigate('ManageEntity', { entityType: 'tournaments' })}
            />
            <GridButton 
              title="Teams" 
              icon="shield-half-outline" 
              color={THEME.secondary}
              onPress={() => navigation.navigate('ManageEntity', { entityType: 'teams' })}
            />
            <GridButton 
              title="Players" 
              icon="person-outline" 
              color="#2A9D8F"
              onPress={() => navigation.navigate('ManageEntity', { entityType: 'players' })}
            />
            <GridButton 
              title="Venues" 
              icon="location-outline" 
              color="#ECA154"
              onPress={() => Alert.alert("Coming Soon")}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>LIVE OPERATIONS</Text>
          <TouchableOpacity 
            style={styles.heroBtn}
            activeOpacity={0.9}
            onPress={() => navigation.navigate('MatchManagement')}
          >
            <View style={styles.heroContent}>
              <View style={styles.heroIconWrapper}>
                <Ionicons name="calendar-outline" size={26} color="#fff" />
              </View>
              <View>
                <Text style={styles.heroTitle}>Match Schedules</Text>
                <Text style={styles.heroSubtitle}>Initialize fixtures & Manage Squads</Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.heroBtn, { backgroundColor: THEME.secondary, marginTop: 12 }]}
            activeOpacity={0.9}
            onPress={() => navigation.navigate('SelectMatchScoring')}
          >
            <View style={styles.heroContent}>
              <View style={[styles.heroIconWrapper, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                <MaterialCommunityIcons name="cricket" size={26} color="#fff" />
              </View>
              <View>
                <Text style={[styles.heroTitle, { color: '#fff' }]}>Enter Match Scoring</Text>
                <Text style={[styles.heroSubtitle, { color: 'rgba(255,255,255,0.8)' }]}>Start live ball-by-ball entry</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.background },
  topHeader: { flexDirection: 'row', alignItems: 'center', padding: 25, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  backBtn: { marginRight: 15, padding: 5 },
  headerTitle: { fontSize: 22, fontWeight: '900', color: THEME.primary, letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 13, color: THEME.muted, fontWeight: '600' },
  scrollContent: { padding: 25 },
  section: { marginBottom: 35 },
  sectionLabel: { fontSize: 13, fontWeight: 'bold', color: THEME.muted, marginBottom: 20, letterSpacing: 1.5 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  gridBtn: { 
    width: '47%', 
    backgroundColor: THEME.card, 
    borderRadius: 20, 
    padding: 20, 
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3
  },
  gridIconContainer: { 
    width: 50, 
    height: 50, 
    borderRadius: 15, 
    justifyContent: 'center', 
    alignItems: 'center',
    marginBottom: 12
  },
  gridIcon: { fontSize: 24 },
  gridTitle: { fontSize: 14, fontWeight: '700', color: THEME.primary },
  heroBtn: { 
    backgroundColor: THEME.primary, 
    borderRadius: 20, 
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5
  },
  heroContent: { flexDirection: 'row', alignItems: 'center' },
  heroIconWrapper: { 
    backgroundColor: 'rgba(255,255,255,0.1)', 
    padding: 12, 
    borderRadius: 15, 
    marginRight: 20 
  },
  heroTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  heroSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 2 }
});
