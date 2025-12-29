import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState, useRef } from "react";
import {
    ActivityIndicator,
    Animated,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { Audio } from "expo-av";
import { SafeAreaView } from "react-native-safe-area-context";
import { RTCView, MediaStream } from "react-native-webrtc";
import { realtimeVoiceService } from "../../services/RealtimeVoiceService";

export default function VoiceCallScreen() {
    const router = useRouter();
    const { id, name } = useLocalSearchParams<{ id: string; name: string }>();

    const [status, setStatus] = useState("Connecting...");
    const [isMuted, setIsMuted] = useState(false);
    const [isSpeaker, setIsSpeaker] = useState(true);
    const [duration, setDuration] = useState(0);
    const [connected, setConnected] = useState(false);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

    const pulseAnim = useRef(new Animated.Value(1)).current;

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

                await realtimeVoiceService.startCall(id!, (stream) => {
                    // ... rest of connect

                    console.log("Remote stream received");
                    setRemoteStream(stream);
                    setStatus("Connected");
                    setConnected(true);
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

                <View style={styles.avatarContainer}>
                    <Animated.View style={[styles.pulseRing, { transform: [{ scale: pulseAnim }], opacity: 0.3 }]} />
                    <Animated.View style={[styles.pulseRing, { transform: [{ scale: Animated.multiply(pulseAnim, 0.8) }], opacity: 0.5 }]} />
                    <View style={styles.avatarWrapper}>
                        <MaterialCommunityIcons name="account-voice" size={80} color="#FFFFFF" />
                    </View>
                </View>

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
    }
});
