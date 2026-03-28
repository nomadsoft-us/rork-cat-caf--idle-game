import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useGame } from "@/providers/GameProvider";
import { Heart, Battery, Smile, Calendar, X } from "lucide-react-native";

const formatAge = (age: number): string => {
  const totalMinutes = Math.floor(age * 5); // 1 day = 5 minutes
  const days = Math.floor(totalMinutes / 5);
  const minutes = totalMinutes % 5;
  
  if (days > 0) {
    return `${days}d ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
};

export default function CatDetailsModal() {
  const { id } = useLocalSearchParams();
  const { gameState, feedCat, playCat, renameCat } = useGame();
  
  const cat = gameState.cats.find(c => c.id === id);
  
  if (!cat) {
    return null;
  }

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={true}
      onRequestClose={() => router.back()}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => router.back()}
          >
            <X size={24} color="#666" />
          </TouchableOpacity>

          <View style={[styles.catAvatar, { backgroundColor: cat.color }]}>
            <Text style={styles.catEmoji}>🐱</Text>
          </View>

          <Text style={styles.catName}>{cat.name}</Text>
          <Text style={styles.catPersonality}>{cat.personality}</Text>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Heart size={20} color="#E91E63" />
              <Text style={styles.statValue}>{cat.health.toFixed(1)}%</Text>
              <Text style={styles.statLabel}>Health</Text>
              <View style={styles.statBar}>
                <View style={[styles.statFill, { width: `${cat.health.toFixed(1)}%`, backgroundColor: "#E91E63" }]} />
              </View>
            </View>

            <View style={styles.statCard}>
              <Smile size={20} color="#FFD700" />
              <Text style={styles.statValue}>{cat.happiness.toFixed(1)}%</Text>
              <Text style={styles.statLabel}>Happiness</Text>
              <View style={styles.statBar}>
                <View style={[styles.statFill, { width: `${cat.happiness.toFixed(1)}%`, backgroundColor: "#FFD700" }]} />
              </View>
            </View>

            <View style={styles.statCard}>
              <Battery size={20} color="#4CAF50" />
              <Text style={styles.statValue}>{cat.energy.toFixed(1)}%</Text>
              <Text style={styles.statLabel}>Energy</Text>
              <View style={styles.statBar}>
                <View style={[styles.statFill, { width: `${cat.energy.toFixed(1)}%`, backgroundColor: "#4CAF50" }]} />
              </View>
            </View>

            <View style={styles.statCard}>
              <Calendar size={20} color="#9C27B0" />
              <Text style={styles.statValue}>{formatAge(cat.age)}</Text>
              <Text style={styles.statLabel}>Age</Text>
            </View>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>Current State</Text>
            <Text style={styles.infoText}>{cat.state}</Text>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => feedCat(cat.id)}
            >
              <Text style={styles.actionIcon}>🍽️</Text>
              <Text style={styles.actionText}>Feed</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => playCat(cat.id)}
            >
              <Text style={styles.actionIcon}>🎾</Text>
              <Text style={styles.actionText}>Play</Text>
            </TouchableOpacity>

            {cat.adoptable && (
              <TouchableOpacity
                style={[styles.actionButton, styles.adoptButton]}
                onPress={() => router.push(`/adopt/${cat.id}`)}
              >
                <Text style={styles.actionIcon}>🏠</Text>
                <Text style={styles.actionText}>Adopt</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFF8F0",
    borderRadius: 24,
    padding: 24,
    margin: 20,
    width: "90%",
    maxWidth: 400,
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    padding: 8,
  },
  catAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  catEmoji: {
    fontSize: 50,
  },
  catName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginTop: 16,
  },
  catPersonality: {
    fontSize: 16,
    color: "#666",
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 24,
    width: "100%",
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  statBar: {
    width: "100%",
    height: 4,
    backgroundColor: "#E0E0E0",
    borderRadius: 2,
    marginTop: 4,
  },
  statFill: {
    height: "100%",
    borderRadius: 2,
  },
  infoSection: {
    width: "100%",
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 4,
  },
  infoText: {
    fontSize: 16,
    color: "#333",
    textTransform: "capitalize",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  actionButton: {
    backgroundColor: "#8B4513",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  adoptButton: {
    backgroundColor: "#4CAF50",
  },
  actionIcon: {
    fontSize: 20,
  },
  actionText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 14,
  },
});