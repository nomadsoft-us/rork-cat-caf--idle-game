import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGame } from "@/providers/GameProvider";
import { ACHIEVEMENTS } from "@/constants/gameData";
import { Trophy, Lock, Check } from "lucide-react-native";

export default function AchievementsScreen() {
  const { gameState } = useGame();

  const getAchievementProgress = (achievement: typeof ACHIEVEMENTS[0]) => {
    switch (achievement.id) {
      case "first_cat":
        return gameState.cats.length > 0;
      case "first_upgrade":
        return Object.values(gameState.upgrades.facilities).some(level => level > 0);
      case "ten_customers":
        return gameState.statistics.totalCustomersServed >= 10;
      case "cat_colony":
        return gameState.cats.length >= 20;
      case "five_star":
        return gameState.reputation >= 100;
      case "millionaire":
        return gameState.statistics.totalMoneyEarned >= 1000000;
      default:
        return false;
    }
  };

  const completedCount = ACHIEVEMENTS.filter(a => getAchievementProgress(a)).length;
  const completionPercentage = (completedCount / ACHIEVEMENTS.length) * 100;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Achievements</Text>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            {completedCount} / {ACHIEVEMENTS.length} Completed
          </Text>
          <View style={styles.progressBar}>
            <View 
              style={[styles.progressFill, { width: `${completionPercentage}%` }]} 
            />
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                ${gameState.statistics.totalMoneyEarned.toFixed(0)}
              </Text>
              <Text style={styles.statLabel}>Total Earned</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {gameState.statistics.totalCustomersServed}
              </Text>
              <Text style={styles.statLabel}>Customers Served</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {gameState.statistics.catsAdopted}
              </Text>
              <Text style={styles.statLabel}>Cats Adopted</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {Math.floor(gameState.statistics.timePlayed / 60)}m
              </Text>
              <Text style={styles.statLabel}>Time Played</Text>
            </View>
          </View>
        </View>

        <View style={styles.achievementsSection}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          {ACHIEVEMENTS.map(achievement => {
            const isCompleted = getAchievementProgress(achievement);
            
            return (
              <View
                key={achievement.id}
                style={[
                  styles.achievementCard,
                  isCompleted && styles.achievementCompleted,
                ]}
              >
                <View style={styles.achievementIcon}>
                  {isCompleted ? (
                    <Trophy size={24} color="#FFD700" />
                  ) : (
                    <Lock size={24} color="#999" />
                  )}
                </View>
                <View style={styles.achievementInfo}>
                  <Text style={[
                    styles.achievementName,
                    isCompleted && styles.achievementNameCompleted,
                  ]}>
                    {achievement.name}
                  </Text>
                  <Text style={styles.achievementDescription}>
                    {achievement.requirement}
                  </Text>
                  {isCompleted && (
                    <Text style={styles.achievementReward}>
                      Reward: ${achievement.reward}
                    </Text>
                  )}
                </View>
                {isCompleted && (
                  <Check size={20} color="#4CAF50" />
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF8F0",
  },
  header: {
    padding: 20,
    backgroundColor: "#8B4513",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFF",
  },
  progressContainer: {
    marginTop: 12,
  },
  progressText: {
    fontSize: 14,
    color: "#FFE4B5",
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 4,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#FFD700",
    borderRadius: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#8B4513",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  achievementsSection: {
    marginBottom: 24,
  },
  achievementCard: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  achievementCompleted: {
    backgroundColor: "#FFF9E6",
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  achievementNameCompleted: {
    color: "#8B4513",
  },
  achievementDescription: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  achievementReward: {
    fontSize: 12,
    color: "#4CAF50",
    marginTop: 4,
    fontWeight: "600",
  },
});