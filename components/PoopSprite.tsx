import React, { useEffect, useRef } from "react";
import { TouchableOpacity, Text, StyleSheet, Animated } from "react-native";
import { Poop } from "@/types/game";

interface PoopSpriteProps {
  poop: Poop;
  onPress?: () => void;
}

export default function PoopSprite({ poop, onPress }: PoopSpriteProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  useEffect(() => {
    // Initial spawn animation
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start();
    
    // Pulsing animation to draw attention
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    
    const timer = setTimeout(() => {
      pulse.start();
    }, 2000); // Start pulsing after 2 seconds
    
    return () => {
      clearTimeout(timer);
      pulse.stop();
    };
  }, [scaleAnim, pulseAnim]);
  
  const age = Date.now() - poop.timeCreated;
  const isOld = age > 30000; // 30 seconds old
  
  return (
    <TouchableOpacity 
      style={[styles.container, { left: poop.position.x, top: poop.position.y }]}
      onPress={onPress}
    >
      <Animated.View style={{
        transform: [{ scale: scaleAnim }, { scale: pulseAnim }]
      }}>
        <Text style={[styles.emoji, isOld && styles.oldPoop]}>💩</Text>
      </Animated.View>
      {isOld && (
        <Text style={styles.stinkLines}>💨</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  emoji: {
    fontSize: 20,
  },
  oldPoop: {
    opacity: 0.8,
  },
  stinkLines: {
    position: "absolute",
    top: -10,
    right: -5,
    fontSize: 16,
    opacity: 0.7,
  },
});