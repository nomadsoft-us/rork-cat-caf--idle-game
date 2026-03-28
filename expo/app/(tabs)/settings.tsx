import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGame } from "@/providers/GameProvider";
import { Volume2, Bell, Save, RotateCcw, Info, Heart } from "lucide-react-native";

export default function SettingsScreen() {
  const { gameState, saveGame, resetGame, toggleSound, toggleNotifications } = useGame();

  const handleReset = () => {
    Alert.alert(
      "Reset Game",
      "Are you sure you want to reset all progress? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Reset", 
          style: "destructive",
          onPress: () => resetGame(),
        },
      ]
    );
  };

  const handleSave = async () => {
    await saveGame();
    Alert.alert("Game Saved", "Your progress has been saved successfully!");
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Game Settings</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Volume2 size={20} color="#666" />
              <Text style={styles.settingLabel}>Sound Effects</Text>
            </View>
            <Switch
              value={gameState.settings.soundEnabled}
              onValueChange={toggleSound}
              trackColor={{ false: "#CCC", true: "#8B4513" }}
              thumbColor="#FFF"
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Bell size={20} color="#666" />
              <Text style={styles.settingLabel}>Notifications</Text>
            </View>
            <Switch
              value={gameState.settings.notificationsEnabled}
              onValueChange={toggleNotifications}
              trackColor={{ false: "#CCC", true: "#8B4513" }}
              thumbColor="#FFF"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Save & Data</Text>
          
          <TouchableOpacity style={styles.button} onPress={handleSave}>
            <Save size={20} color="#FFF" />
            <Text style={styles.buttonText}>Save Game</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.buttonDanger]} 
            onPress={handleReset}
          >
            <RotateCcw size={20} color="#FFF" />
            <Text style={styles.buttonText}>Reset Progress</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          
          <View style={styles.infoCard}>
            <Info size={20} color="#8B4513" />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Cat Café Idle</Text>
              <Text style={styles.infoText}>Version 1.0.0</Text>
              <Text style={styles.infoText}>
                Manage your dream cat café! Serve coffee, care for cats, and create
                the purrfect environment for both felines and customers.
              </Text>
            </View>
          </View>

          <View style={styles.creditsCard}>
            <Heart size={20} color="#E91E63" />
            <Text style={styles.creditsText}>
              Made with love for cat and coffee enthusiasts
            </Text>
          </View>
        </View>

        <View style={styles.gameInfo}>
          <Text style={styles.gameInfoTitle}>Game Stats</Text>
          <Text style={styles.gameInfoText}>
            Prestige Level: {gameState.prestigeLevel}
          </Text>
          <Text style={styles.gameInfoText}>
            Play Time: {Math.floor(gameState.statistics.timePlayed / 60)} minutes
          </Text>
          <Text style={styles.gameInfoText}>
            Total Cats Adopted: {gameState.statistics.catsAdopted}
          </Text>
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
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  settingLabel: {
    fontSize: 16,
    color: "#333",
  },
  button: {
    flexDirection: "row",
    backgroundColor: "#4CAF50",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 12,
  },
  buttonDanger: {
    backgroundColor: "#F44336",
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  infoCard: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    gap: 12,
    marginBottom: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  creditsCard: {
    flexDirection: "row",
    backgroundColor: "#FFE4E1",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    gap: 12,
  },
  creditsText: {
    flex: 1,
    fontSize: 14,
    color: "#666",
  },
  gameInfo: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  gameInfoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  gameInfoText: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
});