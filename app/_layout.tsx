import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { GameProvider } from "@/providers/GameProvider";
import { EventManagementProvider } from "@/providers/EventManagementProvider";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="cat/[id]" options={{ presentation: "modal", title: "Cat Details" }} />
      <Stack.Screen name="adopt/[id]" options={{ presentation: "modal", title: "Adopt Cat" }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView>
        <EventManagementProvider>
          <GameProvider>
            <RootLayoutNav />
          </GameProvider>
        </EventManagementProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}