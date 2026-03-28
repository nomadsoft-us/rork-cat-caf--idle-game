import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Staff } from "@/types/game";

interface StaffSpriteProps {
  staff: Staff;
}

export default function StaffSprite({ staff }: StaffSpriteProps) {
  const getStaffEmoji = () => {
    switch (staff.state) {
      case "walking_to_machine":
      case "walking_to_customer":
        return "🏃";
      case "making_coffee":
        return "👨‍🍳";
      case "serving":
        return "🍽️";
      default:
        return "🧑‍💼";
    }
  };
  
  const getStatusText = () => {
    switch (staff.state) {
      case "walking_to_machine": return "→ Machine";
      case "making_coffee": return "Making ☕";
      case "walking_to_customer": return "→ Customer";
      case "serving": return "Serving";
      default: return "Idle";
    }
  };
  
  const getStatusColor = () => {
    switch (staff.state) {
      case "walking_to_machine":
      case "walking_to_customer":
        return "rgba(255, 165, 0, 0.9)"; // Orange for walking
      case "making_coffee":
        return "rgba(139, 69, 19, 0.9)"; // Brown for making coffee
      case "serving":
        return "rgba(34, 139, 34, 0.9)"; // Green for serving
      default:
        return "rgba(128, 128, 128, 0.9)"; // Gray for idle
    }
  };

  return (
    <View style={[styles.container, { 
      left: staff.position.x, 
      top: staff.position.y,
      zIndex: staff.state === "idle" ? 1 : 2 // Higher z-index when active
    }]}>
      <Text style={styles.emoji}>{getStaffEmoji()}</Text>
      <View style={[styles.statusContainer, { backgroundColor: getStatusColor() }]}>
        <Text style={styles.statusText}>{getStatusText()}</Text>
      </View>
      {staff.servingCustomerId && (
        <View style={styles.assignmentIndicator}>
          <Text style={styles.assignmentText}>📋</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    width: 60,
    height: 80,
    alignItems: "center",
  },
  emoji: {
    fontSize: 28,
  },
  statusContainer: {
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 2,
    minWidth: 50,
  },
  statusText: {
    color: "#FFF",
    fontSize: 9,
    fontWeight: "600",
    textAlign: "center",
  },
  assignmentIndicator: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  assignmentText: {
    fontSize: 12,
  },
});