import { useCallback, useMemo } from "react";
import createContextHook from "@nkzw/create-context-hook";
import { Cat } from "@/types/game";
import { CAT_PERSONALITIES, CAT_NAMES, CAT_COLORS } from "@/constants/gameData";
import { useGameState } from "./GameStateProvider";

export const [CatManagementProvider, useCatManagement] = createContextHook(() => {
  const { gameState, setGameState } = useGameState();

  const isPositionValid = useCallback((position: { x: number; y: number }, minDistance: number): boolean => {
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
  }, [gameState.cats, gameState.customers, gameState.poops, gameState.staff]);

  const isPositionValidForCat = useCallback((position: { x: number; y: number }, catId: string, minDistance: number): boolean => {
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
  }, [gameState.cats, gameState.customers, gameState.poops, gameState.staff]);

  const updateCatState = useCallback((cat: Cat, deltaTime: number): Cat => {
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
  }, [isPositionValidForCat]);

  const adoptCat = useCallback(() => {
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
  }, [gameState.cats.length, setGameState]);

  const adoptCatOut = useCallback((catId: string) => {
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
  }, [gameState.cats, setGameState]);

  const feedCat = useCallback((catId: string) => {
    setGameState(prev => ({
      ...prev,
      cats: prev.cats.map(cat => 
        cat.id === catId 
          ? { ...cat, hunger: Math.max(0, cat.hunger - 50), health: Math.min(100, cat.health + 10) }
          : cat
      ),
      money: prev.money - 5,
    }));
  }, [setGameState]);

  const playCat = useCallback((catId: string) => {
    setGameState(prev => ({
      ...prev,
      cats: prev.cats.map(cat => 
        cat.id === catId 
          ? { ...cat, happiness: Math.min(100, cat.happiness + 30), energy: Math.max(0, cat.energy - 20) }
          : cat
      ),
    }));
  }, [setGameState]);

  const renameCat = useCallback((catId: string, newName: string) => {
    setGameState(prev => ({
      ...prev,
      cats: prev.cats.map(cat => 
        cat.id === catId ? { ...cat, name: newName } : cat
      ),
    }));
  }, [setGameState]);

  const updateAllCats = useCallback((deltaTime: number) => {
    setGameState(prev => {
      const newState = { ...prev };
      
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

      return newState;
    });
  }, [updateCatState, isPositionValid, setGameState]);

  return useMemo(() => ({
    updateCatState,
    isPositionValidForCat,
    adoptCat,
    adoptCatOut,
    feedCat,
    playCat,
    renameCat,
    updateAllCats,
    isPositionValid,
  }), [updateCatState, isPositionValidForCat, adoptCat, adoptCatOut, feedCat, playCat, renameCat, updateAllCats, isPositionValid]);
});