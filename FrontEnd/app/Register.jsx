import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
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

export default function RegisterScreen() {
  const router = useRouter();
  const [nume, setNume] = useState("");
  const [email, setEmail] = useState("");
  const [parola, setParola] = useState("");
  const [confirmaParola, setConfirmaParola] = useState("");
  const [acordPrivacitate, setAcordPrivacitate] = useState(false);
  const [aratParola, setAratParola] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erori, setErori] = useState({});

  const valideaza = () => {
    let e = {};
    if (!nume.trim() || nume.trim().split(" ").length < 2)
      e.nume = "Introdu numele complet (prenume și nume)";
    if (!email.includes("@") || !email.includes(".")) e.email = "Email invalid";
    if (parola.length < 6) e.parola = "Minim 6 caractere";
    if (parola !== confirmaParola) e.confirmaParola = "Parolele nu coincid";
    if (!acordPrivacitate)
      e.acord = "Trebuie să accepți politica de confidențialitate";
    setErori(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!valideaza()) return;
    setLoading(true);
    try {
      const parts = nume.trim().split(" ");
      const firstName = parts[0];
      const lastName = parts.slice(1).join(" ");
      const res = await fetch("http://192.168.1.1:3000/api/Register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, password: parola }),
      });
      const data = await res.json();
      if (res.ok) {
        router.replace({
          pathname: "/AddChildScreen",
          params: { parentId: data.id_parent },
        });
      } else {
        Alert.alert("Eroare", data.mesaj || "Înregistrare eșuată");
      }
    } catch {
      Alert.alert("Eroare", "Nu mă pot conecta la server");
    } finally {
      setLoading(false);
    }
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
            <Text style={styles.title}>Crează cont</Text>
            <Text style={styles.subtitle}>Înregistrează-te ca părinte</Text>
          </View>

          <View style={styles.card}>
            <CampInput
              label="Nume complet"
              placeholder="ex: Maria Popescu"
              value={nume}
              onChangeText={(t) => {
                setNume(t);
                setErori({ ...erori, nume: null });
              }}
              eroare={erori.nume}
            />
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
              placeholder="min. 6 caractere"
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
            <CampInput
              label="Confirmă parola"
              placeholder="repetă parola"
              value={confirmaParola}
              onChangeText={(t) => {
                setConfirmaParola(t);
                setErori({ ...erori, confirmaParola: null });
              }}
              secureTextEntry={!aratParola}
              eroare={erori.confirmaParola}
            />

            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => {
                setAcordPrivacitate(!acordPrivacitate);
                setErori({ ...erori, acord: null });
              }}
            >
              <View
                style={[
                  styles.checkbox,
                  acordPrivacitate && styles.checkboxActiv,
                ]}
              >
                {acordPrivacitate && (
                  <Text style={{ color: "white", fontSize: 10 }}>✓</Text>
                )}
              </View>
              <Text style={styles.checkboxText}>
                Sunt de acord cu{" "}
                <Text style={styles.link}>Politica de Confidențialitate</Text>
              </Text>
            </TouchableOpacity>
            {erori.acord && <Text style={styles.eroare}>{erori.acord}</Text>}

            <TouchableOpacity
              style={[styles.btnPrimary, loading && { opacity: 0.7 }]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.btnText}>Creare cont →</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/Login")}
              style={styles.linkRow}
            >
              <Text style={styles.linkText}>
                Ai deja cont? <Text style={styles.link}>Autentifică-te</Text>
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
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxActiv: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkboxText: { fontSize: FONTS.small, color: COLORS.textMedium, flex: 1 },
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
