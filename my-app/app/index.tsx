import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Index = () => {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const heroWidth = Math.min(width - 40, 420);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <View style={styles.screen}>
        <View style={[styles.heroCard, { width: heroWidth }]}>
          <View style={styles.heroGlow} />
          <View style={styles.iconWrap}>
            <MaterialCommunityIcons name="message" size={34} color="#2A7BFF" />
          </View>

          <Image
            source={require("../assets/images/partial-react-logo.png")}
            style={styles.heroWave}
            resizeMode="cover"
          />
          <View style={styles.heroOverlay} />
        </View>

        <View style={styles.textBlock}>
          <Text style={styles.title}>Chat Freely.</Text>
          <Text style={styles.subtitle}>
            The world&apos;s fastest and most secure messaging app. Connect instantly
            with friends, family, and colleagues.
          </Text>
        </View>

        <View style={[styles.ctaBlock, { width: heroWidth }]}>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push("/signup")}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.primaryButtonText}>Get Started</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() => router.push("/login")}
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.secondaryButtonText}>
              I already have an account
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#061220",
  },
  screen: {
    flex: 1,
    backgroundColor: "#061220",
    paddingHorizontal: 20,
    paddingTop: 12,
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 24,
  },
  heroCard: {
    height: 360,
    borderRadius: 28,
    backgroundColor: "#091B2E",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    overflow: "hidden",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 18,
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
  heroGlow: {
    position: "absolute",
    top: -80,
    left: -80,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(42,123,255,0.18)",
  },
  iconWrap: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    zIndex: 2,
  },
  heroWave: {
    position: "absolute",
    left: -40,
    right: -40,
    bottom: -80,
    height: 320,
    opacity: 0.55,
    transform: [{ rotate: "-12deg" }],
  },
  heroOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    backgroundColor: "rgba(0,0,0,0.18)",
  },
  textBlock: {
    alignItems: "center",
    paddingHorizontal: 10,
    marginTop: 18,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 40,
    lineHeight: 44,
    fontWeight: "800",
    letterSpacing: -0.6,
    textAlign: "center",
  },
  subtitle: {
    marginTop: 10,
    color: "rgba(255,255,255,0.65)",
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    maxWidth: 520,
  },
  ctaBlock: {
    alignItems: "center",
    gap: 12,
  },
  primaryButton: {
    width: "100%",
    height: 56,
    borderRadius: 28,
    backgroundColor: "#1D6DFF",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryButton: {
    width: "100%",
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    color: "rgba(255,255,255,0.90)",
    fontSize: 15,
    fontWeight: "600",
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
});

export default Index;