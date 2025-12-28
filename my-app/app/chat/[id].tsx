import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
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
import { chatService } from "../../services/ChatService";

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
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiProfileId, setAiProfileId] = useState<string | null>(null);

  const listRef = useRef<FlatList<Message>>(null);

  useEffect(() => {
    if (!params.id) return;

    const fetchAll = async () => {
      try {
        const [convData, msgData] = await Promise.all([
          chatService.getConversation(params.id!),
          chatService.getMessages(params.id!)
        ]);

        setAiProfileId(String(convData.ai_profile_id));

        const formatted = msgData.map((m: any) => ({
          id: String(m.id),
          text: m.body,
          createdAt: new Date(m.created_at).getTime(),
          fromMe: m.sender_type === "user",
        }));
        setMessages(formatted.reverse());
      } catch (error) {
        console.error("Failed to fetch chat data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [params.id]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || !params.id) return;

    const userMsgId = makeId();
    const userMsg: Message = {
      id: userMsgId,
      text,
      createdAt: Date.now(),
      fromMe: true,
    };

    setMessages((prev) => [userMsg, ...prev]);
    setInput("");

    // Setup Assistant Placeholder
    const assistantMsgId = makeId();
    const assistantMsg: Message = {
      id: assistantMsgId,
      text: "",
      createdAt: Date.now(),
      fromMe: false,
    };

    setMessages((prev) => [assistantMsg, ...prev]);

    try {
      await chatService.sendMessageStream(params.id, text, {
        onChunk: (chunk) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId ? { ...m, text: m.text + chunk } : m
            )
          );
        },
        onComplete: () => {
          console.log("Stream complete");
        },
        onError: (err) => {
          console.error("Stream error:", err);
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId ? { ...m, text: m.text + "\n[System: Error receiving response]" } : m
            )
          );
        }
      });
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  }, [input, params.id]);

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

          <Pressable
            style={styles.titleBlock}
            onPress={() => {
              if (aiProfileId) {
                router.push({
                  pathname: "/edit-personality/[id]",
                  params: { id: aiProfileId }
                });
              }
            }}
          >
            <Text style={styles.title} numberOfLines={1}>
              {chatName}
            </Text>
            <Text style={styles.subtitle} numberOfLines={1}>
              {aiProfileId ? "Edit Personality" : "Online"}
            </Text>
          </Pressable>

          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              onPress={() => { }}
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
              onPress={() => { }}
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

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1D6DFF" />
          </View>
        ) : (
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
                    <Text style={styles.bubbleText}>{item.text || "..."}</Text>
                  </View>
                </View>
              );
            }}
          />
        )}

        <View style={styles.composer}>
          <Pressable
            accessibilityRole="button"
            onPress={() => { }}
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
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
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
