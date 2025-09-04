import { useCallback, useMemo } from "react";
import createContextHook from "@nkzw/create-context-hook";
import { Staff, GameState } from "@/types/game";
import { useGameState } from "./GameStateProvider";

export const [StaffManagementProvider, useStaffManagement] = createContextHook(() => {
  const { setGameState } = useGameState();

  const updateStaff = useCallback((staff: Staff, deltaTime: number, state: GameState): Staff => {
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
  }, []);

  const updateAllStaff = useCallback((deltaTime: number) => {
    setGameState(prev => {
      const newState = { ...prev };
      
      // Update staff
      newState.staff = newState.staff.map(staff => updateStaff(staff, deltaTime, newState));
      
      return newState;
    });
  }, [updateStaff, setGameState]);

  return useMemo(() => ({
    updateStaff,
    updateAllStaff,
  }), [updateStaff, updateAllStaff]);
});