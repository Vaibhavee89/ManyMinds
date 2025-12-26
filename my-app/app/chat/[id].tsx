import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Message = {
  id: string;
  text: string;
  createdAt: number;
  fromMe: boolean;
};

function makeId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function ChatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string; name?: string }>();

  const chatName = useMemo(() => {
    const n = params.name;
    if (typeof n === "string" && n.trim().length > 0) return n;
    return "Chat";
  }, [params.name]);

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "m1",
      text: "Hey! Welcome 👋",
      createdAt: Date.now() - 1000 * 60 * 30,
      fromMe: false,
    },
    {
      id: "m2",
      text: "This is a demo chat screen UI.",
      createdAt: Date.now() - 1000 * 60 * 28,
      fromMe: false,
    },
    {
      id: "m3",
      text: "Looks great — let’s build real-time next!",
      createdAt: Date.now() - 1000 * 60 * 25,
      fromMe: true,
    },
  ]);

  const listRef = useRef<FlatList<Message>>(null);

  const send = useCallback(() => {
    const text = input.trim();
    if (!text) return;

    const msg: Message = {
      id: makeId(),
      text,
      createdAt: Date.now(),
      fromMe: true,
    };

    setMessages((prev) => [msg, ...prev]);
    setInput("");
  }, [input]);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.select({ ios: "padding", android: undefined })}
        keyboardVerticalOffset={Platform.OS === "ios" ? 4 : 0}
      >
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

          <View style={styles.titleBlock}>
            <Text style={styles.title} numberOfLines={1}>
              {chatName}
            </Text>
            <Text style={styles.subtitle} numberOfLines={1}>
              Online
            </Text>
          </View>

          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              onPress={() => {}}
              hitSlop={10}
              style={styles.actionButton}
            >
              <MaterialCommunityIcons
                name="phone-outline"
                size={20}
                color="rgba(255,255,255,0.92)"
              />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => {}}
              hitSlop={10}
              style={styles.actionButton}
            >
              <MaterialCommunityIcons
                name="video-outline"
                size={22}
                color="rgba(255,255,255,0.92)"
              />
            </Pressable>
          </View>
        </View>

        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          inverted
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const isMe = item.fromMe;
            return (
              <View
                style={[
                  styles.bubbleRow,
                  isMe ? styles.bubbleRowMe : styles.bubbleRowThem,
                ]}
              >
                <View
                  style={[
                    styles.bubble,
                    isMe ? styles.bubbleMe : styles.bubbleThem,
                  ]}
                >
                  <Text style={styles.bubbleText}>{item.text}</Text>
                </View>
              </View>
            );
          }}
        />

        <View style={styles.composer}>
          <Pressable
            accessibilityRole="button"
            onPress={() => {}}
            hitSlop={10}
            style={styles.composerIconButton}
          >
            <MaterialCommunityIcons
              name="paperclip"
              size={20}
              color="rgba(255,255,255,0.65)"
            />
          </Pressable>

          <View style={styles.inputWrap}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Message"
              placeholderTextColor="rgba(255,255,255,0.35)"
              style={styles.input}
              multiline
            />
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={send}
            disabled={input.trim().length === 0}
            style={({ pressed }) => [
              styles.sendButton,
              input.trim().length === 0 && styles.sendButtonDisabled,
              pressed && input.trim().length > 0 && styles.buttonPressed,
            ]}
          >
            <MaterialCommunityIcons name="send" size={18} color="#FFFFFF" />
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
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.07)",
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
  titleBlock: {
    flex: 1,
    paddingHorizontal: 12,
  },
  title: {
    color: "rgba(255,255,255,0.95)",
    fontSize: 16,
    fontWeight: "900",
  },
  subtitle: {
    marginTop: 2,
    color: "rgba(255,255,255,0.55)",
    fontSize: 12,
    fontWeight: "700",
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },
  listContent: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 10,
  },
  bubbleRow: {
    marginBottom: 10,
    flexDirection: "row",
  },
  bubbleRowMe: {
    justifyContent: "flex-end",
  },
  bubbleRowThem: {
    justifyContent: "flex-start",
  },
  bubble: {
    maxWidth: "82%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  bubbleMe: {
    backgroundColor: "#1D6DFF",
    borderTopRightRadius: 6,
  },
  bubbleThem: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    borderTopLeftRadius: 6,
  },
  bubbleText: {
    color: "rgba(255,255,255,0.95)",
    fontSize: 15,
    lineHeight: 20,
  },
  composer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.07)",
    backgroundColor: "#061220",
  },
  composerIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },
  inputWrap: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  input: {
    color: "rgba(255,255,255,0.92)",
    fontSize: 15,
    padding: 0,
    margin: 0,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#1D6DFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#1D6DFF",
    shadowOpacity: 0.25,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  sendButtonDisabled: {
    opacity: 0.55,
  },
  buttonPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
});
