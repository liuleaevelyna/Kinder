// ============================================
// WELCOME SCREEN - Prima pagină a aplicației
// ============================================
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Dimensions } from 'react-native';
import { COLORS, FONTS, RADIUS } from '../constants/colors';

const { width } = Dimensions.get('window');

export default function WelcomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>

      {/* Fundal decorativ - cercuri */}
      <View style={styles.circleTopRight} />
      <View style={styles.circleBottomLeft} />

      {/* Conținut principal */}
      <View style={styles.content}>

        {/* Logo + Emoji */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoEmoji}>🌟</Text>
          <Text style={styles.logoText}>Kinder</Text>
          <Text style={styles.logoAccent}>App</Text>
        </View>

        {/* Ilustrație centrală */}
        <View style={styles.illustrationBox}>
          <Text style={styles.illustrationEmoji}>👨‍👩‍👧‍👦</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>✅ 85%</Text>
          </View>
        </View>

        {/* Titlu și descriere */}
        <Text style={styles.title}>Bine ai venit!</Text>
        <Text style={styles.description}>
          O aplicație care ajută părinții să dezvolte responsabilitatea copiilor prin taskuri zilnice și recompense motivante.
        </Text>

        {/* Puncte caracteristici */}
        <View style={styles.featuresRow}>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>📋</Text>
            <Text style={styles.featureLabel}>Taskuri</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>📈</Text>
            <Text style={styles.featureLabel}>Progres</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🎁</Text>
            <Text style={styles.featureLabel}>Recompense</Text>
          </View>
        </View>
      </View>

      {/* Butoane */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={styles.btnPrimary}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.btnPrimaryText}>🚀 Creare cont</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnSecondary}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.btnSecondaryText}>Autentificare</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // Decoratiuni fundal
  circleTopRight: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: COLORS.primaryLight,
    opacity: 0.3,
  },
  circleBottomLeft: {
    position: 'absolute',
    bottom: 100,
    left: -80,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: COLORS.secondaryLight,
    opacity: 0.25,
  },

  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingTop: 40,
  },

  // Logo
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  logoEmoji: { fontSize: 28, marginRight: 6 },
  logoText: {
    fontSize: FONTS.hero,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  logoAccent: {
    fontSize: FONTS.hero,
    fontWeight: '800',
    color: COLORS.primary,
  },

  // Ilustratie
  illustrationBox: {
    width: 140,
    height: 140,
    backgroundColor: COLORS.cardWarm,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    borderWidth: 3,
    borderColor: COLORS.primaryLight,
    position: 'relative',
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  illustrationEmoji: { fontSize: 64 },
  badge: {
    position: 'absolute',
    bottom: 8,
    right: 0,
    backgroundColor: COLORS.secondary,
    borderRadius: RADIUS.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: { color: COLORS.white, fontSize: 10, fontWeight: '800' },

  // Text
  title: {
    fontSize: FONTS.hero,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: FONTS.body,
    color: COLORS.textMedium,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
    paddingHorizontal: 8,
  },

  // Features
  featuresRow: {
    flexDirection: 'row',
    gap: 20,
  },
  featureItem: {
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.medium,
    paddingVertical: 12,
    paddingHorizontal: 16,
    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },
  featureIcon: { fontSize: 24, marginBottom: 4 },
  featureLabel: { fontSize: FONTS.small, fontWeight: '700', color: COLORS.textMedium },

  // Butoane
  buttonsContainer: {
    paddingHorizontal: 28,
    paddingBottom: 32,
    gap: 12,
  },
  btnPrimary: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  btnPrimaryText: {
    color: COLORS.white,
    fontSize: FONTS.medium,
    fontWeight: '800',
  },
  btnSecondary: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: RADIUS.full,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSecondaryText: {
    color: COLORS.primary,
    fontSize: FONTS.medium,
    fontWeight: '700',
  },
});