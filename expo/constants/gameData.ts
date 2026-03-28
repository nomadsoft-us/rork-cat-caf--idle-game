export const CAT_PERSONALITIES = {
  playful: {
    happinessModifier: 1.2,
    energyDecayRate: 1.3,
    tipBonus: 1.15,
    adoptionFeeMultiplier: 1.1,
  },
  lazy: {
    happinessModifier: 1.0,
    energyDecayRate: 0.6,
    tipBonus: 1.05,
    adoptionFeeMultiplier: 0.9,
  },
  cuddly: {
    happinessModifier: 1.1,
    energyDecayRate: 0.9,
    tipBonus: 1.3,
    adoptionFeeMultiplier: 1.3,
  },
  independent: {
    happinessModifier: 0.9,
    energyDecayRate: 0.8,
    tipBonus: 0.95,
    adoptionFeeMultiplier: 1.0,
  },
};

export const CAT_NAMES = [
  "Whiskers", "Mittens", "Shadow", "Luna", "Oreo", "Simba", "Nala",
  "Felix", "Garfield", "Tom", "Snowball", "Midnight", "Patches",
  "Tiger", "Smokey", "Pumpkin", "Mochi", "Biscuit", "Cookie", "Pepper"
];

export const CAT_COLORS = [
  { id: "orange", name: "Orange Tabby", hex: "#FF8C00" },
  { id: "black", name: "Black", hex: "#333333" },
  { id: "white", name: "White", hex: "#F5F5F5" },
  { id: "gray", name: "Gray", hex: "#808080" },
  { id: "calico", name: "Calico", hex: "#FFB347" },
];

export const COFFEE_MENU = {
  tier1: {
    drinks: [
      { id: "plain_coffee", name: "Plain Coffee", price: 3, baseRate: 1, satisfaction: 30 },
      { id: "tea", name: "Tea", price: 2.5, baseRate: 0.8, satisfaction: 25 },
      { id: "hot_chocolate", name: "Hot Chocolate", price: 3.5, baseRate: 1.1, satisfaction: 35 }
    ],
    unlockCost: 0,
    maintenanceCost: 5
  },
  tier2: {
    drinks: [
      { id: "latte", name: "Latte", price: 5, baseRate: 3, satisfaction: 50 },
      { id: "cappuccino", name: "Cappuccino", price: 5.5, baseRate: 3.5, satisfaction: 55 },
      { id: "mocha", name: "Mocha", price: 6, baseRate: 4, satisfaction: 60 },
    ],
    unlockCost: 600,
    maintenanceCost: 20
  },
  tier3: {
    drinks: [
      { id: "cat_puccino", name: "Cat-puccino", price: 8, baseRate: 10, satisfaction: 80 },
      { id: "meowcha", name: "Meowcha", price: 9, baseRate: 12, satisfaction: 85 },
      { id: "purr_brew", name: "Purr Brew", price: 10, baseRate: 15, satisfaction: 90 },
    ],
    unlockCost: 3000,
    maintenanceCost: 50
  }
};

