import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type SettingRow = {
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
  danger?: boolean;
};

const SETTINGS: SettingRow[] = [
  {
    id: "account",
    title: "Account",
    subtitle: "Profile, phone number, security",
    icon: "account-circle-outline",
  },
  {
    id: "privacy",
    title: "Privacy",
    subtitle: "Blocked contacts, disappearing messages",
    icon: "shield-lock-outline",
  },
  {
    id: "notifications",
    title: "Notifications",
    subtitle: "Message, group & call tones",
    icon: "bell-outline",
  },
  {
    id: "appearance",
    title: "Appearance",
    subtitle: "Theme, wallpaper, font size",
    icon: "palette-outline",
  },
  {
    id: "help",
    title: "Help",
    subtitle: "Help center, contact us, terms",
    icon: "help-circle-outline",
  },
  {
    id: "logout",
    title: "Log out",
    icon: "logout",
    danger: true,
  },
];

export default function Profile() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <View style={styles.screen}>
        <Text style={styles.title}>Profile</Text>

        <View style={styles.profileCard}>
          <View style={styles.avatarWrap}>
            <Text style={styles.avatarText}>VM</Text>
          </View>

          <View style={styles.profileText}>
            <Text style={styles.name}>Vaibhavee</Text>
            <Text style={styles.status} numberOfLines={1}>
              Available
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={() => {}}
            hitSlop={10}
            style={styles.editButton}
          >
            <MaterialCommunityIcons
              name="pencil-outline"
              size={18}
              color="rgba(255,255,255,0.92)"
            />
          </Pressable>
        </View>

        <View style={styles.section}>
          {SETTINGS.map((s) => {
            return (
              <Pressable
                key={s.id}
                accessibilityRole="button"
                onPress={() => {}}
                style={({ pressed }) => [
                  styles.settingRow,
                  pressed && styles.rowPressed,
                ]}
              >
                <View style={styles.settingIconWrap}>
                  <MaterialCommunityIcons
                    name={s.icon as never}
                    size={20}
                    color={s.danger ? "#EF4444" : "#1D6DFF"}
                  />
                </View>

                <View style={styles.settingBody}>
                  <Text
                    style={[styles.settingTitle, s.danger && styles.dangerText]}
                  >
                    {s.title}
                  </Text>
                  {s.subtitle ? (
                    <Text style={styles.settingSubtitle} numberOfLines={1}>
                      {s.subtitle}
                    </Text>
                  ) : null}
                </View>

                <MaterialCommunityIcons
                  name="chevron-right"
                  size={22}
                  color="rgba(255,255,255,0.35)"
                />
              </Pressable>
            );
          })}
        </View>

        <View style={styles.bottomBar}>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.replace("/chats" as never)}
            style={({ pressed }) => [styles.tab, pressed && styles.tabPressed]}
          >
            <MaterialCommunityIcons
              name="message-text-outline"
              size={22}
              color="rgba(255,255,255,0.55)"
            />
            <Text style={styles.tabText}>Chats</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() => router.replace("/contacts" as never)}
            style={({ pressed }) => [styles.tab, pressed && styles.tabPressed]}
          >
            <MaterialCommunityIcons
              name="account"
              size={22}
              color="rgba(255,255,255,0.55)"
            />
            <Text style={styles.tabText}>Contacts</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() => {}}
            style={({ pressed }) => [styles.tab, pressed && styles.tabPressed]}
          >
            <MaterialCommunityIcons name="account-outline" size={22} color="#1D6DFF" />
            <Text style={[styles.tabText, styles.tabTextActive]}>Profile</Text>
          </Pressable>
        </View>
      </View>
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
    paddingHorizontal: 18,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: -0.8,
    paddingTop: 10,
    paddingBottom: 12,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 14,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },
  avatarWrap: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "rgba(42,123,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(42,123,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "rgba(255,255,255,0.92)",
    fontWeight: "900",
    letterSpacing: 0.6,
  },
  profileText: {
    flex: 1,
    gap: 4,
  },
  name: {
    color: "rgba(255,255,255,0.95)",
    fontSize: 18,
    fontWeight: "900",
  },
  status: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 13,
    fontWeight: "700",
  },
  editButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },
  section: {
    marginTop: 14,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    overflow: "hidden",
    marginBottom: 92,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  rowPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.995 }],
  },
  settingIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  settingBody: {
    flex: 1,
    gap: 4,
  },
  settingTitle: {
    color: "rgba(255,255,255,0.92)",
    fontSize: 16,
    fontWeight: "900",
  },
  dangerText: {
    color: "#FCA5A5",
  },
  settingSubtitle: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 13,
  },
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 14,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.07)",
    backgroundColor: "rgba(6,18,32,0.96)",
  },
  tab: {
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    minWidth: 84,
  },
  tabText: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 12,
    fontWeight: "700",
  },
  tabTextActive: {
    color: "#1D6DFF",
  },
  tabPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
});
