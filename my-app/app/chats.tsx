import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ChatItem = {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unreadCount: number;
  online: boolean;
};

const CHATS: ChatItem[] = [
  {
    id: "1",
    name: "Alex Morgan",
    lastMessage: "Are we still on for tonight?",
    time: "2m",
    unreadCount: 2,
    online: true,
  },
  {
    id: "2",
    name: "Design Team",
    lastMessage: "New Figma link is ready ✅",
    time: "18m",
    unreadCount: 0,
    online: false,
  },
  {
    id: "3",
    name: "Dad",
    lastMessage: "Call me when you’re free.",
    time: "1h",
    unreadCount: 1,
    online: false,
  },
  {
    id: "4",
    name: "Priya",
    lastMessage: "Sent the notes. Let me know!",
    time: "Yesterday",
    unreadCount: 0,
    online: true,
  },
  {
    id: "5",
    name: "Work Updates",
    lastMessage: "Standup moved to 11:00 AM.",
    time: "Mon",
    unreadCount: 6,
    online: false,
  },
];

function initials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase()).join("");
}

export default function Chats() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const data = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CHATS;
    return CHATS.filter((c) => {
      return (
        c.name.toLowerCase().includes(q) ||
        c.lastMessage.toLowerCase().includes(q)
      );
    });
  }, [query]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <View style={styles.screen}>
        <View style={styles.topBar}>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.back()}
            hitSlop={10}
            style={styles.iconButton}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={22}
              color="rgba(255,255,255,0.92)"
            />
          </Pressable>

          <Text style={styles.title}>Chats</Text>

          <Pressable
            accessibilityRole="button"
            onPress={() => {}}
            hitSlop={10}
            style={styles.iconButton}
          >
            <MaterialCommunityIcons
              name="dots-horizontal"
              size={22}
              color="rgba(255,255,255,0.92)"
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
            placeholder="Search"
            placeholderTextColor="rgba(255,255,255,0.35)"
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.searchInput}
          />
        </View>

        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item }) => {
            return (
              <Pressable
                accessibilityRole="button"
                onPress={() =>
                  router.push({
                    pathname: "/chat/[id]",
                    params: { id: item.id, name: item.name },
                  })
                }
                style={({ pressed }) => [
                  styles.row,
                  pressed && styles.rowPressed,
                ]}
              >
                <View style={styles.avatarWrap}>
                  <Text style={styles.avatarText}>{initials(item.name)}</Text>
                  {item.online ? <View style={styles.onlineDot} /> : null}
                </View>

                <View style={styles.rowBody}>
                  <View style={styles.rowTopLine}>
                    <Text style={styles.name} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={styles.time}>{item.time}</Text>
                  </View>

                  <View style={styles.rowBottomLine}>
                    <Text style={styles.lastMessage} numberOfLines={1}>
                      {item.lastMessage}
                    </Text>
                    {item.unreadCount > 0 ? (
                      <View style={styles.unreadBadge}>
                        <Text style={styles.unreadText}>
                          {item.unreadCount}
                        </Text>
                      </View>
                    ) : (
                      <MaterialCommunityIcons
                        name="check"
                        size={18}
                        color="rgba(255,255,255,0.35)"
                      />
                    )}
                  </View>
                </View>
              </Pressable>
            );
          }}
        />

        <Pressable
          accessibilityRole="button"
          onPress={() =>
            router.push({ pathname: "/contacts" } as never)
          }
          style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
        >
          <MaterialCommunityIcons name="pencil" size={22} color="#FFFFFF" />
        </Pressable>
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
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 8,
    paddingBottom: 12,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: "rgba(255,255,255,0.92)",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.3,
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
    paddingBottom: 110,
  },
  separator: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.07)",
    marginLeft: 78,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    gap: 14,
  },
  rowPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.995 }],
  },
  avatarWrap: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: "rgba(42,123,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(42,123,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "rgba(255,255,255,0.92)",
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  onlineDot: {
    position: "absolute",
    right: -1,
    bottom: -1,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#22C55E",
    borderWidth: 2,
    borderColor: "#061220",
  },
  rowBody: {
    flex: 1,
    gap: 6,
  },
  rowTopLine: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  name: {
    flex: 1,
    color: "rgba(255,255,255,0.92)",
    fontSize: 16,
    fontWeight: "800",
  },
  time: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 12,
    fontWeight: "700",
  },
  rowBottomLine: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  lastMessage: {
    flex: 1,
    color: "rgba(255,255,255,0.55)",
    fontSize: 13,
  },
  unreadBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    paddingHorizontal: 8,
    backgroundColor: "#1D6DFF",
    alignItems: "center",
    justifyContent: "center",
  },
  unreadText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },
  fab: {
    position: "absolute",
    right: 18,
    bottom: 22,
    zIndex: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#1D6DFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#1D6DFF",
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
  fabPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
});
