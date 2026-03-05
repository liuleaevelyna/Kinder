// ============================================
// DASHBOARD SCREEN - Ecranul principal al părintelui
// Date din: Parents, Children, Cycles, TaskCompletions
// ============================================
import { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView, FlatList,
} from 'react-native';
import { COLORS, FONTS, RADIUS } from '../constants/colors';

// ---- Date demo (înlocuiești cu apel API) ----
const DEMO_PARINTE = { firstName: 'Maria', lastName: 'Popescu' };
const DEMO_COPII = [
  { id_child: 1, firstName: 'Andrei', lastName: 'P.', age: 8, avatar: '👦', cycleProgress: 72, cycleDay: 22, cycleDays: 30, rewardName: 'Bicicletă' },
  { id_child: 2, firstName: 'Elena', lastName: 'P.', age: 10, avatar: '👧', cycleProgress: 91, cycleDay: 15, cycleDays: 30, rewardName: 'Tabletă' },
];

export default function DashboardScreen({ navigation }) {
  const parinte = DEMO_PARINTE;
  const copii = DEMO_COPII;

  const ora = new Date().getHours();
  const salut = ora < 12 ? 'Bună dimineața' : ora < 18 ? 'Bună ziua' : 'Bună seara';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header gradient */}
        <View style={styles.header}>
          <View>
            <Text style={styles.salut}>{salut},</Text>
            <Text style={styles.numeParinte}>{parinte.firstName}! 👋</Text>
          </View>
          <TouchableOpacity style={styles.notifBtn}>
            <Text style={styles.notifIcon}>🔔</Text>
            <View style={styles.notifBadge} />
          </TouchableOpacity>
        </View>

        <View style={styles.body}>

          {/* Rezumat rapid */}
          <View style={styles.summaryRow}>
            <View style={[styles.summaryCard, { borderLeftColor: COLORS.primary }]}>
              <Text style={styles.summaryVal}>{copii.length}</Text>
              <Text style={styles.summaryLabel}>Copii activi</Text>
            </View>
            <View style={[styles.summaryCard, { borderLeftColor: COLORS.secondary }]}>
              <Text style={styles.summaryVal}>
                {Math.round(copii.reduce((a, c) => a + c.cycleProgress, 0) / copii.length)}%
              </Text>
              <Text style={styles.summaryLabel}>Progres mediu</Text>
            </View>
            <View style={[styles.summaryCard, { borderLeftColor: COLORS.accent }]}>
              <Text style={styles.summaryVal}>8</Text>
              <Text style={styles.summaryLabel}>Taskuri azi</Text>
            </View>
          </View>

          {/* Copiii tăi */}
          <Text style={styles.sectionTitle}>👨‍👩‍👧 Copiii tăi</Text>
          {copii.map(copil => (
            <TouchableOpacity
              key={copil.id_child}
              style={styles.childCard}
              onPress={() => navigation.navigate('Tasks', { copil })}
            >
              <View style={styles.childLeft}>
                <View style={styles.avatarBox}>
                  <Text style={styles.avatarEmoji}>{copil.avatar}</Text>
                </View>
                <View>
                  <Text style={styles.childName}>{copil.firstName} {copil.lastName}</Text>
                  <Text style={styles.childAge}>{copil.age} ani • Ziua {copil.cycleDay}/{copil.cycleDays}</Text>
                  <View style={styles.rewardTag}>
                    <Text style={styles.rewardTagText}>🎁 {copil.rewardName}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.childRight}>
                <Text style={styles.progressPct}>{copil.cycleProgress}%</Text>
                <View style={styles.progressBarSmall}>
                  <View style={[styles.progressFillSmall, {
                    width: `${copil.cycleProgress}%`,
                    backgroundColor: copil.cycleProgress >= 85 ? COLORS.secondary : COLORS.primary,
                  }]} />
                </View>
                <Text style={styles.progressTarget}>țintă: 85%</Text>
              </View>
            </TouchableOpacity>
          ))}

          {/* Buton adaugă copil */}
          <TouchableOpacity
            style={styles.addChildBtn}
            onPress={() => navigation.navigate('AddChild')}
          >
            <Text style={styles.addChildIcon}>➕</Text>
            <Text style={styles.addChildText}>Adaugă copil nou</Text>
          </TouchableOpacity>

          {/* Acțiuni rapide */}
          <Text style={styles.sectionTitle}>⚡ Acțiuni rapide</Text>
          <View style={styles.quickRow}>
            {[
              { icon: '📊', label: 'Raport', color: COLORS.scoala },
              { icon: '📋', label: 'Taskuri', color: COLORS.secondary },
              { icon: '🏆', label: 'Premii', color: COLORS.accent },
              { icon: '⚙️', label: 'Setări', color: COLORS.textLight },
            ].map(item => (
              <TouchableOpacity key={item.label} style={styles.quickBtn}>
                <View style={[styles.quickIcon, { backgroundColor: item.color + '22' }]}>
                  <Text style={{ fontSize: 22 }}>{item.icon}</Text>
                </View>
                <Text style={styles.quickLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNav active="home" navigation={navigation} />
    </SafeAreaView>
  );
}

// ============================================
// TASKS SCREEN - Taskuri zilnice ale copilului
// Date din: Tasks, TaskCompletions, Cycles
// ============================================
export function TasksScreen({ navigation, route }) {
  const copil = route?.params?.copil || DEMO_COPII[0];

  const [taskuri, setTaskuri] = useState([
    { id: 1, title: 'Citește 20 de minute', category: 'Școală', icon: '📚', points: 10, done: true },
    { id: 2, title: 'Strânge jucăriile', category: 'Ordine', icon: '🧹', points: 5, done: true },
    { id: 3, title: 'Fă temele la matematică', category: 'Școală', icon: '📐', points: 15, done: false },
    { id: 4, title: '30 min mișcare afară', category: 'Sport', icon: '🏃', points: 10, done: false },
    { id: 5, title: 'Ajută la masă', category: 'Respect', icon: '🤝', points: 8, done: false },
    { id: 6, title: 'Doarme la ora 21:00', category: 'Disciplină', icon: '😴', points: 12, done: false },
  ]);

  const bifaTask = (id) => {
    setTaskuri(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
    // Aici trimiti la API: sp_CompleteTask
  };

  const completate = taskuri.filter(t => t.done).length;
  const total = taskuri.length;
  const procent = Math.round((completate / total) * 100);

  return (
    <SafeAreaView style={styles.container}>

      {/* Header */}
      <View style={[styles.header, { paddingBottom: 20 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ fontSize: 22, color: 'white' }}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.salut}>Taskurile lui</Text>
          <Text style={styles.numeParinte}>{copil.firstName} 📋</Text>
        </View>
        <Text style={styles.avatarEmoji}>{copil.avatar}</Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}>

        {/* Progress bar mare */}
        <View style={styles.progressCardBig}>
          <View style={styles.progressCardRow}>
            <Text style={styles.progressCardTitle}>Progres azi</Text>
            <Text style={styles.progressCardPct}>{completate}/{total} taskuri</Text>
          </View>
          <View style={styles.progressBarBig}>
            <View style={[styles.progressFillBig, { width: `${procent}%` }]} />
          </View>
          <Text style={styles.progressCardSub}>{procent}% completat • țintă ciclu: 85%</Text>
        </View>

        {/* Data */}
        <Text style={styles.sectionTitle}>
          📅 {new Date().toLocaleDateString('ro-RO', { weekday: 'long', day: 'numeric', month: 'long' })}
        </Text>

        {/* Lista taskuri */}
        {taskuri.map(task => (
          <TouchableOpacity
            key={task.id}
            style={[styles.taskCard, task.done && styles.taskCardDone]}
            onPress={() => bifaTask(task.id)}
          >
            <View style={[styles.taskCheck, task.done && styles.taskCheckDone]}>
              {task.done && <Text style={{ color: 'white', fontSize: 12 }}>✓</Text>}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.taskTitle, task.done && styles.taskTitleDone]}>{task.title}</Text>
              <Text style={styles.taskCategory}>{task.icon} {task.category}</Text>
            </View>
            <View style={styles.taskPoints}>
              <Text style={styles.taskPointsText}>+{task.points}⭐</Text>
            </View>
          </TouchableOpacity>
        ))}

      </ScrollView>

      <BottomNav active="tasks" navigation={navigation} />
    </SafeAreaView>
  );
}

