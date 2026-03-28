import { useCallback, useMemo } from "react";
import createContextHook from "@nkzw/create-context-hook";
import { Customer, GameState } from "@/types/game";
import { CUSTOMER_TYPES } from "@/constants/gameData";
import { useGameState } from "./GameStateProvider";
import { useCatManagement } from "./CatManagementProvider";

export const [CustomerManagementProvider, useCustomerManagement] = createContextHook(() => {
  const { gameState, setGameState } = useGameState();
  const { isPositionValid } = useCatManagement();

  const spawnCustomer = useCallback((): Customer => {
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
  }, [isPositionValid]);

  const updateCustomer = useCallback((customer: Customer, deltaTime: number, state: GameState): Customer => {
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
  }, []);

  const updateAllCustomers = useCallback((deltaTime: number) => {
    setGameState(prev => {
      const newState = { ...prev };
      
      // Spawn customers
      if (Math.random() < 0.01 && newState.customers.length < 10) {
        newState.customers.push(spawnCustomer());
      }

      // Update customers
      newState.customers = newState.customers
        .map(customer => updateCustomer(customer, deltaTime, newState))
        .filter(customer => customer.stayDuration > 0 && customer.orderStatus !== "leaving");
      
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

      return newState;
    });
  }, [spawnCustomer, updateCustomer, setGameState]);

  const serveCustomer = useCallback((customerId: string) => {
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
  }, [setGameState]);

  return useMemo(() => ({
    spawnCustomer,
    updateCustomer,
    updateAllCustomers,
    serveCustomer,
  }), [spawnCustomer, updateCustomer, updateAllCustomers, serveCustomer]);
});