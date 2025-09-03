import { useState, useEffect, useRef, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";
import { GameState, Cat, Customer, Event, Poop, Staff } from "@/types/game";
import { 
  CAT_PERSONALITIES, 
  CAT_NAMES, 
  CAT_COLORS,
  CUSTOMER_TYPES,
  RANDOM_EVENTS,
  COFFEE_MENU,
  UPGRADES,
  ACHIEVEMENTS,
} from "@/constants/gameData";

const TICK_RATE = 100; // ms
const SAVE_INTERVAL = 15000; // 15 seconds

const createStarterCat = (): Cat => {
  const personalities = Object.keys(CAT_PERSONALITIES);
  const personality = personalities[Math.floor(Math.random() * personalities.length)];
  const name = CAT_NAMES[Math.floor(Math.random() * CAT_NAMES.length)];
  const color = CAT_COLORS[Math.floor(Math.random() * CAT_COLORS.length)].hex;
  
  return {
    id: "starter-cat",
    name,
    personality,
    color,
    age: 7,
    health: 100,
    happiness: 90,
    energy: 100,
    hunger: 20,
    state: "lounging",
    adoptable: false,
    position: {
      x: 150,
      y: 200,
    },
  };
};

const createStaff = (): Staff => ({
  id: "staff-1",
  position: { x: 50, y: 100 },
  state: "idle",
  actionTimer: 0,
});

const initialGameState: GameState = {
  money: 100,
  reputation: 50,
  prestigeLevel: 0,
  cats: [createStarterCat()],
  customers: [],
  poops: [],
  staff: [createStaff()],
  cleanliness: 100,
  upgrades: {
    facilities: {
      seating: 0,
      catAreas: 0,
      playArea: 0,
    },
    food: {
      quality: 0,
      treats: 0,
    },
    staff: 0,
  },
  unlockedCoffeeTiers: ["tier1"],
  statistics: {
    totalMoneyEarned: 0,
    totalCustomersServed: 0,
    catsAdopted: 0,
    timePlayed: 0,
  },
  achievements: [],
  events: [],
  settings: {
    soundEnabled: true,
    notificationsEnabled: true,
  },
  lastSaveTime: Date.now(),
  accumulatedRevenue: 0,
  accumulatedTips: 0,
};

export const [GameProvider, useGame] = createContextHook(() => {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const tickInterval = useRef<any>(null);
  const saveInterval = useRef<any>(null);

  // Load game state
  useEffect(() => {
    loadGame();
    return () => {
      if (tickInterval.current) clearInterval(tickInterval.current);
      if (saveInterval.current) clearInterval(saveInterval.current);
    };
  }, []);

  const updateGame = useCallback(() => {
    setGameState(prev => {
      const newState = { ...prev };
      const deltaTime = TICK_RATE / 1000;

      // Update statistics
      newState.statistics.timePlayed += deltaTime;
      
      // Update last save time periodically to track activity
      if (Date.now() - newState.lastSaveTime > 60000) { // Update every minute
        newState.lastSaveTime = Date.now();
      }
      
      // Check and award achievements
      checkAchievements(newState);

      // Update cats and check for tip generation
      newState.cats = newState.cats.map(cat => {
        const updatedCat = updateCatState(cat, deltaTime);
        
        // Check if cat is near customers and generate tips
        if (updatedCat.state === "playing" || updatedCat.happiness > 80) {
          newState.customers.forEach(customer => {
            if (customer.orderStatus === "served" || customer.orderStatus === "waiting") {
              const distance = Math.sqrt(
                Math.pow(updatedCat.position.x - customer.position.x, 2) + 
                Math.pow(updatedCat.position.y - customer.position.y, 2)
              );
              
              // If cat is close to customer (within 60 pixels) and cat is happy/playing
              if (distance < 60 && Math.random() < 0.01) { // 1% chance per tick when close
                const baseTip = 2; // Base tip amount
                const happinessMultiplier = updatedCat.happiness / 100;
                const upgradeMultiplier = 1 + (Object.values(newState.upgrades.facilities).reduce((sum, level) => sum + level, 0) * 0.1);
                const catCountMultiplier = 1 + (newState.cats.length * 0.05);
                
                const tipAmount = baseTip * happinessMultiplier * upgradeMultiplier * catCountMultiplier * customer.generosity;
                
                newState.accumulatedTips += tipAmount;
                
                // Increase customer satisfaction when they interact with happy cats
                customer.satisfaction = Math.min(100, customer.satisfaction + 10);
              }
            }
          });
        }
        
        return updatedCat;
      });

      // Spawn customers
      if (Math.random() < 0.01 && newState.customers.length < 10) {
        newState.customers.push(spawnCustomer());
      }

      // Update customers
      newState.customers = newState.customers
        .map(customer => updateCustomer(customer, deltaTime, newState))
        .filter(customer => customer.stayDuration > 0 && customer.orderStatus !== "leaving");
      
      // Update staff
      newState.staff = newState.staff.map(staff => updateStaff(staff, deltaTime, newState));
      
      // Spawn poop randomly from cats (higher chance if cats are unhappy or unhealthy)
      newState.cats.forEach(cat => {
        const poopChance = 0.002 + (cat.health < 50 ? 0.003 : 0) + (cat.happiness < 30 ? 0.002 : 0);
        if (Math.random() < poopChance) {
          // Generate poop position with some spacing from cat
          let poopPosition = { x: 0, y: 0 };
          let attempts = 0;
          
          do {
            poopPosition = {
              x: Math.max(40, Math.min(260, cat.position.x + (Math.random() - 0.5) * 100)),
              y: Math.max(40, Math.min(360, cat.position.y + (Math.random() - 0.5) * 100)),
            };
            attempts++;
          } while (attempts < 5 && !isPositionValid(poopPosition, 50));
          
          newState.poops.push({
            id: `${Date.now()}-${cat.id}`,
            position: poopPosition,
            timeCreated: Date.now(),
          });
        }
      });
      
      // Update cleanliness based on poop count
      const poopPenalty = newState.poops.length * 5;
      newState.cleanliness = Math.max(0, 100 - poopPenalty);
      
      // Customers leave if cleanliness is too low or if there's too much poop
      newState.customers = newState.customers.filter(customer => {
        if (newState.cleanliness < 30 && Math.random() < 0.05) {
          customer.orderStatus = "leaving";
          return false;
        }
        // Customers also leave if they see poop nearby
        const nearbyPoop = newState.poops.some(poop => {
          const distance = Math.sqrt(
            Math.pow(poop.position.x - customer.position.x, 2) + 
            Math.pow(poop.position.y - customer.position.y, 2)
          );
          return distance < 80; // 80 pixel radius
        });
        if (nearbyPoop && Math.random() < 0.02) {
          customer.orderStatus = "leaving";
          customer.satisfaction = Math.max(0, customer.satisfaction - 50);
          return false;
        }
        return true;
      });
      
      // Remove served customers after a delay and count them
      newState.customers = newState.customers.filter(customer => {
        if (customer.orderStatus === "served") {
          customer.stayDuration -= deltaTime * 3; // Leave faster when served
          if (customer.stayDuration <= 0) {
            newState.statistics.totalCustomersServed += 1;
            return false;
          }
        }
        return true;
      });

      // Calculate passive revenue (reduced since active serving is main income)
      const revenue = calculateRevenue(newState) * deltaTime * 0.1; // Much lower passive income
      newState.accumulatedRevenue += revenue;
      newState.statistics.totalMoneyEarned += revenue;

      // Random events
      if (Math.random() < 0.001) {
        const event = triggerRandomEvent();
        if (event) {
          newState.events.push(event);
          applyEventEffects(newState, event);
        }
      }
      
      // Process active events
      newState.events = newState.events.filter(event => {
        const isActive = Date.now() - event.startTime < event.duration * 1000;
        if (!isActive) {
          removeEventEffects(newState, event);
        }
        return isActive;
      });

      return newState;
    });
  }, []);

  const saveGame = useCallback(async (stateToSave?: GameState) => {
    try {
      const currentState = stateToSave || gameState;
      const saveData = {
        ...currentState,
        lastSaveTime: Date.now(),
        version: "1.0.0"
      };
      await AsyncStorage.setItem("@game_save", JSON.stringify(saveData));
      console.log("Game saved successfully at", new Date().toLocaleTimeString());
      console.log("Saved with", currentState.cats.length, "cats and $", currentState.money.toFixed(2));
      console.log("Saved cats:", currentState.cats.map(cat => ({ id: cat.id, name: cat.name })));
    } catch (error) {
      console.error("Failed to save game:", error);
    }
  }, [gameState]);

  // Game loop
  useEffect(() => {
    tickInterval.current = setInterval(() => {
      updateGame();
    }, TICK_RATE);

    return () => {
      if (tickInterval.current) clearInterval(tickInterval.current);
    };
  }, [updateGame]);
  
  // Auto-save interval
  useEffect(() => {
    saveInterval.current = setInterval(() => {
      saveGame();
    }, SAVE_INTERVAL);

    return () => {
      if (saveInterval.current) clearInterval(saveInterval.current);
    };
  }, [saveGame]);

  // Save game when app goes to background or closes
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        saveGame();
      }
    };

    // Save on component unmount
    return () => {
      saveGame();
    };
  }, [saveGame]);

  const updateCatState = (cat: Cat, deltaTime: number): Cat => {
    const updatedCat = { ...cat };
    
    // Energy decay
    updatedCat.energy = Math.max(0, updatedCat.energy - deltaTime * 0.5);
    
    // Happiness decay
    updatedCat.happiness = Math.max(0, updatedCat.happiness - deltaTime * 0.3);
    
    // Hunger increase
    updatedCat.hunger = Math.min(100, updatedCat.hunger + deltaTime * 0.8);
    
    // Health based on hunger
    if (updatedCat.hunger > 80) {
      updatedCat.health = Math.max(0, updatedCat.health - deltaTime * 0.5);
    }
    
    // State transitions
    if (updatedCat.energy < 20) {
      updatedCat.state = "sleeping";
      updatedCat.energy = Math.min(100, updatedCat.energy + deltaTime * 2);
    } else if (updatedCat.hunger > 70) {
      updatedCat.state = "eating";
    } else if (updatedCat.happiness > 70 && updatedCat.energy > 60) {
      updatedCat.state = "playing";
    } else {
      updatedCat.state = "lounging";
    }
    
    // Cat movement - cats move around randomly when not sleeping
    if (updatedCat.state !== "sleeping" && Math.random() < 0.3) { // 30% chance to move each tick
      const moveDistance = 20; // pixels to move
      const angle = Math.random() * 2 * Math.PI;
      const newX = updatedCat.position.x + Math.cos(angle) * moveDistance;
      const newY = updatedCat.position.y + Math.sin(angle) * moveDistance;
      
      // Keep within bounds and check for valid position
      const boundedX = Math.max(40, Math.min(260, newX));
      const boundedY = Math.max(40, Math.min(360, newY));
      
      const newPosition = { x: boundedX, y: boundedY };
      
      // Only move if the new position doesn't conflict with other entities
      if (isPositionValidForCat(newPosition, updatedCat.id, 60)) {
        updatedCat.position = newPosition;
      }
    }
    
    // Age progression
    updatedCat.age += deltaTime / 300; // 1 day = 5 minutes
    
    if (updatedCat.age >= 14 && !updatedCat.adoptable) {
      updatedCat.adoptable = true;
    }
    
    return updatedCat;
  };

  const isPositionValid = (position: { x: number; y: number }, minDistance: number): boolean => {
    // Check distance from all cats
    for (const cat of gameState.cats) {
      const distance = Math.sqrt(
        Math.pow(position.x - cat.position.x, 2) + 
        Math.pow(position.y - cat.position.y, 2)
      );
      if (distance < minDistance) return false;
    }
    
    // Check distance from all customers
    for (const customer of gameState.customers) {
      const distance = Math.sqrt(
        Math.pow(position.x - customer.position.x, 2) + 
        Math.pow(position.y - customer.position.y, 2)
      );
      if (distance < minDistance) return false;
    }
    
    // Check distance from all poops
    for (const poop of gameState.poops) {
      const distance = Math.sqrt(
        Math.pow(position.x - poop.position.x, 2) + 
        Math.pow(position.y - poop.position.y, 2)
      );
      if (distance < minDistance) return false;
    }
    
    // Check distance from staff
    for (const staff of gameState.staff) {
      const distance = Math.sqrt(
        Math.pow(position.x - staff.position.x, 2) + 
        Math.pow(position.y - staff.position.y, 2)
      );
      if (distance < minDistance) return false;
    }
    
    return true;
  };
  
  const isPositionValidForCat = (position: { x: number; y: number }, catId: string, minDistance: number): boolean => {
    // Check distance from all other cats (excluding the moving cat)
    for (const cat of gameState.cats) {
      if (cat.id === catId) continue;
      const distance = Math.sqrt(
        Math.pow(position.x - cat.position.x, 2) + 
        Math.pow(position.y - cat.position.y, 2)
      );
      if (distance < minDistance) return false;
    }
    
    // Check distance from all customers
    for (const customer of gameState.customers) {
      const distance = Math.sqrt(
        Math.pow(position.x - customer.position.x, 2) + 
        Math.pow(position.y - customer.position.y, 2)
      );
      if (distance < minDistance) return false;
    }
    
    // Check distance from all poops
    for (const poop of gameState.poops) {
      const distance = Math.sqrt(
        Math.pow(position.x - poop.position.x, 2) + 
        Math.pow(position.y - poop.position.y, 2)
      );
      if (distance < minDistance) return false;
    }
    
    // Check distance from staff
    for (const staff of gameState.staff) {
      const distance = Math.sqrt(
        Math.pow(position.x - staff.position.x, 2) + 
        Math.pow(position.y - staff.position.y, 2)
      );
      if (distance < minDistance) return false;
    }
    
    return true;
  };

  const spawnCustomer = (): Customer => {
    const types = Object.values(CUSTOMER_TYPES);
    const type = types[Math.floor(Math.random() * types.length)];
    
    // Generate position with minimum spacing from other entities
    let position = { x: 0, y: 0 };
    let attempts = 0;
    const minDistance = 80; // Increased minimum distance between entities
    
    do {
      position = {
        x: 40 + Math.random() * 260, // Keep within bounds with more padding
        y: 40 + Math.random() * 360,
      };
      attempts++;
    } while (attempts < 15 && !isPositionValid(position, minDistance));
    
    return {
      id: Date.now().toString(),
      type: type.name,
      generosity: type.generosity,
      stayDuration: type.stayDuration,
      satisfaction: 50,
      position,
      orderStatus: "waiting",
      orderTimer: 30, // 30 seconds to place order
      tipAmount: 0,
    };
  };

  const updateCustomer = (customer: Customer, deltaTime: number, state: GameState): Customer => {
    const updatedCustomer = { ...customer };
    
    // Update order timer
    if (updatedCustomer.orderStatus === "waiting") {
      updatedCustomer.orderTimer -= deltaTime;
      if (updatedCustomer.orderTimer <= 0) {
        updatedCustomer.orderStatus = "leaving";
        updatedCustomer.satisfaction = Math.max(0, updatedCustomer.satisfaction - 30);
      }
    }
    
    // Decrease satisfaction if not being served
    if (updatedCustomer.orderStatus === "waiting" || updatedCustomer.orderStatus === "ordering") {
      updatedCustomer.satisfaction = Math.max(0, updatedCustomer.satisfaction - deltaTime * 2);
    }
    
    // Cleanliness affects satisfaction
    if (state.cleanliness < 50) {
      updatedCustomer.satisfaction = Math.max(0, updatedCustomer.satisfaction - deltaTime * 3);
    }
    
    // Customers stay in place once they start being served to prevent attachment issues
    // Only customers who are "waiting" can move around slightly
    if (updatedCustomer.orderStatus === "waiting" && Math.random() < 0.05) {
      // Very small random movement for waiting customers only
      const moveDistance = 3; // Very small movement
      const angle = Math.random() * 2 * Math.PI;
      const newX = updatedCustomer.position.x + Math.cos(angle) * moveDistance;
      const newY = updatedCustomer.position.y + Math.sin(angle) * moveDistance;
      
      // Keep within bounds
      const boundedX = Math.max(40, Math.min(260, newX));
      const boundedY = Math.max(40, Math.min(360, newY));
      
      updatedCustomer.position = { x: boundedX, y: boundedY };
    }
    
    // Customers being served should not move at all
    if (updatedCustomer.orderStatus === "being_served" || updatedCustomer.orderStatus === "ordering") {
      // Lock position while being served - no movement allowed
    }
    
    updatedCustomer.stayDuration -= deltaTime;
    
    return updatedCustomer;
  };
  
  const updateStaff = (staff: Staff, deltaTime: number, state: GameState): Staff => {
    const updatedStaff = { ...staff };
    const MOVE_SPEED = 80; // pixels per second - slightly slower for better visual
    
    // First, check if the customer we're serving still exists and is valid
    if (updatedStaff.servingCustomerId) {
      const customer = state.customers.find(c => c.id === updatedStaff.servingCustomerId);
      if (!customer || customer.orderStatus === "leaving") {
        // Customer is gone, reset staff to idle
        console.log(`Staff ${updatedStaff.id}: Customer ${updatedStaff.servingCustomerId} is gone, resetting to idle`);
        updatedStaff.state = "idle";
        updatedStaff.servingCustomerId = undefined;
        updatedStaff.targetPosition = undefined;
        updatedStaff.actionTimer = 0;
        updatedStaff.customerPosition = undefined;
        return updatedStaff;
      }
    }
    
    switch (updatedStaff.state) {
      case "walking_to_customer":
        if (updatedStaff.targetPosition) {
          const dx = updatedStaff.targetPosition.x - updatedStaff.position.x;
          const dy = updatedStaff.targetPosition.y - updatedStaff.position.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 8) {
            // Reached customer
            updatedStaff.position = { ...updatedStaff.targetPosition };
            updatedStaff.targetPosition = undefined;
            
            // Check if this is the first visit (taking order) or delivery
            const customer = state.customers.find(c => c.id === updatedStaff.servingCustomerId);
            if (customer) {
              if (customer.orderStatus === "ordering") {
                // First visit - take the order
                customer.orderStatus = "being_served";
                console.log(`Staff ${updatedStaff.id}: Reached customer ${customer.id}, taking order`);
                
                // Now go to coffee machine
                updatedStaff.state = "walking_to_machine";
                updatedStaff.targetPosition = { x: 50, y: 50 }; // Coffee machine position
                updatedStaff.actionTimer = 0;
              } else if (customer.orderStatus === "being_served") {
                // Second visit - delivering the order
                console.log(`Staff ${updatedStaff.id}: Delivering order to customer ${customer.id}`);
                updatedStaff.state = "serving";
                updatedStaff.actionTimer = 1.5; // 1.5 seconds to serve
              }
            }
          } else {
            // Keep moving toward customer
            const moveDistance = MOVE_SPEED * deltaTime;
            updatedStaff.position = {
              x: updatedStaff.position.x + (dx / distance) * moveDistance,
              y: updatedStaff.position.y + (dy / distance) * moveDistance
            };
          }
        }
        break;
        
      case "walking_to_machine":
        if (updatedStaff.targetPosition) {
          const dx = updatedStaff.targetPosition.x - updatedStaff.position.x;
          const dy = updatedStaff.targetPosition.y - updatedStaff.position.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 8) {
            // Reached coffee machine
            updatedStaff.position = { ...updatedStaff.targetPosition };
            updatedStaff.targetPosition = undefined;
            updatedStaff.state = "making_coffee";
            updatedStaff.actionTimer = 2.5; // 2.5 seconds to make coffee
            console.log(`Staff ${updatedStaff.id}: Reached coffee machine, making coffee`);
          } else {
            // Keep moving toward machine
            const moveDistance = MOVE_SPEED * deltaTime;
            updatedStaff.position = {
              x: updatedStaff.position.x + (dx / distance) * moveDistance,
              y: updatedStaff.position.y + (dy / distance) * moveDistance
            };
          }
        }
        break;
        
      case "making_coffee":
        updatedStaff.actionTimer -= deltaTime;
        if (updatedStaff.actionTimer <= 0) {
          // Coffee is ready, now go back to customer to deliver
          const customer = state.customers.find(c => c.id === updatedStaff.servingCustomerId);
          if (customer && customer.orderStatus === "being_served") {
            console.log(`Staff ${updatedStaff.id}: Coffee ready, going back to customer ${customer.id}`);
            updatedStaff.state = "walking_to_customer";
            // Use stored customer position (they should stay in place while being served)
            updatedStaff.targetPosition = updatedStaff.customerPosition || { ...customer.position };
            updatedStaff.actionTimer = 0;
          } else {
            // Customer is gone or invalid, reset to idle
            console.log(`Staff ${updatedStaff.id}: Customer gone while making coffee, resetting to idle`);
            updatedStaff.state = "idle";
            updatedStaff.servingCustomerId = undefined;
            updatedStaff.targetPosition = undefined;
            updatedStaff.customerPosition = undefined;
            updatedStaff.actionTimer = 0;
          }
        }
        break;
        
      case "serving":
        updatedStaff.actionTimer -= deltaTime;
        if (updatedStaff.actionTimer <= 0) {
          // Finish serving - complete the customer order
          const customer = state.customers.find(c => c.id === updatedStaff.servingCustomerId);
          if (customer) {
            customer.orderStatus = "served";
            customer.satisfaction = Math.min(100, customer.satisfaction + 30);
            customer.tipAmount = customer.generosity * 5; // Base tip of $5 * generosity
            
            // Add money to accumulated revenue (will be collected by player)
            const totalEarning = customer.tipAmount + 8; // $8 base drink price + tip
            state.accumulatedRevenue += totalEarning;
            state.statistics.totalMoneyEarned += totalEarning;
            
            console.log(`Staff ${updatedStaff.id}: Finished serving customer ${customer.id}, earned ${totalEarning.toFixed(2)}`);
          }
          
          // Always reset staff to idle after serving
          updatedStaff.state = "idle";
          updatedStaff.servingCustomerId = undefined;
          updatedStaff.targetPosition = undefined;
          updatedStaff.actionTimer = 0;
          updatedStaff.customerPosition = undefined;
        }
        break;
        
      case "idle":
        // Ensure idle staff have no assignments
        if (updatedStaff.servingCustomerId || updatedStaff.targetPosition) {
          updatedStaff.servingCustomerId = undefined;
          updatedStaff.targetPosition = undefined;
          updatedStaff.actionTimer = 0;
          updatedStaff.customerPosition = undefined;
        }
        break;
    }
    
    return updatedStaff;
  };

  const calculateRevenue = (state: GameState): number => {
    const baseRevenue = 1; // $1 per second base
    const customerMultiplier = state.customers.length * 0.5;
    const catHappinessAvg = state.cats.length > 0
      ? state.cats.reduce((sum, cat) => sum + cat.happiness, 0) / state.cats.length / 100
      : 0.5;
    const reputationMultiplier = state.reputation / 50;
    
    // Coffee tier bonus
    const coffeeBonus = state.unlockedCoffeeTiers.length * 0.3;
    
    // Facility upgrades bonus
    const facilityBonus = Object.values(state.upgrades.facilities).reduce((sum, level) => sum + level * 0.1, 0);
    
    // Event multipliers
    let eventMultiplier = 1;
    state.events.forEach(event => {
      if (event.type === 'catTalentShow') eventMultiplier *= 3;
      if (event.type === 'viralVideo') eventMultiplier *= 2;
      if (event.type === 'spilledCoffee') eventMultiplier *= 0.5;
    });
    
    return baseRevenue * (1 + customerMultiplier + coffeeBonus + facilityBonus) * catHappinessAvg * reputationMultiplier * eventMultiplier;
  };

  const triggerRandomEvent = (): Event | null => {
    const events = Object.entries(RANDOM_EVENTS);
    const event = events[Math.floor(Math.random() * events.length)];
    
    if (Math.random() < event[1].probability) {
      return {
        id: Date.now().toString(),
        type: event[0],
        message: event[1].message,
        duration: event[1].duration,
        startTime: Date.now(),
      };
    }
    
    return null;
  };
  
  const applyEventEffects = (state: GameState, event: Event) => {
    const eventData = RANDOM_EVENTS[event.type as keyof typeof RANDOM_EVENTS];
    if (!eventData) return;
    
    // Apply event effects based on type
    switch (event.type) {
      case 'viralVideo':
        state.reputation = Math.min(100, state.reputation + 10);
        break;
      case 'catTalentShow':
        // Tip multiplier is handled in revenue calculation
        break;
      case 'spilledCoffee':
        state.money = Math.max(0, state.money - 50);
        break;
    }
  };
  
  const removeEventEffects = (state: GameState, event: Event) => {
    // Clean up any temporary effects when event ends
  };
  
  const calculateOfflineProgress = (lastSaveTime: number, currentTime: number, cats: Cat[], upgrades: any) => {
    const hoursAway = (currentTime - lastSaveTime) / (1000 * 60 * 60);
    const maxOfflineHours = 12; // Maximum 12 hours of offline progress
    const effectiveHours = Math.min(hoursAway, maxOfflineHours);
    
    // Calculate offline earnings (reduced rate)
    const baseHourlyRate = 50; // $50 per hour base
    const catBonus = cats.length * 10; // $10 per cat per hour
    const upgradeBonus = Object.values(upgrades.facilities || {}).reduce((sum: number, level: any) => sum + (level * 5), 0);
    
    const hourlyRate = baseHourlyRate + catBonus + upgradeBonus;
    const earnings = Math.floor(hourlyRate * effectiveHours * 0.5); // 50% efficiency offline
    const passiveRevenue = Math.floor(hourlyRate * effectiveHours * 0.2); // Additional passive income
    
    // Cat state changes
    const hungerIncrease = Math.min(50, effectiveHours * 8); // Hunger increases slower offline
    const happinessDecrease = Math.min(30, effectiveHours * 5); // Happiness decreases slower offline
    const energyChange = 0; // Energy stays neutral offline
    
    return {
      earnings,
      passiveRevenue,
      hungerIncrease,
      happinessDecrease,
      energyChange,
      hoursAway: effectiveHours,
    };
  };

  const checkAchievements = (state: GameState) => {
    ACHIEVEMENTS.forEach(achievement => {
      if (state.achievements.includes(achievement.id)) return;
      
      let completed = false;
      switch (achievement.id) {
        case 'first_cat':
          completed = state.cats.length > 0;
          break;
        case 'first_upgrade':
          completed = Object.values(state.upgrades.facilities).some(level => level > 0);
          break;
        case 'ten_customers':
          completed = state.statistics.totalCustomersServed >= 10;
          break;
        case 'cat_colony':
          completed = state.cats.length >= 20;
          break;
        case 'five_star':
          completed = state.reputation >= 100;
          break;
        case 'millionaire':
          completed = state.statistics.totalMoneyEarned >= 1000000;
          break;
      }
      
      if (completed) {
        state.achievements.push(achievement.id);
        state.money += achievement.reward;
      }
    });
  };

  const loadGame = async () => {
    try {
      const savedGame = await AsyncStorage.getItem("@game_save");
      if (savedGame) {
        const parsed = JSON.parse(savedGame);
        console.log("Loading saved game from:", new Date(parsed.lastSaveTime || Date.now()).toLocaleString());
        console.log("Saved cats:", parsed.cats?.length || 0);
        
        // Ensure all required properties exist with defaults
        const completeState: GameState = {
          ...initialGameState,
          ...parsed,
          // Preserve the original lastSaveTime for offline calculation
          lastSaveTime: parsed.lastSaveTime || Date.now(),
          // Clear temporary states that shouldn't persist
          customers: [],
          poops: [],
          events: [],
          // Ensure cats are properly loaded with all required properties
          cats: (parsed.cats || [createStarterCat()]).map((cat: any, index: number) => {
            const validCat: Cat = {
              id: cat.id || `cat-${Date.now()}-${index}`,
              name: cat.name || CAT_NAMES[Math.floor(Math.random() * CAT_NAMES.length)],
              personality: cat.personality || Object.keys(CAT_PERSONALITIES)[0],
              color: cat.color || CAT_COLORS[0].hex,
              age: typeof cat.age === 'number' ? cat.age : 7,
              health: typeof cat.health === 'number' ? cat.health : 100,
              happiness: typeof cat.happiness === 'number' ? cat.happiness : 90,
              energy: typeof cat.energy === 'number' ? cat.energy : 100,
              hunger: typeof cat.hunger === 'number' ? cat.hunger : 20,
              state: cat.state || "lounging",
              adoptable: typeof cat.adoptable === 'boolean' ? cat.adoptable : false,
              position: cat.position && typeof cat.position.x === 'number' && typeof cat.position.y === 'number' 
                ? cat.position 
                : {
                    x: 60 + (index * 80) % 240,
                    y: 60 + Math.floor(index / 3) * 80,
                  },
            };
            return validCat;
          }),
          // Ensure staff exists
          staff: parsed.staff && Array.isArray(parsed.staff) && parsed.staff.length > 0 
            ? parsed.staff.map((staff: any) => ({
                ...createStaff(),
                ...staff,
                // Reset staff state to avoid issues
                state: "idle",
                servingCustomerId: undefined,
                targetPosition: undefined,
                actionTimer: 0,
                customerPosition: undefined,
              }))
            : [createStaff()],
        };
        
        // Ensure we have at least one cat
        if (completeState.cats.length === 0) {
          completeState.cats = [createStarterCat()];
        }
        
        setGameState(completeState);
        console.log("Game loaded successfully with", completeState.cats.length, "cats and $", completeState.money.toFixed(2));
        console.log("Loaded cats:", completeState.cats.map(cat => ({ id: cat.id, name: cat.name })));
      } else {
        console.log("No saved game found, starting fresh");
        const freshState = {
          ...initialGameState,
          lastSaveTime: Date.now(),
        };
        setGameState(freshState);
        console.log("Started fresh game with", freshState.cats.length, "cats");
      }
    } catch (error) {
      console.error("Failed to load game:", error);
      // If loading fails, start with initial state
      const fallbackState = {
        ...initialGameState,
        lastSaveTime: Date.now(),
      };
      setGameState(fallbackState);
      console.log("Fallback to initial state with", fallbackState.cats.length, "cats");
    }
  };



  const resetGame = async () => {
    try {
      await AsyncStorage.removeItem("@game_save");
      setGameState({
        ...initialGameState,
        lastSaveTime: Date.now(),
      });
      console.log("Game reset successfully");
    } catch (error) {
      console.error("Failed to reset game:", error);
    }
  };

  const collectRevenue = () => {
    setGameState(prev => ({
      ...prev,
      money: prev.money + prev.accumulatedRevenue,
      accumulatedRevenue: 0,
    }));
  };
  
  const collectTips = () => {
    setGameState(prev => ({
      ...prev,
      money: prev.money + prev.accumulatedTips,
      accumulatedTips: 0,
    }));
  };

  const purchaseUpgrade = (category: string, type: string, level: number) => {
    const upgrade = UPGRADES[category as keyof typeof UPGRADES];
    if (!upgrade) return;

    const item = Array.isArray(upgrade) 
      ? upgrade[level - 1]
      : upgrade[type as keyof typeof upgrade]?.[level - 1];
    
    if (!item) return;

    setGameState(prev => {
      if (prev.money < item.cost) return prev;
      
      const newState = { ...prev };
      newState.money -= item.cost;
      
      if (category === "facilities") {
        newState.upgrades.facilities = {
          ...newState.upgrades.facilities,
          [type]: level,
        };
      } else if (category === "food") {
        newState.upgrades.food = {
          ...newState.upgrades.food,
          [type]: level,
        };
      } else if (category === "staff") {
        newState.upgrades.staff = level;
      }
      
      return newState;
    });
  };

  const adoptCat = () => {
    const personalities = Object.keys(CAT_PERSONALITIES);
    const personality = personalities[Math.floor(Math.random() * personalities.length)];
    const name = CAT_NAMES[Math.floor(Math.random() * CAT_NAMES.length)];
    const color = CAT_COLORS[Math.floor(Math.random() * CAT_COLORS.length)].hex;
    
    const newCat: Cat = {
      id: Date.now().toString(),
      name,
      personality,
      color,
      age: 0,
      health: 100,
      happiness: 80,
      energy: 100,
      hunger: 30,
      state: "lounging",
      adoptable: false,
      position: {
        x: 60 + Math.random() * 240, // Better spacing for new cats
        y: 60 + Math.random() * 340,
      },
    };
    
    const cost = 100 + (gameState.cats.length * 50);
    
    setGameState(prev => ({
      ...prev,
      money: prev.money - cost,
      cats: [...prev.cats, newCat],
    }));
  };

  const adoptCatOut = (catId: string) => {
    const cat = gameState.cats.find(c => c.id === catId);
    if (!cat) return;
    
    const adoptionFee = 50 + (cat.age * 2) + (cat.health * 1.5) + (cat.happiness * 1.2);
    
    setGameState(prev => ({
      ...prev,
      money: prev.money + adoptionFee,
      cats: prev.cats.filter(c => c.id !== catId),
      statistics: {
        ...prev.statistics,
        catsAdopted: prev.statistics.catsAdopted + 1,
      },
    }));
  };

  const feedCat = (catId: string) => {
    setGameState(prev => ({
      ...prev,
      cats: prev.cats.map(cat => 
        cat.id === catId 
          ? { ...cat, hunger: Math.max(0, cat.hunger - 50), health: Math.min(100, cat.health + 10) }
          : cat
      ),
      money: prev.money - 5,
    }));
  };

  const playCat = (catId: string) => {
    setGameState(prev => ({
      ...prev,
      cats: prev.cats.map(cat => 
        cat.id === catId 
          ? { ...cat, happiness: Math.min(100, cat.happiness + 30), energy: Math.max(0, cat.energy - 20) }
          : cat
      ),
    }));
  };

  const renameCat = (catId: string, newName: string) => {
    setGameState(prev => ({
      ...prev,
      cats: prev.cats.map(cat => 
        cat.id === catId ? { ...cat, name: newName } : cat
      ),
    }));
  };

  const unlockCoffeeTier = (tier: string) => {
    const tierData = COFFEE_MENU[tier as keyof typeof COFFEE_MENU];
    if (!tierData) return;
    
    setGameState(prev => ({
      ...prev,
      money: prev.money - tierData.unlockCost,
      unlockedCoffeeTiers: [...prev.unlockedCoffeeTiers, tier],
    }));
  };

  const toggleSound = () => {
    setGameState(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        soundEnabled: !prev.settings.soundEnabled,
      },
    }));
  };

  const toggleNotifications = () => {
    setGameState(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        notificationsEnabled: !prev.settings.notificationsEnabled,
      },
    }));
  };
  
  const serveCustomer = (customerId: string) => {
    setGameState(prev => {
      const customer = prev.customers.find(c => c.id === customerId);
      const availableStaff = prev.staff.find(s => s.state === "idle");
      
      if (!customer || !availableStaff || customer.orderStatus !== "waiting") {
        console.log(`Cannot serve customer ${customerId}: customer=${!!customer}, staff=${!!availableStaff}, status=${customer?.orderStatus}`);
        return prev;
      }
      
      console.log(`Starting service for customer ${customerId} with staff ${availableStaff.id}`);
      
      // Create a deep copy to avoid mutation issues
      const newState = {
        ...prev,
        customers: prev.customers.map(c => ({ ...c })),
        staff: prev.staff.map(s => ({ ...s }))
      };
      
      // Update customer - they are now being processed
      const customerIndex = newState.customers.findIndex(c => c.id === customerId);
      if (customerIndex !== -1) {
        newState.customers[customerIndex] = {
          ...newState.customers[customerIndex],
          orderStatus: "ordering" as const
        };
      }
      
      // Update staff - assign them to serve this customer
      const staffIndex = newState.staff.findIndex(s => s.id === availableStaff.id);
      if (staffIndex !== -1) {
        newState.staff[staffIndex] = {
          ...newState.staff[staffIndex],
          state: "walking_to_customer" as const,
          targetPosition: { ...customer.position }, // Go to customer first
          servingCustomerId: customerId,
          actionTimer: 0,
          customerPosition: { ...customer.position } // Store customer position for later delivery
        };
      }
      
      return newState;
    });
  };
  
  const cleanPoop = (poopId: string) => {
    setGameState(prev => ({
      ...prev,
      poops: prev.poops.filter(p => p.id !== poopId),
      money: prev.money - 2, // Cleaning costs $2
    }));
  };

  const getOfflineProgress = useCallback(() => {
    if (!gameState.lastSaveTime) return null;
    
    const currentTime = Date.now();
    const timeDiff = currentTime - gameState.lastSaveTime;
    const hoursAway = timeDiff / (1000 * 60 * 60);
    
    // Only show offline progress if away for more than 5 minutes
    if (hoursAway < 0.083) return null;
    
    return calculateOfflineProgress(gameState.lastSaveTime, currentTime, gameState.cats, gameState.upgrades);
  }, [gameState.lastSaveTime, gameState.cats, gameState.upgrades]);
  
  const applyOfflineProgress = useCallback(() => {
    const offlineProgress = getOfflineProgress();
    if (!offlineProgress) return null;
    
    setGameState(prev => {
      const newState = { ...prev };
      
      // Apply offline earnings
      newState.money += offlineProgress.earnings;
      newState.accumulatedRevenue += offlineProgress.passiveRevenue;
      newState.statistics.totalMoneyEarned += offlineProgress.earnings + offlineProgress.passiveRevenue;
      
      // Update cat states
      newState.cats = newState.cats.map(cat => ({
        ...cat,
        hunger: Math.min(100, cat.hunger + offlineProgress.hungerIncrease),
        happiness: Math.max(0, cat.happiness - offlineProgress.happinessDecrease),
        energy: Math.min(100, Math.max(0, cat.energy + offlineProgress.energyChange)),
      }));
      
      // Update last save time
      newState.lastSaveTime = Date.now();
      
      return newState;
    });
    
    return offlineProgress;
  }, [getOfflineProgress]);

  return {
    gameState,
    collectRevenue,
    collectTips,
    purchaseUpgrade,
    adoptCat,
    adoptCatOut,
    feedCat,
    playCat,
    renameCat,
    unlockCoffeeTier,
    saveGame,
    resetGame,
    toggleSound,
    toggleNotifications,
    serveCustomer,
    cleanPoop,
    getOfflineProgress,
    applyOfflineProgress,
  };
});