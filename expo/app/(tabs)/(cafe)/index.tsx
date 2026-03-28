import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGame } from "@/providers/GameProvider";
import { Cat, Customer } from "@/types/game";
import CatSprite from "@/components/CatSprite";
import CustomerSprite from "@/components/CustomerSprite";
import StaffSprite from "@/components/StaffSprite";
import PoopSprite from "@/components/PoopSprite";
import { DollarSign, Heart, Star, Users, Droplets, Clock } from "lucide-react-native";
import { router } from "expo-router";
import FloatingText from "@/components/FloatingText";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function CafeScreen() {
  const { gameState, collectRevenue, collectTips, feedCat, playCat, serveCustomer, cleanPoop, getOfflineProgress, applyOfflineProgress, saveGame } = useGame();
  const [eventNotifications, setEventNotifications] = useState<Array<{ id: string; message: string }>>([]);
  const [floatingTexts, setFloatingTexts] = useState<Array<{ id: string; text: string; x: number; y: number }>>([]);
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);
  const [offlineEarnings, setOfflineEarnings] = useState(0);
  const [offlineTime, setOfflineTime] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const tipsFadeAnim = useRef(new Animated.Value(1)).current;
  const hasShownWelcomeBack = useRef(false);

  // Check for offline progress on first load
  useEffect(() => {
    if (!hasShownWelcomeBack.current && gameState.cats.length > 0) {
      const offlineProgress = getOfflineProgress();
      
      if (offlineProgress) {
        setOfflineEarnings(offlineProgress.earnings + offlineProgress.passiveRevenue);
        setOfflineTime(offlineProgress.hoursAway);
        setShowWelcomeBack(true);
        hasShownWelcomeBack.current = true;
        
        // Apply the offline progress
        applyOfflineProgress();
      }
    }
  }, [gameState.cats.length, getOfflineProgress, applyOfflineProgress]);

  useEffect(() => {
    const interval = setInterval(() => {
      if ((gameState.accumulatedRevenue || 0) > 0) {
        Animated.sequence([
          Animated.timing(fadeAnim, {
            toValue: 1.2,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      }
      
      if ((gameState.accumulatedTips || 0) > 0) {
        Animated.sequence([
          Animated.timing(tipsFadeAnim, {
            toValue: 1.2,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(tipsFadeAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState.accumulatedRevenue, gameState.accumulatedTips]);

  // Show event notifications
  useEffect(() => {
    const newEvents = (gameState.events || []).filter(event => 
      !eventNotifications.some(notif => notif.id === event.id)
    );
    
    if (newEvents.length > 0) {
      const newNotifications = newEvents.map(event => ({
        id: event.id,
        message: event.message,
      }));
      
      setEventNotifications(prev => [...prev, ...newNotifications]);
      
      // Auto-remove notifications after 3 seconds
      newNotifications.forEach(notif => {
        setTimeout(() => {
          setEventNotifications(prev => prev.filter(n => n.id !== notif.id));
        }, 3000);
      });
    }
  }, [gameState.events, eventNotifications]);

  const handleCollectRevenue = () => {
    if ((gameState.accumulatedRevenue || 0) > 0) {
      const amount = gameState.accumulatedRevenue || 0;
      collectRevenue();
      
      const id = Date.now().toString();
      setFloatingTexts(prev => [...prev, {
        id,
        text: `+${amount.toFixed(2)}`,
        x: SCREEN_WIDTH / 2,
        y: 100,
      }]);
      
      setTimeout(() => {
        setFloatingTexts(prev => prev.filter(t => t.id !== id));
      }, 2000);
    }
  };
  
  const handleCollectTips = () => {
    if ((gameState.accumulatedTips || 0) > 0) {
      const amount = gameState.accumulatedTips || 0;
      collectTips();
      
      const id = Date.now().toString();
      setFloatingTexts(prev => [...prev, {
        id,
        text: `💰 +${amount.toFixed(2)}`,
        x: SCREEN_WIDTH / 2 + 20,
        y: 130,
      }]);
      
      setTimeout(() => {
        setFloatingTexts(prev => prev.filter(t => t.id !== id));
      }, 2000);
    }
  };

  const handleCatTap = (cat: Cat) => {
    router.push(`/cat/${cat.id}`);
  };
  
  const handleCustomerTap = (customer: Customer) => {
    if (customer.orderStatus === "waiting") {
      serveCustomer(customer.id);
      
      // Add floating text for serving
      const id = Date.now().toString();
      setFloatingTexts(prev => [...prev, {
        id,
        text: "Serving...",
        x: customer.position.x,
        y: customer.position.y - 20,
      }]);
      
      setTimeout(() => {
        setFloatingTexts(prev => prev.filter(t => t.id !== id));
      }, 2000);
    }
  };

  const averageHappiness = (gameState.cats && gameState.cats.length > 0)
    ? gameState.cats.reduce((sum, cat) => sum + (cat.happiness || 0), 0) / gameState.cats.length
    : 0;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header Stats */}
      <View style={styles.header}>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <DollarSign size={20} color="#4CAF50" />
            <Text style={styles.statValue}>${(gameState.money || 0).toFixed(2)}</Text>
          </View>
          <View style={styles.stat}>
            <Star size={20} color="#FFD700" />
            <Text style={styles.statValue}>{(gameState.reputation || 0).toFixed(0)}</Text>
          </View>
          <View style={styles.stat}>
            <Users size={20} color="#2196F3" />
            <Text style={styles.statValue}>{(gameState.customers || []).length}</Text>
          </View>
          <View style={styles.stat}>
            <Heart size={20} color="#E91E63" />
            <Text style={styles.statValue}>{averageHappiness.toFixed(1)}%</Text>
          </View>
          <View style={styles.stat}>
            <Droplets size={20} color="#3498DB" />
            <Text style={styles.statValue}>{(gameState.cleanliness || 0).toFixed(0)}%</Text>
          </View>
        </View>
        
        {/* Revenue Collection Buttons */}
        <View style={styles.collectButtonsContainer}>
          <TouchableOpacity 
            style={[styles.collectButton, styles.revenueButton, (gameState.accumulatedRevenue || 0) === 0 && styles.collectButtonDisabled]}
            onPress={handleCollectRevenue}
            disabled={(gameState.accumulatedRevenue || 0) === 0}
          >
            <Animated.View style={{ transform: [{ scale: fadeAnim }] }}>
              <Text style={styles.collectButtonText}>
                Collect ${(gameState.accumulatedRevenue || 0).toFixed(2)}
              </Text>
            </Animated.View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.collectButton, styles.tipsButton, (gameState.accumulatedTips || 0) === 0 && styles.collectButtonDisabled]}
            onPress={handleCollectTips}
            disabled={(gameState.accumulatedTips || 0) === 0}
          >
            <Animated.View style={{ transform: [{ scale: tipsFadeAnim }] }}>
              <Text style={styles.collectButtonText}>
                💰 Tips ${(gameState.accumulatedTips || 0).toFixed(2)}
              </Text>
            </Animated.View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Café View */}
      <ScrollView style={styles.cafeArea} showsVerticalScrollIndicator={false}>
        <View style={styles.cafeFloor}>
          {/* Render Customers */}
          {(gameState.customers || []).map((customer) => (
            <CustomerSprite
              key={customer.id}
              customer={customer}
              position={customer.position}
              onPress={() => handleCustomerTap(customer)}
            />
          ))}
          
          {/* Render Staff */}
          {(gameState.staff || []).map((staff) => (
            <StaffSprite
              key={staff.id}
              staff={staff}
            />
          ))}
          
          {/* Render Poop */}
          {(gameState.poops || []).map((poop) => (
            <PoopSprite
              key={poop.id}
              poop={poop}
              onPress={() => {
                cleanPoop(poop.id);
                // Add floating text for cleaning
                const id = Date.now().toString();
                setFloatingTexts(prev => [...prev, {
                  id,
                  text: "-$2 Clean!",
                  x: poop.position.x,
                  y: poop.position.y,
                }]);
                
                setTimeout(() => {
                  setFloatingTexts(prev => prev.filter(t => t.id !== id));
                }, 2000);
              }}
            />
          ))}

          {/* Render Cats */}
          {(gameState.cats || []).map((cat) => (
            <TouchableOpacity
              key={cat.id}
              onPress={() => handleCatTap(cat)}
              style={[styles.catContainer, { 
                left: cat.position?.x || 0, 
                top: cat.position?.y || 0 
              }]}
            >
              <CatSprite cat={cat} />
              <View style={styles.catStatus}>
                <View style={[styles.statusBar, styles.healthBar]}>
                  <View style={[styles.statusFill, { width: `${(cat.health || 0).toFixed(1)}%`, backgroundColor: "#4CAF50" }]} />
                </View>
                <View style={[styles.statusBar, styles.happinessBar]}>
                  <View style={[styles.statusFill, { width: `${(cat.happiness || 0).toFixed(1)}%`, backgroundColor: "#FFD700" }]} />
                </View>
              </View>
            </TouchableOpacity>
          ))}

          {/* Floating Texts */}
          {floatingTexts.map(text => (
            <FloatingText
              key={text.id}
              text={text.text}
              x={text.x}
              y={text.y}
            />
          ))}
        </View>
      </ScrollView>
      
      {/* Event Notifications */}
      {eventNotifications.map((notification, index) => (
        <View 
          key={notification.id} 
          style={[styles.eventNotification, { top: 100 + (index * 60) }]}
        >
          <Text style={styles.eventNotificationText}>{notification.message}</Text>
        </View>
      ))}
      
      {/* Cleanliness Warning */}
      {(gameState.cleanliness || 0) < 50 && (
        <View style={styles.cleanlinessWarning}>
          <Text style={styles.warningText}>
            ⚠️ Café is getting dirty! Clean up poop or customers will leave!
          </Text>
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.actionButton} onPress={() => feedCat((gameState.cats || [])[0]?.id)}>
          <Text style={styles.actionButtonText}>Feed All</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => playCat((gameState.cats || [])[0]?.id)}>
          <Text style={styles.actionButtonText}>Play Time</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, { 
            backgroundColor: (gameState.poops || []).length > 0 ? "#E74C3C" : "#95A5A6",
            transform: (gameState.poops || []).length > 3 ? [{ scale: 1.1 }] : [{ scale: 1 }]
          }]}
          disabled={(gameState.poops || []).length === 0}
          onPress={() => {
            if ((gameState.poops || []).length > 0) {
              cleanPoop((gameState.poops || [])[0].id);
            }
          }}
        >
          <Text style={styles.actionButtonText}>Clean {(gameState.poops || []).length > 0 ? `(${(gameState.poops || []).length})` : ''}</Text>
        </TouchableOpacity>
      </View>
      
      {/* Welcome Back Modal */}
      <Modal
        visible={showWelcomeBack}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowWelcomeBack(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.welcomeBackModal}>
            <View style={styles.modalHeader}>
              <Clock size={32} color="#4CAF50" />
              <Text style={styles.modalTitle}>Welcome Back!</Text>
            </View>
            
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>
                You were away for {offlineTime.toFixed(1)} hours
              </Text>
              
              <View style={styles.offlineEarnings}>
                <DollarSign size={24} color="#4CAF50" />
                <Text style={styles.earningsText}>
                  +${offlineEarnings.toFixed(2)}
                </Text>
              </View>
              
              <Text style={styles.modalSubtext}>
                Your cats kept the café running while you were away!
              </Text>
              
              <Text style={styles.modalNote}>
                💡 Tip: Keep your cats happy and healthy for better offline earnings!
              </Text>
            </View>
            
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={() => {
                setShowWelcomeBack(false);
                // Save the current state after collecting offline earnings
                saveGame();
              }}
            >
              <Text style={styles.modalButtonText}>Collect Earnings</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF8F0",
  },
  header: {
    backgroundColor: "#8B4513",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 12,
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statValue: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  collectButtonsContainer: {
    flexDirection: "row",
    gap: 8,
  },
  collectButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: "center",
  },
  revenueButton: {
    backgroundColor: "#4CAF50",
  },
  tipsButton: {
    backgroundColor: "#FF9800",
  },
  collectButtonDisabled: {
    backgroundColor: "#999",
  },
  collectButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  cafeArea: {
    flex: 1,
  },
  cafeFloor: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.6,
    backgroundColor: "#F5E6D3",
    position: "relative",
  },
  catContainer: {
    position: "absolute",
    alignItems: "center",
  },
  catStatus: {
    marginTop: 4,
    width: 35,
  },
  statusBar: {
    height: 4,
    backgroundColor: "rgba(0,0,0,0.1)",
    borderRadius: 2,
    marginVertical: 1,
  },
  statusFill: {
    height: "100%",
    borderRadius: 2,
  },
  healthBar: {},
  happinessBar: {},
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderTopColor: "#E5D4B1",
  },
  actionButton: {
    backgroundColor: "#FF6B6B",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  actionButtonText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 14,
  },
  eventNotification: {
    position: "absolute",
    right: 16,
    backgroundColor: "#FF6B6B",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    maxWidth: 250,
  },
  eventNotificationText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  cleanlinessWarning: {
    position: "absolute",
    top: 50,
    left: 16,
    right: 16,
    backgroundColor: "#FF6B6B",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  warningText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  welcomeBackModal: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 350,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  modalHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginTop: 8,
  },
  modalContent: {
    alignItems: "center",
    marginBottom: 24,
  },
  modalText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 16,
  },
  offlineEarnings: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E8",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 15,
    marginBottom: 16,
  },
  earningsText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4CAF50",
    marginLeft: 8,
  },
  modalSubtext: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    marginBottom: 12,
  },
  modalNote: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    fontStyle: "italic",
    backgroundColor: "#F0F8FF",
    padding: 8,
    borderRadius: 8,
  },
  modalButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: "center",
  },
  modalButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});