export const UPGRADES = {
  facilities: {
    seating: [
      { level: 1, name: "Basic Benches", cost: 100, capacity: 5, comfort: 20 },
      { level: 2, name: "Plastic Chairs", cost: 300, capacity: 8, comfort: 35 },
      { level: 3, name: "Comfy Sofas", cost: 800, capacity: 12, comfort: 50 },
      { level: 4, name: "Luxury Armchairs", cost: 2000, capacity: 18, comfort: 70 },
      { level: 5, name: "Royal Loungers", cost: 5000, capacity: 25, comfort: 100 }
    ],
    catAreas: [
      { level: 1, name: "Floor Space", cost: 50, catCapacity: 3, happinessBonus: 0 },
      { level: 2, name: "Cat Beds", cost: 200, catCapacity: 6, happinessBonus: 10 },
      { level: 3, name: "Cat Trees", cost: 600, catCapacity: 10, happinessBonus: 25 },
      { level: 4, name: "Cat Towers", cost: 1500, catCapacity: 15, happinessBonus: 40 },
      { level: 5, name: "Cat Palace", cost: 4000, catCapacity: 25, happinessBonus: 60 }
    ],
    playArea: [
      { level: 1, name: "Toy Box", cost: 75, energyBonus: 10, stressReduction: 5 },
      { level: 2, name: "Play Mat", cost: 250, energyBonus: 20, stressReduction: 10 },
      { level: 3, name: "Activity Center", cost: 700, energyBonus: 35, stressReduction: 20 },
      { level: 4, name: "Adventure Zone", cost: 1800, energyBonus: 50, stressReduction: 35 },
      { level: 5, name: "Playground Paradise", cost: 5000, energyBonus: 75, stressReduction: 50 }
    ]
  },
  food: {
    quality: [
      { level: 1, name: "Cheap Kibble", cost: 50, healthBonus: 0, hungerRate: 1.0, dailyCost: 0.5 },
      { level: 2, name: "Standard Food", cost: 150, healthBonus: 10, hungerRate: 0.9, dailyCost: 1 },
      { level: 3, name: "Premium Food", cost: 400, healthBonus: 25, hungerRate: 0.75, dailyCost: 2 },
      { level: 4, name: "Gourmet Diet", cost: 1000, healthBonus: 40, hungerRate: 0.6, dailyCost: 3.5 },
      { level: 5, name: "Royal Feast", cost: 2500, healthBonus: 60, hungerRate: 0.4, dailyCost: 5 }
    ],
    treats: [
      { level: 1, name: "Basic Treats", cost: 30, happinessBoost: 5, duration: 60 },
      { level: 2, name: "Tasty Treats", cost: 100, happinessBoost: 10, duration: 120 },
      { level: 3, name: "Gourmet Treats", cost: 300, happinessBoost: 20, duration: 180 },
      { level: 4, name: "Luxury Treats", cost: 800, happinessBoost: 35, duration: 240 },
      { level: 5, name: "Magical Treats", cost: 2000, happinessBoost: 50, duration: 300 }
    ]
  },
  staff: [
    { level: 0, name: "Solo Operation", cost: 0, autoFeed: false, autoClean: false, autoPlay: false },
    { level: 1, name: "Volunteer Helper", cost: 200, autoFeed: true, autoClean: false, autoPlay: false },
    { level: 2, name: "Part-Time Staff", cost: 800, autoFeed: true, autoClean: true, autoPlay: false },
    { level: 3, name: "Full-Time Staff", cost: 2000, autoFeed: true, autoClean: true, autoPlay: true },
  ]
};

export const CUSTOMER_TYPES = {
  regular: {
    name: "Regular Customer",
    frequency: 0.4,
    generosity: 1.0,
    stayDuration: 180,
  },
  catLover: {
    name: "Cat Enthusiast",
    frequency: 0.25,
    generosity: 1.5,
    stayDuration: 300,
  },
  student: {
    name: "Student",
    frequency: 0.15,
    generosity: 0.7,
    stayDuration: 600,
  },
  businessPerson: {
    name: "Business Person",
    frequency: 0.1,
    generosity: 2.0,
    stayDuration: 120,
  },
};

export const RANDOM_EVENTS = {
  viralVideo: {
    probability: 0.02,
    duration: 300,
    message: "One of your cats went viral! Customers are flooding in!"
  },
  catTalentShow: {
    probability: 0.03,
    duration: 180,
    message: "A cat is performing tricks! Tips are tripled!"
  },
  spilledCoffee: {
    probability: 0.04,
    duration: 120,
    message: "Major coffee spill! Half the café is closed for cleanup!"
  },
};

export const ACHIEVEMENTS = [
  { id: "first_cat", name: "First Friend", requirement: "Adopt your first cat", reward: 50 },
  { id: "first_upgrade", name: "Improving", requirement: "Buy first upgrade", reward: 100 },
  { id: "ten_customers", name: "Popular Spot", requirement: "Serve 10 customers", reward: 150 },
  { id: "cat_colony", name: "Cat Colony", requirement: "Have 20 cats at once", reward: 500 },
  { id: "five_star", name: "Five Stars", requirement: "Reach max reputation", reward: 1000 },
  { id: "millionaire", name: "Millionaire", requirement: "Earn $1,000,000 total", reward: 5000 },
];