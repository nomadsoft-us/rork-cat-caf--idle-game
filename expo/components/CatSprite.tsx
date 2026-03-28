import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Cat } from "@/types/game";

interface CatSpriteProps {
  cat: Cat;
}

export default function CatSprite({ cat }: CatSpriteProps) {
  const getStateEmoji = () => {
    switch (cat.state) {
      case "sleeping": return "😴";
      case "eating": return "🍽️";
      case "playing": return "🎾";
      default: return "🐱";
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: cat.color }]}>
      <Text style={styles.emoji}>{getStateEmoji()}</Text>
      <Text style={styles.name}>{cat.name}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 35,
    height: 35,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  emoji: {
    fontSize: 16,
  },
  name: {
    fontSize: 9,
    color: "#FFF",
    fontWeight: "600",
    position: "absolute",
    bottom: -14,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 3,
    paddingVertical: 1,
    borderRadius: 3,
  },
});