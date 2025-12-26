
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

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    return email.trim().length > 0 && password.length > 0 && !isLoading;
  }, [email, password, isLoading]);

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await authService.login(email, password);
      router.replace("/chats");
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.select({ ios: "padding", android: undefined })}
      >
        <View style={styles.headerIcon}>
          <MaterialCommunityIcons name="message" size={28} color="#FFFFFF" />
        </View>

        <View style={styles.headerTextBlock}>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to continue your conversations</Text>
        </View>

        {error && (
          <View style={styles.errorBanner}>
            <MaterialCommunityIcons name="alert-circle" size={18} color="#FF6B6B" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.form}>
          <Text style={styles.label}>Email or Username</Text>
          <View style={styles.inputWrap}>
            <MaterialCommunityIcons
              name="email-outline"
              size={20}
              color="rgba(255,255,255,0.60)"
            />
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
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
              placeholder="Enter your password"
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

          <Pressable
            accessibilityRole="button"
            onPress={() => { }}
            style={styles.forgotWrap}
          >
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={handleLogin}
            style={({ pressed }) => [
              styles.primaryButton,
              !canSubmit && styles.primaryButtonDisabled,
              pressed && canSubmit && styles.buttonPressed,
            ]}
            disabled={!canSubmit}
          >
            <Text style={styles.primaryButtonText}>
              {isLoading ? "Logging in..." : "Log In"}
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
                name="google"
                size={20}
                color="rgba(255,255,255,0.90)"
              />
              <Text style={styles.socialText}>Google</Text>
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
                name="apple"
                size={22}
                color="rgba(255,255,255,0.95)"
              />
              <Text style={styles.socialText}>Apple</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don&apos;t have an account?</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push("/signup")}
          >
            <Text style={styles.footerLink}> Sign Up</Text>
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
    paddingTop: 18,
    paddingBottom: 18,
    alignItems: "center",
  },
  headerIcon: {
    width: 72,
    height: 72,
    borderRadius: 18,
    backgroundColor: "#1D6DFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#1D6DFF",
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
    marginTop: 18,
  },
  headerTextBlock: {
    alignItems: "center",
    marginTop: 18,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 36,
    lineHeight: 40,
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
  forgotWrap: {
    alignSelf: "flex-end",
    marginTop: 12,
    marginBottom: 18,
  },
  forgotText: {
    color: "#2A7BFF",
    fontSize: 14,
    fontWeight: "600",
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
    marginTop: "auto",
    paddingTop: 18,
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
