// ============================================
// ADD CHILD SCREEN - Adaugă profil copil
// Câmpuri din DB: Children + ChildSkillGoals + Rewards + Cycles
// ============================================
import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, KeyboardAvoidingView, Platform, ScrollView,
  Alert, ActivityIndicator,
} from 'react-native';
import { COLORS, FONTS, RADIUS } from '../constants/colors';

// Categoriile din tabela SkillCategories
const SKILL_CATEGORIES = [
  { id: 1, label: 'Școală', icon: '📚', color: COLORS.scoala },
  { id: 2, label: 'Disciplină', icon: '⏰', color: COLORS.disciplina },
  { id: 3, label: 'Respect', icon: '🤝', color: COLORS.respect },
  { id: 4, label: 'Sport', icon: '🏃', color: COLORS.sport },
  { id: 5, label: 'Ordine', icon: '🧹', color: COLORS.ordine },
  { id: 6, label: 'Altele', icon: '✨', color: COLORS.primary },
];

const SEX_OPTIONS = [
  { value: 'M', label: 'Băiat', icon: '👦' },
  { value: 'F', label: 'Fată', icon: '👧' },
];

export default function AddChildScreen({ navigation, route }) {
  const parentId = route?.params?.parentId;

  // Pasul curent din wizard (1, 2, 3)
  const [pas, setPas] = useState(1);

  // Date copil - corespund tabelei Children
  const [numeC, setNumeC] = useState('');
  const [prenumeC, setPrenumeC] = useState('');
  const [varsta, setVarsta] = useState('');
  const [sex, setSex] = useState('');
  const [descriere, setDescriere] = useState('');

  // Abilități selectate - tabela ChildSkillGoals
  const [abilitatiSelectate, setAbilitatiSelectate] = useState([]);

  // Recompensă + ciclu - tabelele Rewards + Cycles
  const [premiu, setPremiu] = useState('');
  const [linkPremiu, setLinkPremiu] = useState('');
  const [durataCiclu, setDurataCiclu] = useState('30');

  const [loading, setLoading] = useState(false);

  const toggleAbilitate = (id) => {
    setAbilitatiSelectate(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    if (!numeC || !prenumeC || !varsta || !sex) {
      Alert.alert('Atenție', 'Completează toate câmpurile obligatorii');
      return;
    }
    if (abilitatiSelectate.length === 0) {
      Alert.alert('Atenție', 'Selectează cel puțin o abilitate');
      return;
    }
    if (!premiu) {
      Alert.alert('Atenție', 'Adaugă recompensa pentru copil');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://192.168.1.1:3000/api/add-child', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parentId,
          firstName: prenumeC,
          lastName: numeC,
          age: parseInt(varsta),
          sex,
          description: descriere,
          skillGoals: abilitatiSelectate,
          rewardName: premiu,
          rewardLink: linkPremiu,
          cycleDays: parseInt(durataCiclu),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        navigation.replace('Dashboard', { parentId });
      } else {
        Alert.alert('Eroare', data.mesaj || 'A apărut o eroare');
      }
    } catch {
      Alert.alert('Eroare', 'Nu mă pot conecta la server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>

        {/* Header cu pași */}
        <View style={styles.header}>
          <Text style={styles.logo}>🌟 KinderApp</Text>
          <Text style={styles.title}>Adaugă copilul</Text>
          <View style={styles.stepsRow}>
            {[1, 2, 3].map(i => (
              <View key={i} style={styles.stepItem}>
                <View style={[styles.stepCircle, pas >= i && styles.stepActiv]}>
                  <Text style={[styles.stepNum, pas >= i && { color: 'white' }]}>{i}</Text>
                </View>
                {i < 3 && <View style={[styles.stepLine, pas > i && styles.stepLineActiv]} />}
              </View>
            ))}
          </View>
          <Text style={styles.stepLabel}>
            {pas === 1 ? 'Date copil' : pas === 2 ? 'Abilități' : 'Recompensă'}
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* ===== PAS 1: Date copil ===== */}
          {pas === 1 && (
            <View style={styles.card}>
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Prenume *</Text>
                  <View style={styles.inputBox}>
                    <TextInput style={styles.input} placeholder="Ion" placeholderTextColor={COLORS.textLight}
                      value={prenumeC} onChangeText={setPrenumeC} />
                  </View>
                </View>
                <View style={{ width: 12 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Nume *</Text>
                  <View style={styles.inputBox}>
                    <TextInput style={styles.input} placeholder="Popescu" placeholderTextColor={COLORS.textLight}
                      value={numeC} onChangeText={setNumeC} />
                  </View>
                </View>
              </View>

              <Text style={styles.label}>Vârsta *</Text>
              <View style={styles.inputBox}>
                <Text style={styles.inputIcon}>🎂</Text>
                <TextInput style={styles.input} placeholder="ex: 8" placeholderTextColor={COLORS.textLight}
                  value={varsta} onChangeText={setVarsta} keyboardType="numeric" />
                <Text style={styles.inputSuffix}>ani</Text>
              </View>

              <Text style={styles.label}>Sex *</Text>
              <View style={styles.sexRow}>
                {SEX_OPTIONS.map(opt => (
                  <TouchableOpacity
                    key={opt.value}
                    style={[styles.sexBtn, sex === opt.value && styles.sexBtnActiv]}
                    onPress={() => setSex(opt.value)}
                  >
                    <Text style={styles.sexIcon}>{opt.icon}</Text>
                    <Text style={[styles.sexLabel, sex === opt.value && { color: COLORS.primary, fontWeight: '800' }]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Descriere copil</Text>
              <View style={[styles.inputBox, { height: 80, alignItems: 'flex-start', paddingTop: 12 }]}>
                <TextInput
                  style={[styles.input, { height: 60 }]}
                  placeholder="Câteva cuvinte despre copil..."
                  placeholderTextColor={COLORS.textLight}
                  value={descriere}
                  onChangeText={setDescriere}
                  multiline
                />
              </View>
            </View>
          )}

          {/* ===== PAS 2: Abilități ===== */}
          {pas === 2 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Ce vrei să îmbunătățești? 🎯</Text>
              <Text style={styles.cardSubtitle}>Selectează domeniile — aplicația va genera taskuri automat</Text>

              <View style={styles.skillsGrid}>
                {SKILL_CATEGORIES.map(cat => {
                  const selectat = abilitatiSelectate.includes(cat.id);
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      style={[styles.skillBtn, selectat && { borderColor: cat.color, backgroundColor: cat.color + '18' }]}
                      onPress={() => toggleAbilitate(cat.id)}
                    >
                      <Text style={styles.skillIcon}>{cat.icon}</Text>
                      <Text style={[styles.skillLabel, selectat && { color: cat.color, fontWeight: '800' }]}>
                        {cat.label}
                      </Text>
                      {selectat && (
                        <View style={[styles.skillCheck, { backgroundColor: cat.color }]}>
                          <Text style={{ color: 'white', fontSize: 9 }}>✓</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.hint}>
                💡 {abilitatiSelectate.length === 0
                  ? 'Selectează cel puțin o abilitate'
                  : `${abilitatiSelectate.length} abilitat${abilitatiSelectate.length === 1 ? 'e' : 'i'} selectat${abilitatiSelectate.length === 1 ? 'ă' : 'e'}`}
              </Text>
            </View>
          )}

          {/* ===== PAS 3: Recompensă ===== */}
          {pas === 3 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Setează recompensa 🎁</Text>
              <Text style={styles.cardSubtitle}>Copilul o primește dacă completează ≥85% din taskuri</Text>

              <View style={styles.rewardPreview}>
                <Text style={styles.rewardBigIcon}>🏆</Text>
                <Text style={styles.rewardPreviewText}>
                  {premiu || 'Recompensa ta...'}
                </Text>
              </View>

              <Text style={styles.label}>Premiul *</Text>
              <View style={styles.inputBox}>
                <Text style={styles.inputIcon}>🎁</Text>
                <TextInput style={styles.input} placeholder="ex: Bicicletă, Tabletă, Joc"
                  placeholderTextColor={COLORS.textLight} value={premiu} onChangeText={setPremiu} />
              </View>

              <Text style={styles.label}>Link produs (opțional)</Text>
              <View style={styles.inputBox}>
                <Text style={styles.inputIcon}>🔗</Text>
                <TextInput style={styles.input} placeholder="https://..."
                  placeholderTextColor={COLORS.textLight} value={linkPremiu} onChangeText={setLinkPremiu}
                  autoCapitalize="none" />
              </View>

              <Text style={styles.label}>Durata ciclului</Text>
              <View style={styles.duratRow}>
                {['7', '14', '30', '60'].map(d => (
                  <TouchableOpacity
                    key={d}
                    style={[styles.duratBtn, durataCiclu === d && styles.duratBtnActiv]}
                    onPress={() => setDurataCiclu(d)}
                  >
                    <Text style={[styles.duratLabel, durataCiclu === d && { color: 'white' }]}>{d}</Text>
                    <Text style={[styles.duratSub, durataCiclu === d && { color: 'rgba(255,255,255,0.8)' }]}>zile</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.thresholdInfo}>
                <Text style={styles.thresholdIcon}>🎯</Text>
                <Text style={styles.thresholdText}>
                  Pragul de succes este setat la <Text style={{ fontWeight: '800', color: COLORS.primary }}>85%</Text> din taskuri completate
                </Text>
              </View>
            </View>
          )}

          {/* Butoane navigare */}
          <View style={styles.btnRow}>
            {pas > 1 && (
              <TouchableOpacity style={styles.btnBack} onPress={() => setPas(pas - 1)}>
                <Text style={styles.btnBackText}>← Înapoi</Text>
              </TouchableOpacity>
            )}
            {pas < 3 ? (
              <TouchableOpacity style={[styles.btnNext, pas === 1 && { flex: 1 }]} onPress={() => setPas(pas + 1)}>
                <Text style={styles.btnNextText}>Continuă →</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.btnNext, { flex: 1 }, loading && { opacity: 0.7 }]}
                onPress={handleSave}
                disabled={loading}
              >
                {loading
                  ? <ActivityIndicator color="white" />
                  : <Text style={styles.btnNextText}>✅ Salvează profilul</Text>
                }
              </TouchableOpacity>
            )}
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { paddingHorizontal: 20, paddingBottom: 32 },

  header: { alignItems: 'center', paddingTop: 20, paddingBottom: 16, paddingHorizontal: 20 },
  logo: { fontSize: FONTS.small, fontWeight: '700', color: COLORS.primary, marginBottom: 4 },
  title: { fontSize: FONTS.title, fontWeight: '800', color: COLORS.textDark, marginBottom: 16 },

  stepsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  stepItem: { flexDirection: 'row', alignItems: 'center' },
  stepCircle: {
    width: 32, height: 32, borderRadius: 16,
    borderWidth: 2, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.card,
  },
  stepActiv: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  stepNum: { fontSize: FONTS.small, fontWeight: '800', color: COLORS.textLight },
  stepLine: { width: 40, height: 2, backgroundColor: COLORS.border },
  stepLineActiv: { backgroundColor: COLORS.primary },
  stepLabel: { fontSize: FONTS.body, fontWeight: '700', color: COLORS.textMedium },

  card: {
    backgroundColor: COLORS.card, borderRadius: RADIUS.large,
    padding: 20, marginBottom: 16,
    elevation: 3, shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 3 }, shadowOpacity: 1, shadowRadius: 8,
  },
  cardTitle: { fontSize: FONTS.large, fontWeight: '800', color: COLORS.textDark, marginBottom: 4 },
  cardSubtitle: { fontSize: FONTS.small, color: COLORS.textMedium, marginBottom: 16, lineHeight: 18 },

  row: { flexDirection: 'row', marginBottom: 0 },
  label: { fontSize: FONTS.small, fontWeight: '700', color: COLORS.textDark, marginBottom: 6, marginTop: 12 },
  inputBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.background, borderRadius: RADIUS.medium,
    borderWidth: 1.5, borderColor: COLORS.border,
    paddingHorizontal: 14, height: 50,
  },
  inputIcon: { fontSize: 16, marginRight: 8 },
  inputSuffix: { fontSize: FONTS.small, color: COLORS.textMedium, fontWeight: '600' },
  input: { flex: 1, fontSize: FONTS.body, color: COLORS.textDark },

  sexRow: { flexDirection: 'row', gap: 12, marginTop: 0 },
  sexBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, borderWidth: 1.5, borderColor: COLORS.border,
    borderRadius: RADIUS.medium, paddingVertical: 12,
    backgroundColor: COLORS.background,
  },
  sexBtnActiv: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '12' },
  sexIcon: { fontSize: 20 },
  sexLabel: { fontSize: FONTS.body, fontWeight: '600', color: COLORS.textMedium },

  skillsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 12 },
  skillBtn: {
    width: '30%', alignItems: 'center', paddingVertical: 14,
    borderRadius: RADIUS.medium, borderWidth: 1.5, borderColor: COLORS.border,
    backgroundColor: COLORS.background, position: 'relative',
  },
  skillIcon: { fontSize: 24, marginBottom: 4 },
  skillLabel: { fontSize: FONTS.small, fontWeight: '600', color: COLORS.textMedium },
  skillCheck: {
    position: 'absolute', top: 6, right: 6,
    width: 16, height: 16, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  hint: { fontSize: FONTS.small, color: COLORS.primary, fontWeight: '600', textAlign: 'center' },

  rewardPreview: {
    backgroundColor: COLORS.accentLight, borderRadius: RADIUS.medium,
    padding: 16, alignItems: 'center', marginBottom: 16,
  },
  rewardBigIcon: { fontSize: 40, marginBottom: 4 },
  rewardPreviewText: { fontSize: FONTS.medium, fontWeight: '800', color: COLORS.textDark },

  duratRow: { flexDirection: 'row', gap: 10, marginTop: 0 },
  duratBtn: {
    flex: 1, alignItems: 'center', paddingVertical: 12,
    borderRadius: RADIUS.medium, borderWidth: 1.5, borderColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  duratBtnActiv: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  duratLabel: { fontSize: FONTS.large, fontWeight: '800', color: COLORS.textDark },
  duratSub: { fontSize: 10, color: COLORS.textLight },

  thresholdInfo: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: COLORS.cardWarm, borderRadius: RADIUS.medium,
    padding: 12, marginTop: 12,
  },
  thresholdIcon: { fontSize: 20 },
  thresholdText: { flex: 1, fontSize: FONTS.small, color: COLORS.textMedium, lineHeight: 18 },

  btnRow: { flexDirection: 'row', gap: 12, marginTop: 4, marginBottom: 16 },
  btnBack: {
    borderWidth: 2, borderColor: COLORS.primary, borderRadius: RADIUS.full,
    height: 54, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center',
  },
  btnBackText: { color: COLORS.primary, fontSize: FONTS.body, fontWeight: '700' },
  btnNext: {
    backgroundColor: COLORS.primary, borderRadius: RADIUS.full,
    height: 54, paddingHorizontal: 24, alignItems: 'center', justifyContent: 'center',
    elevation: 4, shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8,
  },
  btnNextText: { color: COLORS.white, fontSize: FONTS.medium, fontWeight: '800' },
});