import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { submitDelivery } from '../../services/MatchService';

export default function LiveScoring({ route, navigation }) {
  const { matchId, matchName } = route.params;
  const [runs, setRuns] = useState(0);
  const [extra, setExtra] = useState('None');
  const [isWicket, setIsWicket] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        // In a real app, we'd need the current innings ID
        // For this prototype, we'll assume the backend can infer or we'd fetch it
        innings: { id: 'dummy-innings-id' }, 
        runsBatter: runs,
        extrasType: extra,
        wicket: isWicket,
        overNumber: 1, // Mock
        ballNumber: 1, // Mock
        commentary: `${runs} runs scored. ${extra !== 'None' ? extra : ''} ${isWicket ? 'WICKET!' : ''}`
      };
      
      await submitDelivery(payload);
      Alert.alert('Success', 'Ball submitted!');
      // Reset local state for next ball
      setRuns(0);
      setExtra('None');
      setIsWicket(false);
    } catch (error) {
      Alert.alert('Error', 'Could not submit ball. Check console.');
    } finally {
      setSubmitting(false);
    }
  };

  const RunButton = ({ value }) => (
    <TouchableOpacity 
      style={[styles.btn, runs === value && styles.btnActive]} 
      onPress={() => setRuns(value)}
    >
      <Text style={[styles.btnText, runs === value && styles.btnTextActive]}>{value}</Text>
    </TouchableOpacity>
  );

  const ExtraButton = ({ type }) => (
    <TouchableOpacity 
      style={[styles.extraBtn, extra === type && styles.btnActive]} 
      onPress={() => setExtra(type)}
    >
      <Text style={[styles.btnText, extra === type && styles.btnTextActive]}>{type}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.matchName}>{matchName}</Text>
      
      <View style={styles.section}>
        <Text style={styles.label}>Runs Scored</Text>
        <View style={styles.row}>
          {[0, 1, 2, 3, 4, 6].map(v => <RunButton key={v} value={v} />)}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Extras</Text>
        <View style={styles.row}>
          {['None', 'Wide', 'No-Ball', 'Bye', 'Leg-Bye'].map(t => <ExtraButton key={t} type={t} />)}
        </View>
      </View>

      <View style={styles.section}>
        <TouchableOpacity 
          style={[styles.wicketBtn, isWicket && styles.wicketBtnActive]} 
          onPress={() => setIsWicket(!isWicket)}
        >
          <Text style={styles.wicketText}>{isWicket ? 'WICKET SELECTED' : 'OUT!'}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={[styles.submitBtn, submitting && styles.submitBtnDisabled]} 
        onPress={handleSubmit}
        disabled={submitting}
      >
        <Text style={styles.submitText}>{submitting ? 'Submitting...' : 'Submit Ball'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  matchName: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  section: { marginBottom: 24 },
  label: { fontSize: 14, color: '#666', marginBottom: 8, textTransform: 'uppercase' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  btn: { width: 50, height: 50, borderRadius: 25, borderWidth: 1, borderColor: '#ccc', justifyContent: 'center', alignItems: 'center' },
  extraBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#ccc' },
  btnActive: { backgroundColor: '#004d40', borderColor: '#004d40' },
  btnText: { fontSize: 16, fontWeight: '600' },
  btnTextActive: { color: '#fff' },
  wicketBtn: { padding: 16, borderRadius: 8, borderWidth: 2, borderColor: '#d32f2f', alignItems: 'center' },
  wicketBtnActive: { backgroundColor: '#d32f2f' },
  wicketText: { color: '#d32f2f', fontWeight: 'bold' },
  submitBtn: { backgroundColor: '#004d40', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  submitBtnDisabled: { opacity: 0.5 },
  submitText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
