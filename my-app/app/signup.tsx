import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { authService } from "../services/AuthService";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Signup() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    return (
      fullName.trim().length > 0 &&
      email.trim().length > 0 &&
      password.length >= 8 &&
      !isLoading
    );
  }, [email, fullName, password, isLoading]);

  const handleSignup = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await authService.signup(fullName, email, password);
      router.replace("/chats");
    } catch (err: any) {
      setError(err.message || "Signup failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const strength = useMemo(() => {
    const p = password;
    if (!p) return 0;
    let score = 0;
    if (p.length >= 6) score += 1;
    if (p.length >= 10) score += 1;
    if (/[A-Z]/.test(p) && /[a-z]/.test(p)) score += 1;
    if (/\d/.test(p)) score += 1;
    if (/[^A-Za-z0-9]/.test(p)) score += 1;
    return Math.min(score, 4);
  }, [password]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.select({ ios: "padding", android: undefined })}
      >
        <View style={styles.topBar}>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.back()}
            hitSlop={10}
            style={styles.backButton}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={22}
              color="rgba(255,255,255,0.90)"
            />
          </Pressable>
          <Text style={styles.topTitle}>Create Account</Text>
          <View style={{ width: 36 }} />
        </View>

        <View style={styles.headerIcon}>
          <MaterialCommunityIcons name="message" size={28} color="#2A7BFF" />
        </View>

        <View style={styles.headerTextBlock}>
          <Text style={styles.title}>Join the conversation</Text>
          <Text style={styles.subtitle}>Sign up to start chatting with friends.</Text>
        </View>

        {error && (
          <View style={styles.errorBanner}>
            <MaterialCommunityIcons name="alert-circle" size={18} color="#FF6B6B" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.form}>
          <Text style={styles.label}>Full Name</Text>
          <View style={styles.inputWrap}>
            <MaterialCommunityIcons
              name="account-outline"
              size={20}
              color="rgba(255,255,255,0.60)"
            />
            <TextInput
              value={fullName}
              onChangeText={setFullName}
              placeholder="e.g. Alex Morgan"
              placeholderTextColor="rgba(255,255,255,0.35)"
              autoCapitalize="words"
              autoCorrect={false}
              style={styles.input}
            />
          </View>

          <Text style={[styles.label, { marginTop: 16 }]}>Email Address</Text>
          <View style={styles.inputWrap}>
            <MaterialCommunityIcons
              name="email-outline"
              size={20}
              color="rgba(255,255,255,0.60)"
            />
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="name@example.com"
              placeholderTextColor="rgba(255,255,255,0.35)"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              style={styles.input}
            />
          </View>

          <Text style={[styles.label, { marginTop: 16 }]}>Password</Text>
          <View style={styles.inputWrap}>
            <MaterialCommunityIcons
              name="lock-outline"
              size={20}
              color="rgba(255,255,255,0.60)"
            />
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Create a strong password"
              placeholderTextColor="rgba(255,255,255,0.35)"
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry={!passwordVisible}
              style={styles.input}
            />
            <Pressable
              accessibilityRole="button"
              onPress={() => setPasswordVisible((v) => !v)}
              hitSlop={10}
            >
              <MaterialCommunityIcons
                name={passwordVisible ? "eye-off-outline" : "eye-outline"}
                size={20}
                color="rgba(255,255,255,0.60)"
              />
            </Pressable>
          </View>

          <View style={styles.strengthRow}>
            {[0, 1, 2, 3].map((i) => {
              const active = strength > i;
              return (
                <View
                  key={i}
                  style={[
                    styles.strengthBar,
                    active && styles.strengthBarActive,
                  ]}
                />
              );
            })}
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={handleSignup}
            style={({ pressed }) => [
              styles.primaryButton,
              !canSubmit && styles.primaryButtonDisabled,
              pressed && canSubmit && styles.buttonPressed,
            ]}
            disabled={!canSubmit}
          >
            <Text style={styles.primaryButtonText}>
              {isLoading ? "Creating Account..." : "Sign Up"}
            </Text>
          </Pressable>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialRow}>
            <Pressable
              accessibilityRole="button"
              onPress={() => { }}
              style={({ pressed }) => [
                styles.socialButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <MaterialCommunityIcons
                name="apple"
                size={22}
                color="rgba(255,255,255,0.95)"
              />
              <Text style={styles.socialText}>Apple</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={() => { }}
              style={({ pressed }) => [
                styles.socialButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <MaterialCommunityIcons
                name="google"
                size={20}
                color="rgba(255,255,255,0.90)"
              />
              <Text style={styles.socialText}>Google</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push("/login")}
          >
            <Text style={styles.footerLink}> Log In</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#061220",
  },
  screen: {
    flex: 1,
    backgroundColor: "#061220",
    paddingHorizontal: 22,
    paddingBottom: 18,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 8,
    paddingBottom: 10,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },
  topTitle: {
    color: "rgba(255,255,255,0.92)",
    fontSize: 16,
    fontWeight: "700",
  },
  headerIcon: {
    width: 84,
    height: 84,
    borderRadius: 26,
    backgroundColor: "rgba(29,109,255,0.16)",
    borderWidth: 1,
    borderColor: "rgba(42,123,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginTop: 12,
  },
  headerTextBlock: {
    alignItems: "center",
    marginTop: 18,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 34,
    lineHeight: 38,
    fontWeight: "800",
    letterSpacing: -0.6,
    textAlign: "center",
  },
  subtitle: {
    marginTop: 8,
    color: "rgba(255,255,255,0.60)",
    fontSize: 15,
    textAlign: "center",
  },
  form: {
    width: "100%",
    marginTop: 26,
    flex: 1,
  },
  label: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  inputWrap: {
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    paddingHorizontal: 16,
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  input: {
    flex: 1,
    color: "rgba(255,255,255,0.92)",
    fontSize: 15,
  },
  strengthRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
    marginBottom: 20,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  strengthBarActive: {
    backgroundColor: "rgba(42,123,255,0.9)",
  },
  primaryButton: {
    height: 58,
    borderRadius: 29,
    backgroundColor: "#1D6DFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#1D6DFF",
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
    marginTop: 4,
  },
  primaryButtonDisabled: {
    opacity: 0.55,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  dividerRow: {
    marginTop: 22,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.10)",
  },
  dividerText: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 13,
  },
  socialRow: {
    flexDirection: "row",
    gap: 14,
    marginTop: 18,
  },
  socialButton: {
    flex: 1,
    height: 54,
    borderRadius: 27,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
  },
  socialText: {
    color: "rgba(255,255,255,0.90)",
    fontSize: 15,
    fontWeight: "700",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 16,
  },
  footerText: {
    color: "rgba(255,255,255,0.60)",
    fontSize: 14,
  },
  footerLink: {
    color: "#2A7BFF",
    fontSize: 14,
    fontWeight: "700",
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,107,107,0.15)",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 18,
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(255,107,107,0.25)",
  },
  errorText: {
    color: "#FF6B6B",
    fontSize: 13,
    fontWeight: "500",
  },
});
