import { RTCPeerConnection, RTCSessionDescription, mediaDevices } from "react-native-webrtc";
import { chatService } from "./ChatService";

class RealtimeVoiceService {
    private pc: RTCPeerConnection | null = null;
    private localStream: any = null;
    private dc: any = null;

    async startCall(conversationId: string, onAudioTrack: (track: any) => void) {
        try {
            // 1. Get ephemeral token from backend
            const session = await chatService.getRealtimeSession(conversationId);
            const EPHEMERAL_KEY = session.client_secret.value;

            // 2. Setup Peer Connection
            this.pc = new RTCPeerConnection({
                iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
            });

            // 3. Setup Audio Playback
            (this.pc as any).addEventListener("track", (e: any) => {
                if (e.track.kind === "audio") {
                    onAudioTrack(e.track);
                }
            });

            // 4. Capture Microphone
            this.localStream = await mediaDevices.getUserMedia({
                audio: true,
                video: false
            });
            this.localStream.getTracks().forEach((track: any) => {
                this.pc?.addTrack(track, this.localStream);
            });

            // 5. Setup Data Channel (for control/text)
            this.dc = this.pc.createDataChannel("oai-events");
            this.dc.onopen = () => console.log("Realtime Data Channel Open");
            this.dc.onmessage = (e: any) => {
                const event = JSON.parse(e.data);
                console.log("Realtime Event:", event.type);
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
}

export const realtimeVoiceService = new RealtimeVoiceService();
