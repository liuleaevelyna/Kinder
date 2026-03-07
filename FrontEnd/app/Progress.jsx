// ============================================
// PROGRESS SCREEN
// ============================================
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { COLORS, FONTS, RADIUS } from "../constants/colors";
import { BottomNav } from "./Dashboard";

const DEMO_COPIL = {
  id_child: 1,
  firstName: "Andrei",
  lastName: "P.",
  age: 8,
  sex: "M",
  cycleProgress: 72,
  cycleDay: 22,
  cycleDays: 30,
  rewardName: "Bicicletă",
};

export default function ProgressScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const copil = params.copil ? JSON.parse(params.copil) : DEMO_COPIL;

  const zileSaptamana = [
    { zi: "L", val: 80 },
    { zi: "M", val: 70 },
    { zi: "Mi", val: 90 },
    { zi: "J", val: 60 },
    { zi: "V", val: 40 },
    { zi: "S", val: 0 },
    { zi: "D", val: 0 },
  ];

  const maxVal = Math.max(...zileSaptamana.map((z) => z.val), 1);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back-outline" size={24} color="white" />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.salut}>Progresul lui</Text>
          <Text style={styles.numeParinte}>{copil.firstName}</Text>
        </View>
        <Ionicons name="bar-chart-outline" size={28} color="white" />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
      >
        <View style={styles.cycleCard}>
          <Text style={styles.cycleTitle}>Ciclul curent</Text>
          <Text style={styles.cycleSub}>
            Ziua {copil.cycleDay} din {copil.cycleDays}
          </Text>
          <View style={styles.circleBig}>
            <Text style={styles.circlePct}>{copil.cycleProgress}%</Text>
            <Text style={styles.circleLabel}>completat</Text>
          </View>
          <View style={styles.cycleProgressBar}>
            <View
              style={[
                styles.cycleProgressFill,
                { width: `${copil.cycleProgress}%` },
              ]}
            />
            <View style={styles.targetLine} />
          </View>
          <View style={styles.cycleLabels}>
            <Text style={styles.cycleLabelText}>0%</Text>
            <Text
              style={[
                styles.cycleLabelText,
                { color: COLORS.primary, fontWeight: "800" },
              ]}
            >
              {copil.cycleProgress}% acum
            </Text>
            <Text style={[styles.cycleLabelText, { color: COLORS.secondary }]}>
              85% țintă
            </Text>
          </View>
        </View>

        <View style={styles.chartCard}>
          <View style={styles.sectionRow}>
            <Ionicons
              name="calendar-outline"
              size={16}
              color={COLORS.textDark}
            />
            <Text style={styles.chartTitle}>Activitate săptămâna aceasta</Text>
          </View>
          <View style={styles.barsRow}>
            {zileSaptamana.map((z, i) => (
              <View key={i} style={styles.barCol}>
                <View style={styles.barContainer}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: z.val === 0 ? 4 : (z.val / maxVal) * 60,
                        backgroundColor:
                          z.val >= 85
                            ? COLORS.secondary
                            : z.val > 0
                              ? COLORS.primary
                              : COLORS.border,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.barDay}>{z.zi}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.sectionRow}>
          <Ionicons name="medal-outline" size={20} color={COLORS.textDark} />
          <Text style={styles.sectionTitle}>Badge-uri câștigate</Text>
        </View>
        <View style={styles.badgesRow}>
          {[
            { icon: "flame-outline", name: "5 zile la rând", earned: true },
            { icon: "star-outline", name: "120 stele", earned: true },
            { icon: "book-outline", name: "Super cititor", earned: true },
            { icon: "trophy-outline", name: "Campion", earned: false },
          ].map((b, i) => (
            <View
              key={i}
              style={[styles.badgeCard, !b.earned && { opacity: 0.4 }]}
            >
              <Ionicons name={b.icon} size={28} color={COLORS.primary} />
              <Text style={styles.badgeName}>{b.name}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.rewardBtn}
          onPress={() =>
            router.push({
              pathname: "/Reward",
              params: { copil: JSON.stringify(copil) },
            })
          }
        >
          <Ionicons name="gift-outline" size={20} color={COLORS.textDark} />
          <Text style={styles.rewardBtnText}>
            {" "}
            Vezi recompensa: {copil.rewardName}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <BottomNav active="progress" copil={copil} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 28,
    flexDirection: "row",
    alignItems: "center",
  },
  salut: { color: "rgba(255,255,255,0.8)", fontSize: FONTS.small },
  numeParinte: { color: "white", fontSize: FONTS.title, fontWeight: "800" },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: FONTS.medium,
    fontWeight: "800",
    color: COLORS.textDark,
  },
  cycleCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.large,
    padding: 20,
    marginBottom: 16,
    marginTop: 16,
    alignItems: "center",
    elevation: 3,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  cycleTitle: {
    fontSize: FONTS.large,
    fontWeight: "800",
    color: COLORS.textDark,
  },
  cycleSub: {
    fontSize: FONTS.small,
    color: COLORS.textMedium,
    marginTop: 2,
    marginBottom: 16,
  },
  circleBig: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primary + "18",
    borderWidth: 6,
    borderColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  circlePct: {
    fontSize: FONTS.title,
    fontWeight: "800",
    color: COLORS.primary,
  },
  circleLabel: { fontSize: 10, color: COLORS.textMedium },
  cycleProgressBar: {
    width: "100%",
    height: 12,
    backgroundColor: COLORS.border,
    borderRadius: 6,
    overflow: "hidden",
    position: "relative",
  },
  cycleProgressFill: {
    height: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: 6,
  },
  targetLine: {
    position: "absolute",
    left: "85%",
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: COLORS.secondary,
  },
  cycleLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 6,
  },
  cycleLabelText: { fontSize: 11, color: COLORS.textLight, fontWeight: "600" },
  chartCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.large,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },
  chartTitle: {
    fontSize: FONTS.body,
    fontWeight: "800",
    color: COLORS.textDark,
    marginBottom: 12,
  },
  barsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 80,
  },
  barCol: { flex: 1, alignItems: "center" },
  barContainer: {
    height: 64,
    justifyContent: "flex-end",
    width: "100%",
    alignItems: "center",
  },
  bar: { width: "70%", borderRadius: 4 },
  barDay: {
    fontSize: 10,
    color: COLORS.textLight,
    marginTop: 4,
    fontWeight: "600",
  },
  badgesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  badgeCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.medium,
    padding: 12,
    alignItems: "center",
    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },
  badgeName: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.textMedium,
    textAlign: "center",
    marginTop: 4,
  },
  rewardBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.full,
    height: 54,
    elevation: 3,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  rewardBtnText: {
    fontSize: FONTS.body,
    fontWeight: "800",
    color: COLORS.textDark,
  },
});
