import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGame } from "@/providers/GameProvider";
import { Cat } from "@/types/game";
import { router } from "expo-router";
import { Heart, Battery, Smile, Calendar } from "lucide-react-native";

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

export default function CatsScreen() {
  const { gameState, feedCat, playCat } = useGame();

  const renderCat = ({ item }: { item: Cat }) => (
    <TouchableOpacity
      style={styles.catCard}
      onPress={() => router.push(`/cat/${item.id}`)}
    >
      <View style={[styles.catAvatar, { backgroundColor: item.color }]}>
        <Text style={styles.catEmoji}>🐱</Text>
      </View>
      
      <View style={styles.catInfo}>
        <Text style={styles.catName}>{item.name}</Text>
        <Text style={styles.catPersonality}>{item.personality}</Text>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Heart size={14} color="#E91E63" />
            <Text style={styles.statText}>{item.health.toFixed(1)}%</Text>
          </View>
          <View style={styles.statItem}>
            <Smile size={14} color="#FFD700" />
            <Text style={styles.statText}>{item.happiness.toFixed(1)}%</Text>
          </View>
          <View style={styles.statItem}>
            <Battery size={14} color="#4CAF50" />
            <Text style={styles.statText}>{item.energy.toFixed(1)}%</Text>
          </View>
          <View style={styles.statItem}>
            <Calendar size={14} color="#9C27B0" />
            <Text style={styles.statText}>{formatAge(item.age)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => feedCat(item.id)}
        >
          <Text style={styles.actionIcon}>🍽️</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => playCat(item.id)}
        >
          <Text style={styles.actionIcon}>🎾</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Cats</Text>
        <Text style={styles.subtitle}>
          {gameState.cats.length} cats in your café
        </Text>
      </View>

      <FlatList
        data={gameState.cats}
        renderItem={renderCat}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>😿</Text>
            <Text style={styles.emptyText}>No cats yet!</Text>
            <Text style={styles.emptySubtext}>
              Visit the upgrades tab to adopt your first cat
            </Text>
          </View>
        }
      />
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
  subtitle: {
    fontSize: 16,
    color: "#FFE4B5",
    marginTop: 4,
  },
  listContent: {
    padding: 16,
  },
  catCard: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  catAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  catEmoji: {
    fontSize: 30,
  },
  catInfo: {
    flex: 1,
    marginLeft: 16,
  },
  catName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  catPersonality: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  statsContainer: {
    flexDirection: "row",
    marginTop: 8,
    gap: 12,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: "#666",
  },
  actions: {
    flexDirection: "column",
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFE4B5",
    justifyContent: "center",
    alignItems: "center",
  },
  actionIcon: {
    fontSize: 18,
  },
  separator: {
    height: 12,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 60,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
    textAlign: "center",
  },
});