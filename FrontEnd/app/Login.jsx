import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS, FONTS, RADIUS } from "../constants/colors";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [parola, setParola] = useState("");
  const [aratParola, setAratParola] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erori, setErori] = useState({});

  const handleLogin = async () => {
    let e = {};
    if (!email.includes("@")) e.email = "Email invalid";
    if (!parola) e.parola = "Parola este obligatorie";
    setErori(e);
    if (Object.keys(e).length > 0) return;

    setLoading(true);

    // ================================================
    // COD REAL - decommenteaza cand backul e gata
    // si inlocuieste IP_BACKEND cu ip-ul primit
    // ================================================
    // try {
    //   const res = await fetch("http://IP_BACKEND:3000/api/login", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({ email, password: parola }),
    //   });
    //   const data = await res.json();
    //   if (res.ok) {
    //     router.replace({
    //       pathname: "/MainScreens",
    //       params: { parinte: JSON.stringify(data.parinte) },
    //     });
    //   } else {
    //     Alert.alert("Eroare", data.mesaj || "Email sau parolă greșită");
    //   }
    // } catch {
    //   Alert.alert("Eroare", "Nu mă pot conecta la server");
    // } finally {
    //   setLoading(false);
    // }

    // ================================================
    // ILUZIE TEMPORARA - sterge blocul asta
    // cand decommentezi codul real de mai sus
    // ================================================
    await new Promise((resolve) => setTimeout(resolve, 1000));
    router.replace({
      pathname: "/MainScreens",
      params: {
        parinte: JSON.stringify({
          id_parent: 1,
          first_name: "Maria",
          last_name: "Popescu",
          email: email,
        }),
      },
    });
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.logo}>Kinder</Text>
            <Text style={styles.title}>Bun venit!</Text>
            <Text style={styles.subtitle}>Intră în contul tău de părinte</Text>
          </View>

          <View style={styles.card}>
            <CampInput
              label="Email"
              placeholder="adresa@email.com"
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                setErori({ ...erori, email: null });
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              eroare={erori.email}
            />
            <CampInput
              label="Parolă"
              placeholder="parola ta"
              value={parola}
              onChangeText={(t) => {
                setParola(t);
                setErori({ ...erori, parola: null });
              }}
              secureTextEntry={!aratParola}
              eroare={erori.parola}
              iconDreapta={
                <TouchableOpacity onPress={() => setAratParola(!aratParola)}>
                  <Ionicons
                    name={aratParola ? "eye-off-outline" : "eye-outline"}
                    size={22}
                    color={COLORS.textLight}
                  />
                </TouchableOpacity>
              }
            />

            <TouchableOpacity style={styles.linkRow}>
              <Text style={[styles.link, { textAlign: "right" }]}>
                Ai uitat parola?
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btnPrimary, loading && { opacity: 0.7 }]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.btnText}>Intră în cont →</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/Register")}
              style={styles.linkRow}
            >
              <Text style={styles.linkText}>
                Nu ai cont? <Text style={styles.link}>Creează unul</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function CampInput({ label, icon, iconDreapta, eroare, ...props }) {
  return (
    <View style={styles.campContainer}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputBox, eroare && styles.inputEroare]}>
        <Text style={styles.inputIcon}>{icon}</Text>
        <TextInput
          style={styles.input}
          placeholderTextColor={COLORS.textLight}
          autoCorrect={false}
          {...props}
        />
        {iconDreapta}
      </View>
      {eroare && <Text style={styles.eroare}>⚠️ {eroare}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { paddingHorizontal: 24, paddingBottom: 32 },
  header: { alignItems: "center", paddingTop: 32, marginBottom: 24 },
  logo: {
    fontSize: FONTS.hero,
    fontWeight: "800",
    color: COLORS.primary,
    marginBottom: 12,
  },
  title: {
    fontSize: FONTS.hero,
    fontWeight: "800",
    color: COLORS.textDark,
    marginBottom: 4,
  },
  subtitle: { fontSize: FONTS.body, color: COLORS.textMedium },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.large,
    padding: 24,
    elevation: 4,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
  },
  campContainer: { marginBottom: 16 },
  label: {
    fontSize: FONTS.small,
    fontWeight: "700",
    color: COLORS.textDark,
    marginBottom: 6,
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.medium,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    height: 52,
  },
  inputEroare: { borderColor: COLORS.error, backgroundColor: "#FFF5F5" },
  inputIcon: { fontSize: 18, marginRight: 10 },
  input: { flex: 1, fontSize: FONTS.body, color: COLORS.textDark },
  eroare: {
    color: COLORS.error,
    fontSize: 11,
    fontWeight: "600",
    marginTop: 4,
  },
  link: { color: COLORS.primary, fontWeight: "700" },
  btnPrimary: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
    height: 54,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  btnText: { color: COLORS.white, fontSize: FONTS.medium, fontWeight: "800" },
  linkRow: { alignItems: "center", marginTop: 16 },
  linkText: { fontSize: FONTS.body, color: COLORS.textMedium },
});
