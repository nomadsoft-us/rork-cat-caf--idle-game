import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGame } from "@/providers/GameProvider";
import { UPGRADES, COFFEE_MENU } from "@/constants/gameData";
import { Lock, Check, Coffee, Home, Users, Sparkles } from "lucide-react-native";

export default function UpgradesScreen() {
  const { gameState, purchaseUpgrade, adoptCat, unlockCoffeeTier } = useGame();
  const [selectedCategory, setSelectedCategory] = useState<"facilities" | "coffee" | "cats" | "staff">("facilities");

  const handleUpgrade = (category: string, type: string, level: number) => {
    const upgrade = UPGRADES[category as keyof typeof UPGRADES];
    if (!upgrade) return;

    const item = Array.isArray(upgrade) 
      ? upgrade[level - 1]
      : upgrade[type as keyof typeof upgrade]?.[level - 1];
    
    if (!item) return;

    if (gameState.money >= item.cost) {
      purchaseUpgrade(category, type, level);
    } else {
      Alert.alert("Insufficient Funds", `You need $${item.cost} to purchase this upgrade.`);
    }
  };

  const handleAdoptCat = () => {
    const adoptionCost = 100 + (gameState.cats.length * 50);
    if (gameState.money >= adoptionCost) {
      adoptCat();
    } else {
      Alert.alert("Insufficient Funds", `You need $${adoptionCost} to adopt a cat.`);
    }
  };

  const renderFacilityUpgrades = () => (
    <View style={styles.upgradeSection}>
      <Text style={styles.sectionTitle}>Facility Upgrades</Text>
      
      {Object.entries(UPGRADES.facilities).map(([key, upgrades]) => (
        <View key={key} style={styles.upgradeCategory}>
          <Text style={styles.categoryTitle}>
            {key === "seating" ? "Seating" : key === "catAreas" ? "Cat Areas" : "Play Area"}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {upgrades.map((upgrade, index) => {
              const currentLevel = gameState.upgrades.facilities[key as keyof typeof gameState.upgrades.facilities];
              const isOwned = currentLevel >= upgrade.level;
              const canAfford = gameState.money >= upgrade.cost;
              const isNext = currentLevel === upgrade.level - 1;

              return (
                <TouchableOpacity
                  key={upgrade.level}
                  style={[
                    styles.upgradeCard,
                    isOwned && styles.upgradeOwned,
                    !canAfford && !isOwned && styles.upgradeDisabled,
                  ]}
                  onPress={() => !isOwned && isNext && handleUpgrade("facilities", key, upgrade.level)}
                  disabled={isOwned || !isNext}
                >
                  {isOwned ? (
                    <Check size={24} color="#4CAF50" />
                  ) : !isNext ? (
                    <Lock size={24} color="#999" />
                  ) : null}
                  <Text style={styles.upgradeName}>{upgrade.name}</Text>
                  <Text style={styles.upgradePrice}>${upgrade.cost}</Text>
                  {key === "seating" && (
                    <Text style={styles.upgradeEffect}>+{upgrade.capacity} seats</Text>
                  )}
                  {key === "catAreas" && (
                    <Text style={styles.upgradeEffect}>+{upgrade.catCapacity} cats</Text>
                  )}
                  {key === "playArea" && (
                    <Text style={styles.upgradeEffect}>+{upgrade.energyBonus}% energy</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      ))}
    </View>
  );

  const renderCoffeeUpgrades = () => (
    <View style={styles.upgradeSection}>
      <Text style={styles.sectionTitle}>Coffee Menu</Text>
      
      {Object.entries(COFFEE_MENU).map(([tier, data]) => {
        const isUnlocked = gameState.unlockedCoffeeTiers.includes(tier);
        const canAfford = gameState.money >= data.unlockCost;

        return (
          <View key={tier} style={styles.coffeeTier}>
            <View style={styles.tierHeader}>
              <Text style={styles.tierTitle}>{tier.toUpperCase()}</Text>
              {!isUnlocked && (
                <TouchableOpacity
                  style={[styles.unlockButton, !canAfford && styles.unlockButtonDisabled]}
                  onPress={() => canAfford && unlockCoffeeTier(tier)}
                  disabled={!canAfford}
                >
                  <Text style={styles.unlockButtonText}>
                    Unlock ${data.unlockCost}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            
            <View style={styles.drinksList}>
              {data.drinks.map(drink => (
                <View key={drink.id} style={[styles.drinkItem, !isUnlocked && styles.drinkLocked]}>
                  <Coffee size={16} color={isUnlocked ? "#8B4513" : "#CCC"} />
                  <Text style={[styles.drinkName, !isUnlocked && styles.textLocked]}>
                    {drink.name}
                  </Text>
                  <Text style={[styles.drinkPrice, !isUnlocked && styles.textLocked]}>
                    ${drink.price}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        );
      })}
    </View>
  );

  const renderCatAdoption = () => (
    <View style={styles.upgradeSection}>
      <Text style={styles.sectionTitle}>Cat Adoption</Text>
      
      <TouchableOpacity
        style={styles.adoptButton}
        onPress={handleAdoptCat}
      >
        <Text style={styles.adoptIcon}>🐱</Text>
        <Text style={styles.adoptTitle}>Adopt a New Cat</Text>
        <Text style={styles.adoptPrice}>
          ${100 + (gameState.cats.length * 50)}
        </Text>
        <Text style={styles.adoptSubtext}>
          Current cats: {gameState.cats.length}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Upgrades</Text>
        <Text style={styles.money}>${gameState.money.toFixed(2)}</Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, selectedCategory === "facilities" && styles.tabActive]}
          onPress={() => setSelectedCategory("facilities")}
        >
          <Home size={20} color={selectedCategory === "facilities" ? "#8B4513" : "#999"} />
          <Text style={[styles.tabText, selectedCategory === "facilities" && styles.tabTextActive]}>
            Facilities
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, selectedCategory === "coffee" && styles.tabActive]}
          onPress={() => setSelectedCategory("coffee")}
        >
          <Coffee size={20} color={selectedCategory === "coffee" ? "#8B4513" : "#999"} />
          <Text style={[styles.tabText, selectedCategory === "coffee" && styles.tabTextActive]}>
            Coffee
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, selectedCategory === "cats" && styles.tabActive]}
          onPress={() => setSelectedCategory("cats")}
        >
          <Sparkles size={20} color={selectedCategory === "cats" ? "#8B4513" : "#999"} />
          <Text style={[styles.tabText, selectedCategory === "cats" && styles.tabTextActive]}>
            Cats
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, selectedCategory === "staff" && styles.tabActive]}
          onPress={() => setSelectedCategory("staff")}
        >
          <Users size={20} color={selectedCategory === "staff" ? "#8B4513" : "#999"} />
          <Text style={[styles.tabText, selectedCategory === "staff" && styles.tabTextActive]}>
            Staff
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {selectedCategory === "facilities" && renderFacilityUpgrades()}
        {selectedCategory === "coffee" && renderCoffeeUpgrades()}
        {selectedCategory === "cats" && renderCatAdoption()}
        {selectedCategory === "staff" && (
          <View style={styles.comingSoon}>
            <Text style={styles.comingSoonText}>Staff upgrades coming soon!</Text>
          </View>
        )}
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  money: {
    fontSize: 20,
    fontWeight: "600",
    color: "#FFE4B5",
  },
  tabs: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "#FFF",
    gap: 4,
  },
  tabActive: {
    backgroundColor: "#FFE4B5",
  },
  tabText: {
    fontSize: 12,
    color: "#999",
  },
  tabTextActive: {
    color: "#8B4513",
    fontWeight: "600",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  upgradeSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  upgradeCategory: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    marginBottom: 12,
  },
  upgradeCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: 140,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  upgradeOwned: {
    backgroundColor: "#E8F5E9",
  },
  upgradeDisabled: {
    opacity: 0.5,
  },
  upgradeName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginTop: 8,
    textAlign: "center",
  },
  upgradePrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4CAF50",
    marginTop: 4,
  },
  upgradeEffect: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  coffeeTier: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  tierHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  tierTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  unlockButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  unlockButtonDisabled: {
    backgroundColor: "#999",
  },
  unlockButtonText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 12,
  },
  drinksList: {
    gap: 8,
  },
  drinkItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  drinkLocked: {
    opacity: 0.5,
  },
  drinkName: {
    flex: 1,
    fontSize: 14,
    color: "#333",
  },
  drinkPrice: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4CAF50",
  },
  textLocked: {
    color: "#999",
  },
  adoptButton: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  adoptIcon: {
    fontSize: 48,
  },
  adoptTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginTop: 12,
  },
  adoptPrice: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4CAF50",
    marginTop: 8,
  },
  adoptSubtext: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  comingSoon: {
    alignItems: "center",
    paddingVertical: 60,
  },
  comingSoonText: {
    fontSize: 18,
    color: "#999",
  },
});