// ============================================
// DASHBOARD SCREEN
// ============================================
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { COLORS, FONTS, RADIUS } from "../constants/colors";

const DEMO_PARINTE = { firstName: "Maria", lastName: "Popescu" };
const DEMO_COPII = [
  {
    id_child: 1,
    firstName: "Andrei",
    lastName: "P.",
    age: 8,
    sex: "M",
    cycleProgress: 72,
    cycleDay: 22,
    cycleDays: 30,
    rewardName: "Bicicletă",
  },
  {
    id_child: 2,
    firstName: "Elena",
    lastName: "P.",
    age: 10,
    sex: "F",
    cycleProgress: 91,
    cycleDay: 15,
    cycleDays: 30,
    rewardName: "Tabletă",
  },
];

export default function DashboardScreen() {
  const router = useRouter();
  const parinte = DEMO_PARINTE;
  const copii = DEMO_COPII;
  const ora = new Date().getHours();
  const salut =
    ora < 12 ? "Bună dimineața" : ora < 18 ? "Bună ziua" : "Bună seara";

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.salut}>{salut},</Text>
            <Text style={styles.numeParinte}>{parinte.firstName}!</Text>
          </View>
          <TouchableOpacity style={styles.notifBtn}>
            <Ionicons name="notifications-outline" size={22} color="white" />
            <View style={styles.notifBadge} />
          </TouchableOpacity>
        </View>

        <View style={styles.body}>
          <View style={styles.summaryRow}>
            <View
              style={[styles.summaryCard, { borderLeftColor: COLORS.primary }]}
            >
              <Text style={styles.summaryVal}>{copii.length}</Text>
              <Text style={styles.summaryLabel}>Copii activi</Text>
            </View>
            <View
              style={[
                styles.summaryCard,
                { borderLeftColor: COLORS.secondary },
              ]}
            >
              <Text style={styles.summaryVal}>
                {Math.round(
                  copii.reduce((a, c) => a + c.cycleProgress, 0) / copii.length,
                )}
                %
              </Text>
              <Text style={styles.summaryLabel}>Progres mediu</Text>
            </View>
            <View
              style={[styles.summaryCard, { borderLeftColor: COLORS.accent }]}
            >
              <Text style={styles.summaryVal}>8</Text>
              <Text style={styles.summaryLabel}>Taskuri azi</Text>
            </View>
          </View>

          <View style={styles.sectionRow}>
            <Ionicons name="people-outline" size={20} color={COLORS.textDark} />
            <Text style={styles.sectionTitle}>Copiii tăi</Text>
          </View>

          {copii.map((copil) => (
            <TouchableOpacity
              key={copil.id_child}
              style={styles.childCard}
              onPress={() =>
                router.push({
                  pathname: "/Tasks",
                  params: { copil: JSON.stringify(copil) },
                })
              }
            >
              <View style={styles.childLeft}>
                <View style={styles.avatarBox}>
                  <Ionicons
                    name={copil.sex === "M" ? "man-outline" : "woman-outline"}
                    size={28}
                    color={COLORS.primary}
                  />
                </View>
                <View>
                  <Text style={styles.childName}>
                    {copil.firstName} {copil.lastName}
                  </Text>
                  <Text style={styles.childAge}>
                    {copil.age} ani • Ziua {copil.cycleDay}/{copil.cycleDays}
                  </Text>
                  <View style={styles.rewardTag}>
                    <Ionicons
                      name="gift-outline"
                      size={10}
                      color={COLORS.textDark}
                    />
                    <Text style={styles.rewardTagText}>
                      {" "}
                      {copil.rewardName}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.childRight}>
                <Text style={styles.progressPct}>{copil.cycleProgress}%</Text>
                <View style={styles.progressBarSmall}>
                  <View
                    style={[
                      styles.progressFillSmall,
                      {
                        width: `${copil.cycleProgress}%`,
                        backgroundColor:
                          copil.cycleProgress >= 85
                            ? COLORS.secondary
                            : COLORS.primary,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.progressTarget}>țintă: 85%</Text>
              </View>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={styles.addChildBtn}
            onPress={() => router.push("/AddChildScreen")}
          >
            <Ionicons
              name="add-circle-outline"
              size={22}
              color={COLORS.primary}
            />
            <Text style={styles.addChildText}>Adaugă copil nou</Text>
          </TouchableOpacity>

          <View style={styles.sectionRow}>
            <Ionicons name="flash-outline" size={20} color={COLORS.textDark} />
            <Text style={styles.sectionTitle}>Acțiuni rapide</Text>
          </View>
          <View style={styles.quickRow}>
            {[
              {
                icon: "bar-chart-outline",
                label: "Raport",
                color: COLORS.scoala,
                screen: "/Progress",
              },
              {
                icon: "clipboard-outline",
                label: "Taskuri",
                color: COLORS.secondary,
                screen: "/Tasks",
              },
              {
                icon: "trophy-outline",
                label: "Premii",
                color: COLORS.accent,
                screen: "/Reward",
              },
              {
                icon: "settings-outline",
                label: "Setări",
                color: COLORS.textLight,
                screen: "/Dashboard",
              },
            ].map((item) => (
              <TouchableOpacity
                key={item.label}
                style={styles.quickBtn}
                onPress={() => router.push(item.screen)}
              >
                <View
                  style={[
                    styles.quickIcon,
                    { backgroundColor: item.color + "22" },
                  ]}
                >
                  <Ionicons name={item.icon} size={24} color={item.color} />
                </View>
                <Text style={styles.quickLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <BottomNav active="home" />
    </SafeAreaView>
  );
}

export function BottomNav({ active, copil }) {
  const router = useRouter();
  const copilParam = copil ? JSON.stringify(copil) : null;
  const items = [
    {
      key: "home",
      icon: "home-outline",
      iconActive: "home",
      label: "Acasă",
      screen: "/Dashboard",
    },
    {
      key: "tasks",
      icon: "clipboard-outline",
      iconActive: "clipboard",
      label: "Taskuri",
      screen: "/Tasks",
    },
    {
      key: "progress",
      icon: "bar-chart-outline",
      iconActive: "bar-chart",
      label: "Progres",
      screen: "/Progress",
    },
    {
      key: "reward",
      icon: "trophy-outline",
      iconActive: "trophy",
      label: "Premii",
      screen: "/Reward",
    },
  ];
  return (
    <View style={styles.bottomNav}>
      {items.map((item) => (
        <TouchableOpacity
          key={item.key}
          style={styles.navItem}
          onPress={() =>
            router.push({
              pathname: item.screen,
              params: copilParam ? { copil: copilParam } : {},
            })
          }
        >
          <Ionicons
            name={active === item.key ? item.iconActive : item.icon}
            size={24}
            color={active === item.key ? COLORS.primary : COLORS.textLight}
          />
          <Text
            style={[
              styles.navLabel,
              active === item.key && {
                color: COLORS.primary,
                fontWeight: "800",
              },
            ]}
          >
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
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  salut: { color: "rgba(255,255,255,0.8)", fontSize: FONTS.small },
  numeParinte: { color: "white", fontSize: FONTS.title, fontWeight: "800" },
  notifBtn: {
    width: 42,
    height: 42,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  notifBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.error,
  },
  body: { paddingHorizontal: 20, paddingBottom: 100, paddingTop: 8 },
  summaryRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
    marginTop: 16,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.medium,
    padding: 12,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },
  summaryVal: {
    fontSize: FONTS.large,
    fontWeight: "800",
    color: COLORS.textDark,
  },
  summaryLabel: {
    fontSize: 10,
    color: COLORS.textLight,
    fontWeight: "600",
    marginTop: 2,
  },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: FONTS.medium,
    fontWeight: "800",
    color: COLORS.textDark,
  },
  childCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.large,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    elevation: 3,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  childLeft: { flex: 1, flexDirection: "row", alignItems: "center", gap: 12 },
  avatarBox: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.cardWarm,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: COLORS.primaryLight,
  },
  childName: {
    fontSize: FONTS.medium,
    fontWeight: "800",
    color: COLORS.textDark,
  },
  childAge: { fontSize: FONTS.small, color: COLORS.textMedium, marginTop: 2 },
  rewardTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.accentLight,
    borderRadius: RADIUS.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 4,
    alignSelf: "flex-start",
  },
  rewardTagText: { fontSize: 10, fontWeight: "700", color: COLORS.textDark },
  childRight: { alignItems: "flex-end", minWidth: 70 },
  progressPct: {
    fontSize: FONTS.large,
    fontWeight: "800",
    color: COLORS.primary,
  },
  progressBarSmall: {
    width: 70,
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    overflow: "hidden",
    marginVertical: 4,
  },
  progressFillSmall: { height: "100%", borderRadius: 3 },
  progressTarget: { fontSize: 9, color: COLORS.textLight },
  addChildBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: "dashed",
    borderRadius: RADIUS.large,
    paddingVertical: 14,
    marginBottom: 20,
  },
  addChildText: {
    fontSize: FONTS.body,
    fontWeight: "700",
    color: COLORS.primary,
  },
  quickRow: { flexDirection: "row", justifyContent: "space-between", gap: 10 },
  quickBtn: { flex: 1, alignItems: "center" },
  quickIcon: {
    width: 54,
    height: 54,
    borderRadius: RADIUS.medium,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  quickLabel: { fontSize: 11, fontWeight: "700", color: COLORS.textMedium },
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.card,
    flexDirection: "row",
    paddingVertical: 10,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  navItem: { flex: 1, alignItems: "center", position: "relative" },
  navLabel: {
    fontSize: 10,
    color: COLORS.textLight,
    fontWeight: "600",
    marginTop: 2,
  },
  navDot: {
    position: "absolute",
    bottom: -10,
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: COLORS.primary,
  },
});
