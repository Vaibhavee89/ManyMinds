import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    Animated,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MediaStream, RTCView } from "react-native-webrtc";
import { realtimeVoiceService, TranscriptEntry } from "../../services/RealtimeVoiceService";

export default function VoiceCallScreen() {
    const router = useRouter();
    const { id, name } = useLocalSearchParams<{ id: string; name: string }>();

    const [status, setStatus] = useState("Connecting...");
    const [isMuted, setIsMuted] = useState(false);
    const [isSpeaker, setIsSpeaker] = useState(true);
    const [duration, setDuration] = useState(0);
    const [connected, setConnected] = useState(false);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
    const [showTranscript, setShowTranscript] = useState(false);

    const pulseAnim = useRef(new Animated.Value(1)).current;
    const scrollViewRef = useRef<ScrollView>(null);

    useEffect(() => {
        let interval: any;

        const connect = async () => {
            try {
                // Configure Audio for Voice Call
                await Audio.setAudioModeAsync({
                    allowsRecordingIOS: true,
                    playsInSilentModeIOS: true,
                    staysActiveInBackground: true,
                    shouldDuckAndroid: true,
                    playThroughEarpieceAndroid: false, // Default to speaker
                });

                await realtimeVoiceService.startCall(id!, {
                    onRemoteStream: (stream) => {
                        console.log("Remote stream received");
                        setRemoteStream(stream);
                        setStatus("Connected");
                        setConnected(true);
                    },
                    onUserTranscript: (text) => {
                        setTranscript(prev => [...prev, { role: "user", text, timestamp: new Date() }]);
                        scrollViewRef.current?.scrollToEnd({ animated: true });
                    },
                    onAssistantTranscript: (text) => {
                        setTranscript(prev => [...prev, { role: "assistant", text, timestamp: new Date() }]);
                        scrollViewRef.current?.scrollToEnd({ animated: true });
                    },
                    onError: (error) => {
                        console.error("Voice call error:", error);
                        setStatus("Error occurred");
                    }
                });

                interval = setInterval(() => {
                    setDuration(d => d + 1);
                }, 1000);
            } catch (err) {
                setStatus("Call Failed");
                console.error(err);
            }
        };

        connect();

        // Pulse animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.2,
                    duration: 1500,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1500,
                    useNativeDriver: true,
                }),
            ])
        ).start();

        return () => {
            realtimeVoiceService.stopCall();
            if (interval) clearInterval(interval);
        };
    }, [id]);

    const endCall = () => {
        realtimeVoiceService.stopCall();
        router.back();
    };

    const toggleMute = () => {
        const newMuteState = !isMuted;
        setIsMuted(newMuteState);
        realtimeVoiceService.toggleAudio(!newMuteState);
    };

    const toggleSpeaker = async () => {
        const newSpeakerState = !isSpeaker;
        setIsSpeaker(newSpeakerState);
        await Audio.setAudioModeAsync({
            allowsRecordingIOS: true,
            playsInSilentModeIOS: true,
            staysActiveInBackground: true,
            shouldDuckAndroid: true,
            playThroughEarpieceAndroid: !newSpeakerState,
        });
    };

    const formatDuration = (s: number) => {
        const mins = Math.floor(s / 60);
        const secs = s % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={["#0B1B33", "#061220", "#02070D"]}
                style={StyleSheet.absoluteFill}
            />

            {remoteStream && (
                <RTCView
                    streamURL={remoteStream.toURL()}
                    style={{ width: 1, height: 1, opacity: 0 }}
                    mirror={false}
                    objectFit="cover"
                />
            )}

            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <Text style={styles.companionName}>{name || "Luna"}</Text>
                    <Text style={styles.statusText}>{connected ? formatDuration(duration) : status}</Text>
                </View>

                {showTranscript ? (
                    <View style={styles.transcriptContainer}>
                        <ScrollView 
                            ref={scrollViewRef}
                            style={styles.transcriptScroll}
                            contentContainerStyle={styles.transcriptContent}
                        >
                            {transcript.length === 0 ? (
                                <Text style={styles.transcriptPlaceholder}>
                                    Conversation transcript will appear here...
                                </Text>
                            ) : (
                                transcript.map((entry, index) => (
                                    <View 
                                        key={index} 
                                        style={[
                                            styles.transcriptBubble,
                                            entry.role === "user" ? styles.userBubble : styles.assistantBubble
                                        ]}
                                    >
                                        <Text style={styles.transcriptRole}>
                                            {entry.role === "user" ? "You" : name || "AI"}
                                        </Text>
                                        <Text style={styles.transcriptText}>{entry.text}</Text>
                                    </View>
                                ))
                            )}
                        </ScrollView>
                    </View>
                ) : (
                    <View style={styles.avatarContainer}>
                        <Animated.View style={[styles.pulseRing, { transform: [{ scale: pulseAnim }], opacity: 0.3 }]} />
                        <Animated.View style={[styles.pulseRing, { transform: [{ scale: Animated.multiply(pulseAnim, 0.8) }], opacity: 0.5 }]} />
                        <View style={styles.avatarWrapper}>
                            <MaterialCommunityIcons name="account-voice" size={80} color="#FFFFFF" />
                        </View>
                    </View>
                )}

                <View style={styles.controls}>
                    <Pressable
                        style={[styles.circleButton, isMuted && styles.activeButton]}
                        onPress={toggleMute}
                    >
                        <MaterialCommunityIcons
                            name={isMuted ? "microphone-off" : "microphone"}
                            size={28}
                            color="#FFFFFF"
                        />
                        <Text style={styles.buttonLabel}>Mute</Text>
                    </Pressable>

                    <Pressable style={styles.endCallButton} onPress={endCall}>
                        <MaterialCommunityIcons name="phone-hangup" size={32} color="#FFFFFF" />
                    </Pressable>

                    <Pressable
                        style={[styles.circleButton, isSpeaker && styles.activeButton]}
                        onPress={toggleSpeaker}
                    >
                        <MaterialCommunityIcons
                            name={isSpeaker ? "volume-high" : "phone-in-talk"}
                            size={28}
                            color="#FFFFFF"
                        />
                        <Text style={styles.buttonLabel}>Speaker</Text>
                    </Pressable>

                    <Pressable
                        style={[styles.circleButton, showTranscript && styles.activeButton]}
                        onPress={() => setShowTranscript(!showTranscript)}
                    >
                        <MaterialCommunityIcons
                            name="text-box-outline"
                            size={28}
                            color="#FFFFFF"
                        />
                        <Text style={styles.buttonLabel}>Transcript</Text>
                    </Pressable>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
        paddingHorizontal: 24,
        justifyContent: "space-between",
        paddingVertical: 40,
    },
    header: {
        alignItems: "center",
    },
    companionName: {
        fontSize: 28,
        fontWeight: "900",
        color: "#FFFFFF",
        letterSpacing: 0.5,
    },
    statusText: {
        fontSize: 16,
        color: "rgba(255,255,255,0.6)",
        marginTop: 8,
        fontWeight: "600",
    },
    avatarContainer: {
        alignItems: "center",
        justifyContent: "center",
    },
    avatarWrapper: {
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: "rgba(255,255,255,0.08)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.2)",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2,
    },
    pulseRing: {
        ...StyleSheet.absoluteFillObject,
        width: 180,
        height: 180,
        borderRadius: 90,
        backgroundColor: "#1D6DFF",
        alignSelf: "center",
        top: "50%",
        left: "50%",
        marginLeft: -90,
        marginTop: -90,
    },
    controls: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        marginBottom: 40,
    },
    circleButton: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: "rgba(255,255,255,0.1)",
        alignItems: "center",
        justifyContent: "center",
    },
    activeButton: {
        backgroundColor: "#1D6DFF",
    },
    endCallButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "#FF3B30",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#FF3B30",
        shadowOpacity: 0.5,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 4 },
    },
    buttonLabel: {
        position: "absolute",
        bottom: -24,
        color: "#FFFFFF",
        fontSize: 12,
        fontWeight: "600",
    },
    transcriptContainer: {
        flex: 1,
        marginVertical: 20,
        backgroundColor: "rgba(255,255,255,0.05)",
        borderRadius: 16,
        overflow: "hidden",
    },
    transcriptScroll: {
        flex: 1,
    },
    transcriptContent: {
        padding: 16,
        gap: 12,
    },
    transcriptPlaceholder: {
        color: "rgba(255,255,255,0.4)",
        textAlign: "center",
        marginTop: 40,
        fontSize: 14,
    },
    transcriptBubble: {
        padding: 12,
        borderRadius: 12,
        maxWidth: "85%",
    },
    userBubble: {
        backgroundColor: "#1D6DFF",
        alignSelf: "flex-end",
    },
    assistantBubble: {
        backgroundColor: "rgba(255,255,255,0.1)",
        alignSelf: "flex-start",
    },
    transcriptRole: {
        fontSize: 11,
        fontWeight: "700",
        color: "rgba(255,255,255,0.6)",
        marginBottom: 4,
        textTransform: "uppercase",
    },
    transcriptText: {
        color: "#FFFFFF",
        fontSize: 14,
        lineHeight: 20,
    },
});
