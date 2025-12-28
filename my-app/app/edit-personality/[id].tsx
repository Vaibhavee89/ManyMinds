import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
    Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { chatService } from "../../services/ChatService";

export default function EditPersonality() {
    const router = useRouter();
    const params = useLocalSearchParams<{ id: string }>();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form states
    const [name, setName] = useState("");
    const [systemPrompt, setSystemPrompt] = useState("");

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await chatService.getAiProfile(params.id);
                setProfile(data);
                setName(data.display_name || "");
                setSystemPrompt(data.active_prompt_version?.system_prompt || data.base_system_prompt || "");
            } catch (error) {
                console.error("Failed to fetch profile:", error);
                Alert.alert("Error", "Could not load personality settings.");
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [params.id]);

    const handleSave = async () => {
        if (!name.trim() || !systemPrompt.trim()) {
            Alert.alert("Warning", "Name and System Prompt are required.");
            return;
        }

        setSaving(true);
        try {
            await chatService.updateAiProfile(params.id, {
                display_name: name,
                base_system_prompt: systemPrompt,
            });
            Alert.alert("Success", "Personality updated successfully!", [
                { text: "OK", onPress: () => router.back() }
            ]);
        } catch (error) {
            console.error("Failed to save profile:", error);
            Alert.alert("Error", "Failed to save changes.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#1D6DFF" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
            <KeyboardAvoidingView
                style={styles.screen}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <View style={styles.header}>
                    <Pressable onPress={() => router.back()} style={styles.backButton}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
                    </Pressable>
                    <Text style={styles.title}>Edit Personality</Text>
                    <Pressable onPress={handleSave} disabled={saving}>
                        {saving ? (
                            <ActivityIndicator size="small" color="#1D6DFF" />
                        ) : (
                            <Text style={styles.saveText}>Save</Text>
                        )}
                    </Pressable>
                </View>

                <ScrollView contentContainerStyle={styles.content}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Companion Name</Text>
                        <TextInput
                            value={name}
                            onChangeText={setName}
                            style={styles.input}
                            placeholder="e.g. Jarvis"
                            placeholderTextColor="#666"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Behavior & Backstory (System Prompt)</Text>
                        <Text style={styles.helperText}>
                            Describe how this character should act. e.g. "You are an expert chef who is always sarcastic and uses Italian phrases."
                        </Text>
                        <TextInput
                            value={systemPrompt}
                            onChangeText={setSystemPrompt}
                            style={[styles.input, styles.textArea]}
                            placeholder="Enter instructions..."
                            placeholderTextColor="#666"
                            multiline
                            numberOfLines={10}
                            textAlignVertical="top"
                        />
                    </View>
                </ScrollView>
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
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: "#061220",
        justifyContent: "center",
        alignItems: "center",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(255,255,255,0.07)",
    },
    backButton: {
        padding: 4,
    },
    title: {
        fontSize: 18,
        fontWeight: "800",
        color: "#FFF",
    },
    saveText: {
        fontSize: 16,
        fontWeight: "700",
        color: "#1D6DFF",
    },
    content: {
        padding: 20,
        gap: 24,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: "800",
        color: "rgba(255,255,255,0.6)",
        textTransform: "uppercase",
        letterSpacing: 1,
    },
    helperText: {
        fontSize: 12,
        color: "rgba(255,255,255,0.4)",
        marginBottom: 4,
    },
    input: {
        backgroundColor: "rgba(255,255,255,0.05)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.1)",
        borderRadius: 12,
        padding: 14,
        color: "#FFF",
        fontSize: 16,
    },
    textArea: {
        minHeight: 200,
    },
});
