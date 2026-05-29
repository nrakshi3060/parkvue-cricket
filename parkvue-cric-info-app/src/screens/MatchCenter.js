import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';

export default function MatchCenter({ route }) {
  const { matchId } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Match Center</Text>
      <View style={styles.scoreBoard}>
        <Text style={styles.scoreText}>156/4 (18.2)</Text>
        <Text style={styles.infoText}>CRR: 8.51</Text>
      </View>
      
      <ScrollView style={styles.commentary}>
        <Text style={styles.commentaryHeader}>Live Commentary</Text>
        <View style={styles.deliveryItem}>
          <Text style={styles.deliveryBall}>18.2</Text>
          <Text style={styles.deliveryText}>FOUR! J. Doe smashes it over mid-off.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  header: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  scoreBoard: { padding: 20, backgroundColor: '#004d40', borderRadius: 12, alignItems: 'center' },
  scoreText: { fontSize: 32, fontWeight: 'bold', color: '#fff' },
  infoText: { fontSize: 16, color: '#e0e0e0', marginTop: 4 },
  commentary: { marginTop: 20 },
  commentaryHeader: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  deliveryItem: { flexDirection: 'row', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  deliveryBall: { fontWeight: 'bold', width: 40 },
  deliveryText: { flex: 1 },
});
