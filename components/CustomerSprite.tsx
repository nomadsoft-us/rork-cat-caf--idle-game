import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Customer } from "@/types/game";

interface CustomerSpriteProps {
  customer: Customer;
  position: { x: number; y: number };
  onPress?: () => void;
}

export default function CustomerSprite({ customer, position, onPress }: CustomerSpriteProps) {
  const getCustomerEmoji = () => {
    if (customer.type.includes("Cat")) return "😻";
    if (customer.type.includes("Business")) return "👔";
    if (customer.type.includes("Student")) return "🎓";
    if (customer.type.includes("Influencer")) return "📱";
    if (customer.type.includes("Celebrity")) return "⭐";
    if (customer.type.includes("Critic")) return "📝";
    return "👤";
  };
  
  const getOrderStatusColor = () => {
    switch (customer.orderStatus) {
      case "waiting": return "#FF6B6B";
      case "ordering": return "#FFD93D";
      case "being_served": return "#6BCF7F";
      case "served": return "#4ECDC4";
      case "leaving": return "#95A5A6";
      default: return "#FF6B6B";
    }
  };
  
  const showTimer = customer.orderStatus === "waiting" && customer.orderTimer > 0;

  return (
    <TouchableOpacity 
      style={[styles.container, { 
        left: position.x, 
        top: position.y,
        zIndex: customer.orderStatus === "waiting" ? 3 : 1 // Higher z-index for waiting customers
      }]}
      onPress={onPress}
      disabled={customer.orderStatus !== "waiting"}
    >
      <View style={[styles.customerBody, { 
        backgroundColor: customer.orderStatus === "waiting" ? "#FFE4E1" : 
                        customer.orderStatus === "ordering" ? "#FFF8DC" :
                        customer.orderStatus === "served" ? "#E8F5E8" : "#F5F5F5",
        borderColor: getOrderStatusColor(),
        borderWidth: customer.orderStatus === "ordering" ? 3 : 2,
        opacity: customer.orderStatus === "leaving" ? 0.5 : 1
      }]}>
        <Text style={styles.emoji}>{getCustomerEmoji()}</Text>
        {customer.orderStatus === "waiting" && (
          <Text style={styles.orderText}>☕</Text>
        )}
        {customer.orderStatus === "ordering" && (
          <Text style={styles.orderText}>⏳</Text>
        )}
        {customer.orderStatus === "served" && (
          <Text style={styles.orderText}>😊</Text>
        )}
      </View>
      {showTimer && (
        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>{Math.ceil(customer.orderTimer)}s</Text>
        </View>
      )}
      <View style={styles.satisfactionBar}>
        <View 
          style={[
            styles.satisfactionFill, 
            { 
              width: `${customer.satisfaction}%`,
              backgroundColor: getOrderStatusColor()
            }
          ]} 
        />
      </View>
      {customer.orderStatus === "ordering" && (
        <View style={styles.beingServedIndicator}>
          <Text style={styles.beingServedText}>🔄</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    width: 35,
    height: 55,
    alignItems: "center",
  },
  customerBody: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  emoji: {
    fontSize: 14,
  },
  orderText: {
    position: "absolute",
    top: -8,
    right: -8,
    fontSize: 14,
    backgroundColor: "#FFF",
    borderRadius: 10,
    paddingHorizontal: 2,
  },
  timerContainer: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#FF6B6B",
    borderRadius: 10,
    paddingHorizontal: 4,
    paddingVertical: 2,
    minWidth: 20,
  },
  timerText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "center",
  },
  satisfactionBar: {
    width: 25,
    height: 3,
    backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: 2,
    marginTop: 2,
  },
  satisfactionFill: {
    height: "100%",
    borderRadius: 2,
  },
  beingServedIndicator: {
    position: "absolute",
    top: -10,
    left: -10,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  beingServedText: {
    fontSize: 12,
  },
});