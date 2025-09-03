import { useEffect, useRef, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GameState, Cat } from "@/types/game";
import { CAT_PERSONALITIES, CAT_NAMES, CAT_COLORS } from "@/constants/gameData";

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

const createStaff = () => ({
  id: "staff-1",
  position: { x: 50, y: 100 },
  state: "idle" as const,
  actionTimer: 0,
});

export const initialGameState: GameState = {
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

export const useGamePersistence = (gameState: GameState, setGameState: (state: GameState | ((prev: GameState) => GameState)) => void) => {
  const saveInterval = useRef<any>(null);

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

  // Auto-save interval
  useEffect(() => {
    saveInterval.current = setInterval(() => {
      saveGame();
    }, SAVE_INTERVAL);

    return () => {
      if (saveInterval.current) clearInterval(saveInterval.current);
    };
  }, [saveGame]);

  // Save game when component unmounts
  useEffect(() => {
    return () => {
      saveGame();
    };
  }, [saveGame]);

  return {
    saveGame,
    loadGame,
    resetGame,
  };
};