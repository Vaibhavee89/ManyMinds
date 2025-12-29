import { RTCPeerConnection, RTCSessionDescription, mediaDevices, MediaStream } from "react-native-webrtc";
import { chatService } from "./ChatService";

class RealtimeVoiceService {
    private pc: RTCPeerConnection | null = null;
    private localStream: MediaStream | null = null;
    private dc: any = null;
    private remoteStream: MediaStream | null = null;

    async startCall(conversationId: string, onRemoteStream: (stream: MediaStream) => void) {
        try {
            // 1. Get ephemeral token from backend
            const session = await chatService.getRealtimeSession(conversationId);
            const EPHEMERAL_KEY = session.client_secret.value;

            // 2. Setup Peer Connection
            this.pc = new RTCPeerConnection({
                iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
            });

            (this.pc as any).onconnectionstatechange = () => {
                console.log("PC Connection State:", this.pc?.connectionState);
            };

            (this.pc as any).oniceconnectionstatechange = () => {
                console.log("PC ICE Connection State:", this.pc?.iceConnectionState);
            };

            (this.pc as any).onsignalingstatechange = () => {
                console.log("PC Signaling State:", this.pc?.signalingState);
            };

            // 3. Setup Audio Playback
            this.remoteStream = new MediaStream(undefined);

            (this.pc as any).addEventListener("track", (e: any) => {
                console.log("Track received:", e.track.kind, e.track.id);
                const track = e.track;
                if (track.kind === "audio") {
                    this.remoteStream?.addTrack(track);
                    onRemoteStream(this.remoteStream!);
                }
            });

            // 4. Capture Microphone
            this.localStream = await mediaDevices.getUserMedia({
                audio: true,
                video: false
            });
            console.log("Microphone acquired, tracks:", this.localStream.getTracks().length);

            this.localStream.getTracks().forEach((track: any) => {
                console.log("Adding local track:", track.kind, track.enabled);
                this.pc?.addTrack(track, this.localStream!);
            });

            // 5. Setup Data Channel (for control/text)
            this.dc = this.pc.createDataChannel("oai-events");
            this.dc.onopen = () => {
                console.log("Realtime Data Channel Open");

                // 1. Ensure Session has VAD enabled
                const sessionUpdate = {
                    type: "session.update",
                    session: {
                        turn_detection: { type: "server_vad" },
                        input_audio_transcription: { model: "whisper-1" }
                    }
                };
                this.dc.send(JSON.stringify(sessionUpdate));

                // 2. Trigger initial greeting
                this.sendText("Hello! I am ready to chat.");

                // 3. Force a response generation (optional now if VAD works, but good for first turn)
                setTimeout(() => {
                    if (this.dc?.readyState === "open") {
                        console.log("Sending response.create");
                        this.dc.send(JSON.stringify({ type: "response.create" }));
                    }
                }, 500);
            };
            this.dc.onmessage = (e: any) => {
                try {
                    const event = JSON.parse(e.data);
                    console.log("Realtime Event RX:", event.type);
                    if (event.type === 'response.audio.delta') {
                        // too noisy to log full content, just knowing it arrived is enough
                    } else if (event.type === 'error') {
                        console.error("Realtime Error Event:", event);
                    }
                } catch (err) {
                    console.error("Failed to parse data channel message", err);
                }
            };

            // 6. Create Offer & Connect
            const offer = await this.pc.createOffer({});
            await this.pc.setLocalDescription(offer);

            const baseUrl = "https://api.openai.com/v1/realtime";
            const model = "gpt-4o-realtime-preview-2024-12-17";

            const response = await fetch(`${baseUrl}?model=${model}`, {
                method: "POST",
                body: offer.sdp,
                headers: {
                    Authorization: `Bearer ${EPHEMERAL_KEY}`,
                    "Content-Type": "application/sdp",
                },
            });

            if (!response.ok) {
                const err = await response.text();
                throw new Error(`OpenAI SDP Error: ${err}`);
            }

            const answer = {
                type: "answer",
                sdp: await response.text(),
            };
            await this.pc.setRemoteDescription(new RTCSessionDescription(answer as any));

            console.log("Realtime Call Connected");
        } catch (error) {
            console.error("Start Call Failed:", error);
            this.stopCall();
            throw error;
        }
    }

    stopCall() {
        if (this.pc) {
            this.pc.close();
            this.pc = null;
        }
        if (this.localStream) {
            this.localStream.getTracks().forEach((t: any) => t.stop());
            this.localStream = null;
        }
        if (this.remoteStream) {
            this.remoteStream.getTracks().forEach((t: any) => t.stop());
            this.remoteStream = null;
        }
        if (this.dc) {
            this.dc.close();
            this.dc = null;
        }
    }

    sendText(text: string) {
        if (this.dc && this.dc.readyState === "open") {
            const event = {
                type: "conversation.item.create",
                item: {
                    type: "message",
                    role: "user",
                    content: [{ type: "input_text", text }],
                },
            };
            this.dc.send(JSON.stringify(event));
        }
    }

    toggleAudio(enabled: boolean) {
        if (this.localStream) {
            this.localStream.getAudioTracks().forEach(track => {
                track.enabled = enabled;
            });
        }
    }
}

export const realtimeVoiceService = new RealtimeVoiceService();
