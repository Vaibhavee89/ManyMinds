import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState, useEffect } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { chatService } from "../services/ChatService";

type Contact = {
  id: string;
  name: string;
  status: string;
  online: boolean;
};

type Row =
  | { type: "action"; id: string; title: string; icon: string }
  | { type: "section"; id: string; title: string }
  | { type: "contact"; id: string; contact: Contact };

const CONTACTS: Contact[] = [
  { id: "c1", name: "Alice Johnson", status: "Available", online: true },
  { id: "c2", name: "Adam Smith", status: "at the gym 🏋️", online: false },
  { id: "c3", name: "Alex Turner", status: "Last seen recently", online: false },
  {
    id: "c4",
    name: "Brian Doe",
    status: "Last seen today at 9:00 AM",
    online: false,
  },
  { id: "c5", name: "Bella Thorne", status: "Battery low…", online: false },
  {
    id: "c6",
    name: "Chris Evans",
    status: "Hey there! I’m using Chat.",
    online: true,
  },
  { id: "c7", name: "David Kim", status: "In a meeting", online: false },
  { id: "c8", name: "Daisy Ridley", status: "Available", online: true },
];

function initials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase()).join("");
}

function sectionKey(name: string) {
  const c = name.trim()[0]?.toUpperCase();
  if (!c) return "#";
  if (/[A-Z]/.test(c)) return c;
  return "#";
}

export default function Contacts() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const data = await chatService.getAiProfiles();
        const formatted = data.map((p: any) => ({
          id: String(p.id),
          name: p.display_name || "Unknown AI",
          status: p.bio || "Available",
          online: true,
        }));
        setContacts(formatted);
      } catch (error) {
        console.error("Failed to fetch AI profiles:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, []);

  const rows = useMemo<Row[]>(() => {
    const q = query.trim().toLowerCase();
    const filtered = !q
      ? contacts
      : contacts.filter((c) => {
        return (
          c.name.toLowerCase().includes(q) || c.status.toLowerCase().includes(q)
        );
      });

    const sorted = [...filtered].sort((a, b) => a.name.localeCompare(b.name));

    const out: Row[] = [
      {
        type: "action",
        id: "action-new-companion",
        title: "New AI Companion",
        icon: "robot-plus",
      },
      {
        type: "action",
        id: "action-new-group",
        title: "New Group",
        icon: "account-multiple-plus",
      },
      {
        type: "action",
        id: "action-invite",
        title: "Invite Friends",
        icon: "share-variant",
      },
    ];

    let lastSection: string | null = null;
    for (const contact of sorted) {
      const s = sectionKey(contact.name);
      if (s !== lastSection) {
        out.push({ type: "section", id: `s-${s}`, title: s });
        lastSection = s;
      }
      out.push({ type: "contact", id: contact.id, contact });
    }

    return out;
  }, [query, contacts]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <View style={styles.screen}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Contacts</Text>

          <Pressable
            accessibilityRole="button"
            onPress={() => router.push("/create-ai")}
            hitSlop={10}
            style={styles.addButton}
          >
            <MaterialCommunityIcons
              name="account-plus"
              size={20}
              color="rgba(255,255,255,0.95)"
            />
          </Pressable>
        </View>

        <View style={styles.searchWrap}>
          <MaterialCommunityIcons
            name="magnify"
            size={20}
            color="rgba(255,255,255,0.55)"
          />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search name or number..."
            placeholderTextColor="rgba(255,255,255,0.35)"
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.searchInput}
          />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1D6DFF" />
          </View>
        ) : (
          <FlatList
            data={rows}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            renderItem={({ item }) => {
              if (item.type === "action") {
                return (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => {
                      if (item.id === "action-new-companion") {
                        router.push("/create-ai");
                      }
                    }}
                    style={({ pressed }) => [
                      styles.actionRow,
                      pressed && styles.rowPressed,
                    ]}
                  >
                    <View style={styles.actionIconWrap}>
                      <MaterialCommunityIcons
                        name={item.icon as never}
                        size={20}
                        color="#1D6DFF"
                      />
                    </View>
                    <Text style={styles.actionTitle}>{item.title}</Text>
                    <MaterialCommunityIcons
                      name="chevron-right"
                      size={22}
                      color="rgba(255,255,255,0.35)"
                    />
                  </Pressable>
                );
              }

              if (item.type === "section") {
                return (
                  <View style={styles.sectionRow}>
                    <Text style={styles.sectionText}>{item.title}</Text>
                  </View>
                );
              }

              const c = item.contact;
              return (
                <Pressable
                  accessibilityRole="button"
                  onPress={async () => {
                    try {
                      // Find or create conversation for this AI Profile
                      const conversation = await chatService.findOrCreateConversation(c.id);
                      router.push({
                        pathname: "/chat/[id]",
                        params: { id: conversation.id, name: c.name },
                      });
                    } catch (error) {
                      console.error("Failed to navigate to chat:", error);
                    }
                  }}
                  style={({ pressed }) => [
                    styles.contactRow,
                    pressed && styles.rowPressed,
                  ]}
                >
                  <View style={styles.avatarWrap}>
                    <Text style={styles.avatarText}>{initials(c.name)}</Text>
                    {c.online ? <View style={styles.onlineDot} /> : null}
                  </View>

                  <View style={styles.contactBody}>
                    <Text style={styles.contactName} numberOfLines={1}>
                      {c.name}
                    </Text>
                    <Text style={styles.contactStatus} numberOfLines={1}>
                      {c.status}
                    </Text>
                  </View>
                </Pressable>
              );
            }}
          />
        )}

        <View style={styles.bottomBar}>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.replace("/chats")}
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
            onPress={() => { }}
            style={({ pressed }) => [styles.tab, pressed && styles.tabPressed]}
          >
            <MaterialCommunityIcons name="account" size={22} color="#1D6DFF" />
            <Text style={[styles.tabText, styles.tabTextActive]}>Contacts</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() => router.replace("/profile" as never)}
            style={({ pressed }) => [styles.tab, pressed && styles.tabPressed]}
          >
            <MaterialCommunityIcons
              name="account-outline"
              size={22}
              color="rgba(255,255,255,0.55)"
            />
            <Text style={styles.tabText}>Profile</Text>
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
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 10,
    paddingBottom: 12,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: -0.8,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },
  searchWrap: {
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  searchInput: {
    flex: 1,
    color: "rgba(255,255,255,0.92)",
    fontSize: 15,
  },
  listContent: {
    paddingTop: 14,
    paddingBottom: 92,
  },
  rowPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.995 }],
  },
  separator: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.07)",
    marginLeft: 74,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 12,
  },
  actionIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 18,
    backgroundColor: "rgba(42,123,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(42,123,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  actionTitle: {
    flex: 1,
    color: "rgba(255,255,255,0.92)",
    fontSize: 16,
    fontWeight: "800",
  },
  sectionRow: {
    paddingTop: 10,
    paddingBottom: 6,
  },
  sectionText: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 12,
  },
  avatarWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "rgba(255,255,255,0.92)",
    fontWeight: "900",
    letterSpacing: 0.6,
  },
  onlineDot: {
    position: "absolute",
    right: 2,
    bottom: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#22C55E",
    borderWidth: 2,
    borderColor: "#061220",
  },
  contactBody: {
    flex: 1,
    gap: 4,
  },
  contactName: {
    color: "rgba(255,255,255,0.92)",
    fontSize: 16,
    fontWeight: "800",
  },
  contactStatus: {
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
