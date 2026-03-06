// ============================================
// WELCOME SCREEN - Prima pagină a aplicației
// ============================================
import { useRouter } from "expo-router";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS, FONTS, RADIUS } from "../constants/colors";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* Fundal decorativ - cercuri */}
      <View style={styles.circleTopRight} />
      <View style={styles.circleBottomLeft} />

      {/* Logo - sus */}
      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>Kinder</Text>
      </View>

      {/* Mijloc - titlu, descriere, butoane */}
      <View style={styles.middleContent}>
        <Text style={styles.title}>Bine ai venit!</Text>
        <Text style={styles.description}>
          O aplicație care ajută părinții să dezvolte responsabilitatea copiilor
          prin taskuri zilnice și recompense motivante.
        </Text>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.btnPrimary}
            onPress={() =>
              router.push({
                pathname: "/AuthScreens",
                params: { screen: "Register" },
              })
            }
          >
            <Text style={styles.btnPrimaryText}>Creare cont</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnSecondary}
            onPress={() =>
              router.push({
                pathname: "/AuthScreens",
                params: { screen: "Login" },
              })
            }
          >
            <Text style={styles.btnSecondaryText}>Autentificare</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  circleTopRight: {
    position: "absolute",
    top: -60,
    right: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: COLORS.primaryLight,
    opacity: 0.3,
  },
  circleBottomLeft: {
    position: "absolute",
    bottom: 100,
    left: -80,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: COLORS.secondaryLight,
    opacity: 0.25,
  },
  logoContainer: {
    alignItems: "center",
    paddingTop: 20,
    paddingHorizontal: 28,
  },
  logoText: {
    fontSize: FONTS.hero,
    fontWeight: "800",
    color: COLORS.primary,
  },
  middleContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    gap: 16,
  },
  title: {
    fontSize: FONTS.hero,
    fontWeight: "800",
    color: COLORS.textDark,
    textAlign: "center",
  },
  description: {
    fontSize: FONTS.body,
    color: COLORS.textMedium,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  buttonsContainer: {
    width: "100%",
    gap: 12,
    marginTop: 16,
  },
  btnPrimary: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
    height: 54,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  btnPrimaryText: {
    color: COLORS.white,
    fontSize: FONTS.medium,
    fontWeight: "800",
  },
  btnSecondary: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: RADIUS.full,
    height: 54,
    alignItems: "center",
    justifyContent: "center",
  },
  btnSecondaryText: {
    color: COLORS.primary,
    fontSize: FONTS.medium,
    fontWeight: "700",
  },
});
