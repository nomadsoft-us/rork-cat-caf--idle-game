import { useCallback } from "react";
import createContextHook from "@nkzw/create-context-hook";
import { GameState, Event } from "@/types/game";
import { RANDOM_EVENTS } from "@/constants/gameData";

export const [EventManagementProvider, useEventManagement] = createContextHook(() => {
  const triggerRandomEvent = useCallback((): Event | null => {
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
  }, []);
  
  const applyEventEffects = useCallback((state: GameState, event: Event) => {
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
  }, []);
  
  const removeEventEffects = useCallback((state: GameState, event: Event) => {
    // Clean up any temporary effects when event ends
  }, []);
  
  const processEvents = useCallback((state: GameState, deltaTime: number) => {
    // Random events
    if (Math.random() < 0.001) {
      const event = triggerRandomEvent();
      if (event) {
        state.events.push(event);
        applyEventEffects(state, event);
      }
    }
    
    // Process active events
    state.events = state.events.filter(event => {
      const isActive = Date.now() - event.startTime < event.duration * 1000;
      if (!isActive) {
        removeEventEffects(state, event);
      }
      return isActive;
    });
  }, [triggerRandomEvent, applyEventEffects, removeEventEffects]);
  
  const getEventMultiplier = useCallback((events: Event[]): number => {
    let eventMultiplier = 1;
    events.forEach(event => {
      if (event.type === 'catTalentShow') eventMultiplier *= 3;
      if (event.type === 'viralVideo') eventMultiplier *= 2;
      if (event.type === 'spilledCoffee') eventMultiplier *= 0.5;
    });
    return eventMultiplier;
  }, []);

  return {
    triggerRandomEvent,
    applyEventEffects,
    removeEventEffects,
    processEvents,
    getEventMultiplier,
  };
});