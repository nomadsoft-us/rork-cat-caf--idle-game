export interface Cat {
  id: string;
  name: string;
  personality: string;
  color: string;
  age: number;
  health: number;
  happiness: number;
  energy: number;
  hunger: number;
  state: "sleeping" | "eating" | "playing" | "lounging";
  adoptable: boolean;
  position: {
    x: number;
    y: number;
  };
}

export interface Customer {
  id: string;
  type: string;
  generosity: number;
  stayDuration: number;
  satisfaction: number;
  position: {
    x: number;
    y: number;
  };
  orderStatus: "waiting" | "ordering" | "being_served" | "served" | "leaving";
  orderTimer: number;
  drinkType?: string;
  tipAmount: number;
}

export interface Event {
  id: string;
  type: string;
  message: string;
  duration: number;
  startTime: number;
}

export interface Poop {
  id: string;
  position: {
    x: number;
    y: number;
  };
  timeCreated: number;
}

export interface Staff {
  id: string;
  position: {
    x: number;
    y: number;
  };
  state: "idle" | "walking_to_machine" | "making_coffee" | "walking_to_customer" | "serving";
  targetPosition?: {
    x: number;
    y: number;
  };
  servingCustomerId?: string;
  actionTimer: number;
  customerPosition?: {
    x: number;
    y: number;
  };
}

export interface GameState {
  money: number;
  reputation: number;
  prestigeLevel: number;
  cats: Cat[];
  customers: Customer[];
  poops: Poop[];
  staff: Staff[];
  cleanliness: number;
  upgrades: {
    facilities: {
      seating: number;
      catAreas: number;
      playArea: number;
    };
    food: {
      quality: number;
      treats: number;
    };
    staff: number;
  };
  unlockedCoffeeTiers: string[];
  statistics: {
    totalMoneyEarned: number;
    totalCustomersServed: number;
    catsAdopted: number;
    timePlayed: number;
  };
  achievements: string[];
  events: Event[];
  settings: {
    soundEnabled: boolean;
    notificationsEnabled: boolean;
  };
  lastSaveTime: number;
  accumulatedRevenue: number;
  accumulatedTips: number;
}