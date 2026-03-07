// ============================================
// REWARD SCREEN
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

export default function RewardScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const copil = params.copil ? JSON.parse(params.copil) : DEMO_COPIL;
  const castigat = copil.cycleProgress >= 85;

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: castigat ? COLORS.primary : COLORS.background },
      ]}
    >
      <ScrollView contentContainerStyle={styles.rewardScroll}>
        {castigat ? (
          <>
            <Ionicons
              name="sparkles-outline"
              size={48}
              color={COLORS.accent}
              style={{ marginBottom: 8 }}
            />
            <Ionicons
              name="trophy-outline"
              size={90}
              color="white"
              style={{ marginBottom: 12 }}
            />
            <Text style={styles.rewardCongrats}>
              Felicitări, {copil.firstName}!
            </Text>
            <Text style={styles.rewardWon}>
              Ai câștigat {copil.rewardName}!
            </Text>
            <View style={styles.rewardStats}>
              <Text style={styles.rewardStatText}>
                Ai completat{" "}
                <Text style={{ fontWeight: "800", color: COLORS.accent }}>
                  {copil.cycleProgress}%
                </Text>{" "}
                din taskuri în {copil.cycleDays} zile.
              </Text>
              <Text style={styles.rewardStatSub}>
                Ești un adevărat campion!
              </Text>
            </View>
            <TouchableOpacity style={styles.claimBtn}>
              <Ionicons name="gift-outline" size={20} color={COLORS.primary} />
              <Text style={styles.claimBtnText}> Revendică recompensa</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.backBtnWhite}
              onPress={() => router.push("/Dashboard")}
            >
              <Text style={styles.backBtnWhiteText}>Înapoi la dashboard</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Ionicons
              name="time-outline"
              size={72}
              color={COLORS.primary}
              style={{ marginBottom: 16 }}
            />
            <Text style={styles.notYetTitle}>Mai ai de lucrat!</Text>
            <Text style={styles.notYetSub}>
              {copil.firstName} e la {copil.cycleProgress}% din{" "}
              {copil.cycleDays} zile. Mai are nevoie de{" "}
              {85 - copil.cycleProgress}% pentru a câștiga:
            </Text>
            <View style={styles.rewardPreviewCard}>
              <Ionicons name="gift-outline" size={48} color={COLORS.primary} />
              <Text style={styles.rewardPreviewName}>{copil.rewardName}</Text>
            </View>
            <View style={styles.notYetBar}>
              <View
                style={[
                  styles.notYetFill,
                  { width: `${copil.cycleProgress}%` },
                ]}
              />
              <View style={styles.notYetTarget} />
            </View>
            <Text style={styles.notYetPcts}>
              {copil.cycleProgress}% / 85% țintă
            </Text>
            <TouchableOpacity
              style={[styles.claimBtn, { backgroundColor: COLORS.primary }]}
              onPress={() =>
                router.push({
                  pathname: "/Tasks",
                  params: { copil: JSON.stringify(copil) },
                })
              }
            >
              <Ionicons name="clipboard-outline" size={20} color="white" />
              <Text style={[styles.claimBtnText, { color: "white" }]}>
                {" "}
                Continuă taskurile
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      <BottomNav active="reward" copil={copil} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  rewardScroll: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  rewardCongrats: {
    fontSize: FONTS.hero,
    fontWeight: "800",
    color: "white",
    textAlign: "center",
  },
  rewardWon: {
    fontSize: FONTS.large,
    fontWeight: "800",
    color: COLORS.accent,
    textAlign: "center",
    marginTop: 4,
  },
  rewardStats: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: RADIUS.large,
    padding: 16,
    marginVertical: 20,
    alignItems: "center",
  },
  rewardStatText: {
    fontSize: FONTS.body,
    color: "white",
    textAlign: "center",
    lineHeight: 22,
  },
  rewardStatSub: {
    fontSize: FONTS.medium,
    color: "white",
    fontWeight: "700",
    marginTop: 6,
  },
  claimBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: RADIUS.full,
    height: 54,
    paddingHorizontal: 32,
    justifyContent: "center",
    marginBottom: 12,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  claimBtnText: {
    fontSize: FONTS.medium,
    fontWeight: "800",
    color: COLORS.primary,
  },
  backBtnWhite: { paddingVertical: 10 },
  backBtnWhiteText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: FONTS.body,
    fontWeight: "600",
  },
  notYetTitle: {
    fontSize: FONTS.hero,
    fontWeight: "800",
    color: COLORS.textDark,
    textAlign: "center",
    marginBottom: 8,
  },
  notYetSub: {
    fontSize: FONTS.body,
    color: COLORS.textMedium,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 16,
  },
  rewardPreviewCard: {
    backgroundColor: COLORS.accentLight,
    borderRadius: RADIUS.large,
    padding: 20,
    alignItems: "center",
    marginBottom: 16,
    width: "100%",
  },
  rewardPreviewName: {
    fontSize: FONTS.title,
    fontWeight: "800",
    color: COLORS.textDark,
    marginTop: 8,
  },
  notYetBar: {
    width: "100%",
    height: 16,
    backgroundColor: COLORS.border,
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 8,
    position: "relative",
  },
  notYetFill: {
    height: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  notYetTarget: {
    position: "absolute",
    left: "85%",
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: COLORS.secondary,
  },
  notYetPcts: {
    fontSize: FONTS.small,
    color: COLORS.textMedium,
    fontWeight: "700",
    marginBottom: 20,
  },
});