// ============================================
// PROGRESS SCREEN - Progres și statistici
// Date din: Cycles, TaskCompletions, EvaluationReports
// ============================================
export function ProgressScreen({ navigation, route }) {
  const copil = route?.params?.copil || DEMO_COPII[0];

  const zileSaptamana = [
    { zi: 'L', val: 80 }, { zi: 'M', val: 70 }, { zi: 'Mi', val: 90 },
    { zi: 'J', val: 60 }, { zi: 'V', val: 40 }, { zi: 'S', val: 0 }, { zi: 'D', val: 0 },
  ];

  const maxVal = Math.max(...zileSaptamana.map(z => z.val), 1);

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, { paddingBottom: 20 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ fontSize: 22, color: 'white' }}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.salut}>Progresul lui</Text>
          <Text style={styles.numeParinte}>{copil.firstName} 📊</Text>
        </View>
        <Text style={styles.avatarEmoji}>{copil.avatar}</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}>

        {/* Card progres ciclu */}
        <View style={styles.cycleCard}>
          <Text style={styles.cycleTitle}>Ciclul curent</Text>
          <Text style={styles.cycleSub}>Ziua {copil.cycleDay} din {copil.cycleDays}</Text>
          <View style={styles.circleBig}>
            <Text style={styles.circlePct}>{copil.cycleProgress}%</Text>
            <Text style={styles.circleLabel}>completat</Text>
          </View>
          <View style={styles.cycleProgressBar}>
            <View style={[styles.cycleProgressFill, { width: `${copil.cycleProgress}%` }]} />
            <View style={styles.targetLine} />
          </View>
          <View style={styles.cycleLabels}>
            <Text style={styles.cycleLabelText}>0%</Text>
            <Text style={[styles.cycleLabelText, { color: COLORS.primary, fontWeight: '800' }]}>
              {copil.cycleProgress}% acum
            </Text>
            <Text style={[styles.cycleLabelText, { color: COLORS.secondary }]}>85% 🎯</Text>
          </View>
        </View>

        {/* Grafic săptămânal */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>📅 Activitate săptămâna aceasta</Text>
          <View style={styles.barsRow}>
            {zileSaptamana.map((z, i) => (
              <View key={i} style={styles.barCol}>
                <View style={styles.barContainer}>
                  <View style={[styles.bar, {
                    height: z.val === 0 ? 4 : (z.val / maxVal) * 60,
                    backgroundColor: z.val >= 85 ? COLORS.secondary : z.val > 0 ? COLORS.primary : COLORS.border,
                  }]} />
                </View>
                <Text style={styles.barDay}>{z.zi}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Badge-uri */}
        <Text style={styles.sectionTitle}>🏅 Badge-uri câștigate</Text>
        <View style={styles.badgesRow}>
          {[
            { icon: '🔥', name: '5 zile la rând', earned: true },
            { icon: '⭐', name: '120 stele', earned: true },
            { icon: '📚', name: 'Super cititor', earned: true },
            { icon: '🏆', name: 'Campion', earned: false },
          ].map((b, i) => (
            <View key={i} style={[styles.badgeCard, !b.earned && { opacity: 0.4 }]}>
              <Text style={styles.badgeIcon}>{b.icon}</Text>
              <Text style={styles.badgeName}>{b.name}</Text>
            </View>
          ))}
        </View>

        {/* Buton vezi recompensa */}
        <TouchableOpacity
          style={styles.rewardBtn}
          onPress={() => navigation.navigate('Reward', { copil })}
        >
          <Text style={styles.rewardBtnText}>🎁 Vezi recompensa: {copil.rewardName}</Text>
        </TouchableOpacity>

      </ScrollView>

      <BottomNav active="progress" navigation={navigation} />
    </SafeAreaView>
  );
}

// ============================================
// REWARD SCREEN - Ecranul de recompensă
// Date din: Rewards, EvaluationReports
// ============================================
export function RewardScreen({ navigation, route }) {
  const copil = route?.params?.copil || DEMO_COPII[0];
  const castigat = copil.cycleProgress >= 85;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: castigat ? COLORS.primary : COLORS.background }]}>
      <ScrollView contentContainerStyle={styles.rewardScroll}>

        {castigat ? (
          // ===== A câștigat recompensa =====
          <>
            <Text style={styles.confetti}>🎊 🎉 🎊</Text>
            <Text style={styles.rewardBigEmoji}>🚲</Text>
            <Text style={styles.rewardCongrats}>Felicitări, {copil.firstName}!</Text>
            <Text style={styles.rewardWon}>Ai câștigat {copil.rewardName}!</Text>
            <View style={styles.rewardStats}>
              <Text style={styles.rewardStatText}>
                Ai completat <Text style={{ fontWeight: '800', color: COLORS.accent }}>{copil.cycleProgress}%</Text> din taskuri în {copil.cycleDays} zile.
              </Text>
              <Text style={styles.rewardStatSub}>Ești un adevărat campion! 🏆</Text>
            </View>
            <TouchableOpacity style={styles.claimBtn}>
              <Text style={styles.claimBtnText}>🎁 Revendică recompensa</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.backBtnWhite}
              onPress={() => navigation.navigate('Dashboard')}
            >
              <Text style={styles.backBtnWhiteText}>Înapoi la dashboard</Text>
            </TouchableOpacity>
          </>
        ) : (
          // ===== Nu a câștigat încă =====
          <>
            <Text style={{ fontSize: 72, textAlign: 'center', marginBottom: 16 }}>⏳</Text>
            <Text style={styles.notYetTitle}>Mai ai de lucrat!</Text>
            <Text style={styles.notYetSub}>
              {copil.firstName} e la {copil.cycleProgress}% din {copil.cycleDays} zile. Mai are nevoie de {85 - copil.cycleProgress}% pentru a câștiga:
            </Text>
            <View style={styles.rewardPreviewCard}>
              <Text style={{ fontSize: 48 }}>🎁</Text>
              <Text style={styles.rewardPreviewName}>{copil.rewardName}</Text>
            </View>
            <View style={styles.notYetBar}>
              <View style={[styles.notYetFill, { width: `${copil.cycleProgress}%` }]} />
              <View style={styles.notYetTarget} />
            </View>
            <Text style={styles.notYetPcts}>{copil.cycleProgress}% / 85% țintă</Text>
            <TouchableOpacity
              style={[styles.claimBtn, { backgroundColor: COLORS.primary }]}
              onPress={() => navigation.navigate('Tasks', { copil })}
            >
              <Text style={styles.claimBtnText}>📋 Continuă taskurile</Text>
            </TouchableOpacity>
          </>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

// ============================================
// BOTTOM NAVIGATION - componentă reutilizabilă
// ============================================
function BottomNav({ active, navigation }) {
  const items = [
    { key: 'home', icon: '🏠', label: 'Acasă', screen: 'Dashboard' },
    { key: 'tasks', icon: '📋', label: 'Taskuri', screen: 'Tasks' },
    { key: 'progress', icon: '📊', label: 'Progres', screen: 'Progress' },
    { key: 'reward', icon: '🏆', label: 'Premii', screen: 'Reward' },
  ];
  return (
    <View style={styles.bottomNav}>
      {items.map(item => (
        <TouchableOpacity
          key={item.key}
          style={styles.navItem}
          onPress={() => navigation.navigate(item.screen)}
        >
          <Text style={styles.navIcon}>{item.icon}</Text>
          <Text style={[styles.navLabel, active === item.key && { color: COLORS.primary, fontWeight: '800' }]}>
            {item.label}
          </Text>
          {active === item.key && <View style={styles.navDot} />}
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  // Header
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 28,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  salut: { color: 'rgba(255,255,255,0.8)', fontSize: FONTS.small },
  numeParinte: { color: 'white', fontSize: FONTS.title, fontWeight: '800' },
  notifBtn: { width: 42, height: 42, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  notifIcon: { fontSize: 20 },
  notifBadge: { position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.error },

  body: { paddingHorizontal: 20, paddingBottom: 100, paddingTop: 8 },

  // Summary
  summaryRow: { flexDirection: 'row', gap: 10, marginBottom: 20, marginTop: 16 },
  summaryCard: {
    flex: 1, backgroundColor: COLORS.card, borderRadius: RADIUS.medium,
    padding: 12, borderLeftWidth: 4,
    elevation: 2, shadowColor: COLORS.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 4,
  },
  summaryVal: { fontSize: FONTS.large, fontWeight: '800', color: COLORS.textDark },
  summaryLabel: { fontSize: 10, color: COLORS.textLight, fontWeight: '600', marginTop: 2 },

  sectionTitle: { fontSize: FONTS.medium, fontWeight: '800', color: COLORS.textDark, marginBottom: 12, marginTop: 8 },

  // Child card
  childCard: {
    backgroundColor: COLORS.card, borderRadius: RADIUS.large,
    padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center',
    elevation: 3, shadowColor: COLORS.shadow, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 1, shadowRadius: 8,
  },
  childLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarBox: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: COLORS.cardWarm, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: COLORS.primaryLight,
  },
  avatarEmoji: { fontSize: 28 },
  childName: { fontSize: FONTS.medium, fontWeight: '800', color: COLORS.textDark },
  childAge: { fontSize: FONTS.small, color: COLORS.textMedium, marginTop: 2 },
  rewardTag: {
    backgroundColor: COLORS.accentLight, borderRadius: RADIUS.full,
    paddingHorizontal: 8, paddingVertical: 2, marginTop: 4, alignSelf: 'flex-start',
  },
  rewardTagText: { fontSize: 10, fontWeight: '700', color: COLORS.textDark },
  childRight: { alignItems: 'flex-end', minWidth: 70 },
  progressPct: { fontSize: FONTS.large, fontWeight: '800', color: COLORS.primary },
  progressBarSmall: { width: 70, height: 6, backgroundColor: COLORS.border, borderRadius: 3, overflow: 'hidden', marginVertical: 4 },
  progressFillSmall: { height: '100%', borderRadius: 3 },
  progressTarget: { fontSize: 9, color: COLORS.textLight },

  addChildBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderWidth: 2, borderColor: COLORS.primary, borderStyle: 'dashed',
    borderRadius: RADIUS.large, paddingVertical: 14, marginBottom: 20,
  },
  addChildIcon: { fontSize: 20 },
  addChildText: { fontSize: FONTS.body, fontWeight: '700', color: COLORS.primary },

  quickRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  quickBtn: { flex: 1, alignItems: 'center' },
  quickIcon: { width: 54, height: 54, borderRadius: RADIUS.medium, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  quickLabel: { fontSize: 11, fontWeight: '700', color: COLORS.textMedium },

  // Progress card
  progressCardBig: {
    backgroundColor: COLORS.card, borderRadius: RADIUS.large, padding: 16,
    marginBottom: 16, marginTop: 8,
    elevation: 3, shadowColor: COLORS.shadow, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 1, shadowRadius: 8,
  },
  progressCardRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  progressCardTitle: { fontSize: FONTS.medium, fontWeight: '800', color: COLORS.textDark },
  progressCardPct: { fontSize: FONTS.body, fontWeight: '700', color: COLORS.primary },
  progressBarBig: { height: 12, backgroundColor: COLORS.border, borderRadius: 6, overflow: 'hidden', marginBottom: 8 },
  progressFillBig: { height: '100%', borderRadius: 6, backgroundColor: COLORS.primary },
  progressCardSub: { fontSize: FONTS.small, color: COLORS.textMedium },

  // Task card
  taskCard: {
    backgroundColor: COLORS.card, borderRadius: RADIUS.medium,
    padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 12,
    elevation: 2, shadowColor: COLORS.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 4,
  },
  taskCardDone: { opacity: 0.65 },
  taskCheck: {
    width: 28, height: 28, borderRadius: 14,
    borderWidth: 2, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  taskCheckDone: { backgroundColor: COLORS.secondary, borderColor: COLORS.secondary },
  taskTitle: { fontSize: FONTS.body, fontWeight: '700', color: COLORS.textDark },
  taskTitleDone: { textDecorationLine: 'line-through', color: COLORS.textLight },
  taskCategory: { fontSize: FONTS.small, color: COLORS.textMedium, marginTop: 2 },
  taskPoints: { backgroundColor: COLORS.accentLight, borderRadius: RADIUS.full, paddingHorizontal: 8, paddingVertical: 3 },
  taskPointsText: { fontSize: 11, fontWeight: '800', color: COLORS.textDark },

  // Cycle card
  cycleCard: {
    backgroundColor: COLORS.card, borderRadius: RADIUS.large, padding: 20,
    marginBottom: 16, alignItems: 'center',
    elevation: 3, shadowColor: COLORS.shadow, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 1, shadowRadius: 8,
  },
  cycleTitle: { fontSize: FONTS.large, fontWeight: '800', color: COLORS.textDark },
  cycleSub: { fontSize: FONTS.small, color: COLORS.textMedium, marginTop: 2, marginBottom: 16 },
  circleBig: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: COLORS.primary + '18', borderWidth: 6, borderColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  circlePct: { fontSize: FONTS.title, fontWeight: '800', color: COLORS.primary },
  circleLabel: { fontSize: 10, color: COLORS.textMedium },
  cycleProgressBar: { width: '100%', height: 12, backgroundColor: COLORS.border, borderRadius: 6, overflow: 'hidden', position: 'relative' },
  cycleProgressFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 6 },
  targetLine: { position: 'absolute', left: '85%', top: 0, bottom: 0, width: 3, backgroundColor: COLORS.secondary },
  cycleLabels: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 6 },
  cycleLabelText: { fontSize: 11, color: COLORS.textLight, fontWeight: '600' },

  // Chart
  chartCard: {
    backgroundColor: COLORS.card, borderRadius: RADIUS.large, padding: 16,
    marginBottom: 16,
    elevation: 2, shadowColor: COLORS.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 4,
  },
  chartTitle: { fontSize: FONTS.body, fontWeight: '800', color: COLORS.textDark, marginBottom: 12 },
  barsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 80 },
  barCol: { flex: 1, alignItems: 'center' },
  barContainer: { height: 64, justifyContent: 'flex-end', width: '100%', alignItems: 'center' },
  bar: { width: '70%', borderRadius: 4 },
  barDay: { fontSize: 10, color: COLORS.textLight, marginTop: 4, fontWeight: '600' },

  // Badges
  badgesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  badgeCard: {
    flex: 1, minWidth: '45%', backgroundColor: COLORS.card,
    borderRadius: RADIUS.medium, padding: 12, alignItems: 'center',
    elevation: 2, shadowColor: COLORS.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 4,
  },
  badgeIcon: { fontSize: 28, marginBottom: 4 },
  badgeName: { fontSize: 11, fontWeight: '700', color: COLORS.textMedium, textAlign: 'center' },

  rewardBtn: {
    backgroundColor: COLORS.accent, borderRadius: RADIUS.full, height: 54,
    alignItems: 'center', justifyContent: 'center',
    elevation: 3, shadowColor: COLORS.accent, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.4, shadowRadius: 6,
  },
  rewardBtnText: { fontSize: FONTS.body, fontWeight: '800', color: COLORS.textDark },

  // Reward screen
  rewardScroll: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  confetti: { fontSize: 36, marginBottom: 8, letterSpacing: 8 },
  rewardBigEmoji: { fontSize: 90, textAlign: 'center', marginBottom: 12 },
  rewardCongrats: { fontSize: FONTS.hero, fontWeight: '800', color: 'white', textAlign: 'center' },
  rewardWon: { fontSize: FONTS.large, fontWeight: '800', color: COLORS.accent, textAlign: 'center', marginTop: 4 },
  rewardStats: {
    backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: RADIUS.large,
    padding: 16, marginVertical: 20, alignItems: 'center',
  },
  rewardStatText: { fontSize: FONTS.body, color: 'white', textAlign: 'center', lineHeight: 22 },
  rewardStatSub: { fontSize: FONTS.medium, color: 'white', fontWeight: '700', marginTop: 6 },
  claimBtn: {
    backgroundColor: 'white', borderRadius: RADIUS.full, height: 54, paddingHorizontal: 32,
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
    elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8,
  },
  claimBtnText: { fontSize: FONTS.medium, fontWeight: '800', color: COLORS.primary },
  backBtnWhite: { paddingVertical: 10 },
  backBtnWhiteText: { color: 'rgba(255,255,255,0.8)', fontSize: FONTS.body, fontWeight: '600' },

  notYetTitle: { fontSize: FONTS.hero, fontWeight: '800', color: COLORS.textDark, textAlign: 'center', marginBottom: 8 },
  notYetSub: { fontSize: FONTS.body, color: COLORS.textMedium, textAlign: 'center', lineHeight: 22, marginBottom: 16 },
  rewardPreviewCard: {
    backgroundColor: COLORS.accentLight, borderRadius: RADIUS.large, padding: 20,
    alignItems: 'center', marginBottom: 16, width: '100%',
  },
  rewardPreviewName: { fontSize: FONTS.title, fontWeight: '800', color: COLORS.textDark, marginTop: 8 },
  notYetBar: {
    width: '100%', height: 16, backgroundColor: COLORS.border,
    borderRadius: 8, overflow: 'hidden', marginBottom: 8, position: 'relative',
  },
  notYetFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 8 },
  notYetTarget: { position: 'absolute', left: '85%', top: 0, bottom: 0, width: 3, backgroundColor: COLORS.secondary },
  notYetPcts: { fontSize: FONTS.small, color: COLORS.textMedium, fontWeight: '700', marginBottom: 20 },

  // Bottom Nav
  bottomNav: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: COLORS.card, flexDirection: 'row',
    paddingVertical: 10, paddingBottom: 20,
    borderTopWidth: 1, borderTopColor: COLORS.border,
    elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.08, shadowRadius: 8,
  },
  navItem: { flex: 1, alignItems: 'center', position: 'relative' },
  navIcon: { fontSize: 22 },
  navLabel: { fontSize: 10, color: COLORS.textLight, fontWeight: '600', marginTop: 2 },
  navDot: {
    position: 'absolute', bottom: -10, width: 5, height: 5,
    borderRadius: 2.5, backgroundColor: COLORS.primary,
  },
});