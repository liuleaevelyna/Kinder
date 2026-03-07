// ============================================
// TASKS SCREEN
// ============================================
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
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

export default function TasksScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const copil = params.copil ? JSON.parse(params.copil) : DEMO_COPIL;

  const [taskuri, setTaskuri] = useState([
    {
      id: 1,
      title: "Citește 20 de minute",
      category: "Școală",
      icon: "book-outline",
      points: 10,
      done: true,
    },
    {
      id: 2,
      title: "Strânge jucăriile",
      category: "Ordine",
      icon: "home-outline",
      points: 5,
      done: true,
    },
    {
      id: 3,
      title: "Fă temele la matematică",
      category: "Școală",
      icon: "pencil-outline",
      points: 15,
      done: false,
    },
    {
      id: 4,
      title: "30 min mișcare afară",
      category: "Sport",
      icon: "bicycle-outline",
      points: 10,
      done: false,
    },
    {
      id: 5,
      title: "Ajută la masă",
      category: "Respect",
      icon: "heart-outline",
      points: 8,
      done: false,
    },
    {
      id: 6,
      title: "Doarme la ora 21:00",
      category: "Disciplină",
      icon: "alarm-outline",
      points: 12,
      done: false,
    },
  ]);

  const bifaTask = (id) => {
    setTaskuri((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    );
  };

  const completate = taskuri.filter((t) => t.done).length;
  const total = taskuri.length;
  const procent = Math.round((completate / total) * 100);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back-outline" size={24} color="white" />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.salut}>Taskurile lui</Text>
          <Text style={styles.numeParinte}>{copil.firstName}</Text>
        </View>
        <Ionicons
          name={copil.sex === "M" ? "man-outline" : "woman-outline"}
          size={28}
          color="white"
        />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
      >
        <View style={styles.progressCardBig}>
          <View style={styles.progressCardRow}>
            <Text style={styles.progressCardTitle}>Progres azi</Text>
            <Text style={styles.progressCardPct}>
              {completate}/{total} taskuri
            </Text>
          </View>
          <View style={styles.progressBarBig}>
            <View style={[styles.progressFillBig, { width: `${procent}%` }]} />
          </View>
          <Text style={styles.progressCardSub}>
            {procent}% completat • țintă ciclu: 85%
          </Text>
        </View>

        <View style={styles.sectionRow}>
          <Ionicons name="calendar-outline" size={18} color={COLORS.textDark} />
          <Text style={styles.sectionTitle}>
            {new Date().toLocaleDateString("ro-RO", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </Text>
        </View>

        {taskuri.map((task) => (
          <TouchableOpacity
            key={task.id}
            style={[styles.taskCard, task.done && styles.taskCardDone]}
            onPress={() => bifaTask(task.id)}
          >
            <View style={[styles.taskCheck, task.done && styles.taskCheckDone]}>
              {task.done && (
                <Ionicons name="checkmark" size={14} color="white" />
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={[styles.taskTitle, task.done && styles.taskTitleDone]}
              >
                {task.title}
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                  marginTop: 2,
                }}
              >
                <Ionicons
                  name={task.icon}
                  size={12}
                  color={COLORS.textMedium}
                />
                <Text style={styles.taskCategory}>{task.category}</Text>
              </View>
            </View>
            <View style={styles.taskPoints}>
              <Ionicons name="star-outline" size={11} color={COLORS.textDark} />
              <Text style={styles.taskPointsText}>+{task.points}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <BottomNav active="tasks" copil={copil} />
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
  progressCardBig: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.large,
    padding: 16,
    marginBottom: 16,
    marginTop: 16,
    elevation: 3,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  progressCardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  progressCardTitle: {
    fontSize: FONTS.medium,
    fontWeight: "800",
    color: COLORS.textDark,
  },
  progressCardPct: {
    fontSize: FONTS.body,
    fontWeight: "700",
    color: COLORS.primary,
  },
  progressBarBig: {
    height: 12,
    backgroundColor: COLORS.border,
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFillBig: {
    height: "100%",
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
  progressCardSub: { fontSize: FONTS.small, color: COLORS.textMedium },
  taskCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.medium,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },
  taskCardDone: { opacity: 0.65 },
  taskCheck: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  taskCheckDone: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  taskTitle: {
    fontSize: FONTS.body,
    fontWeight: "700",
    color: COLORS.textDark,
  },
  taskTitleDone: {
    textDecorationLine: "line-through",
    color: COLORS.textLight,
  },
  taskCategory: { fontSize: FONTS.small, color: COLORS.textMedium },
  taskPoints: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.accentLight,
    borderRadius: RADIUS.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  taskPointsText: { fontSize: 11, fontWeight: "800", color: COLORS.textDark },
});
