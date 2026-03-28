import { Tabs } from "expo-router";
import { Coffee, Cat, TrendingUp, Trophy, Settings } from "lucide-react-native";
import React from "react";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#8B4513",
        tabBarInactiveTintColor: "#999",
        tabBarStyle: {
          backgroundColor: "#FFF8F0",
          borderTopColor: "#E5D4B1",
          borderTopWidth: 1,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="(cafe)"
        options={{
          title: "Café",
          tabBarIcon: ({ color }) => <Coffee size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="cats"
        options={{
          title: "Cats",
          tabBarIcon: ({ color }) => <Cat size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="upgrades"
        options={{
          title: "Upgrades",
          tabBarIcon: ({ color }) => <TrendingUp size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="achievements"
        options={{
          title: "Achievements",
          tabBarIcon: ({ color }) => <Trophy size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => <Settings size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}