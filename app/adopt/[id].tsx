import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useGame } from "@/providers/GameProvider";
import { X, Heart, DollarSign } from "lucide-react-native";

export default function AdoptCatModal() {
  const { id } = useLocalSearchParams();
  const { gameState, adoptCatOut } = useGame();
  
  const cat = gameState.cats.find(c => c.id === id);
  
  if (!cat || !cat.adoptable) {
    return null;
  }

  const adoptionFee = 50 + (cat.age * 2) + (cat.health * 1.5) + (cat.happiness * 1.2);

  const handleAdopt = () => {
    Alert.alert(
      "Confirm Adoption",
      `Are you sure you want to let ${cat.name} be adopted? You'll receive $${adoptionFee.toFixed(2)}.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: () => {
            adoptCatOut(cat.id);
            router.back();
            router.back(); // Go back twice to close both modals
          },
        },
      ]
    );
  };

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

          <Text style={styles.title}>Adoption Request</Text>
          
          <View style={[styles.catAvatar, { backgroundColor: cat.color }]}>
            <Text style={styles.catEmoji}>🐱</Text>
          </View>

          <Text style={styles.catName}>{cat.name}</Text>
          
          <View style={styles.infoCard}>
            <Heart size={20} color="#E91E63" />
            <Text style={styles.infoText}>
              A loving family wants to adopt {cat.name}!
            </Text>
          </View>

          <View style={styles.feeCard}>
            <DollarSign size={20} color="#4CAF50" />
            <Text style={styles.feeText}>
              Adoption Fee: ${adoptionFee.toFixed(2)}
            </Text>
          </View>

          <Text style={styles.warningText}>
            Once adopted, {cat.name} will leave your café permanently.
          </Text>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => router.back()}
            >
              <Text style={styles.cancelButtonText}>Keep {cat.name}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.confirmButton]}
              onPress={handleAdopt}
            >
              <Text style={styles.confirmButtonText}>Let Them Adopt</Text>
            </TouchableOpacity>
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginTop: 8,
    marginBottom: 20,
  },
  catAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  catEmoji: {
    fontSize: 40,
  },
  catName: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 20,
  },
  infoCard: {
    flexDirection: "row",
    backgroundColor: "#FFE4E1",
    borderRadius: 12,
    padding: 16,
    width: "100%",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: "#666",
  },
  feeCard: {
    flexDirection: "row",
    backgroundColor: "#E8F5E9",
    borderRadius: 12,
    padding: 16,
    width: "100%",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  feeText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  warningText: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
    marginBottom: 24,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#E0E0E0",
  },
  confirmButton: {
    backgroundColor: "#4CAF50",
  },
  cancelButtonText: {
    color: "#666",
    fontWeight: "600",
    fontSize: 14,
  },
  confirmButtonText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 14,
  },
});