import EventSource from "react-native-sse";
import { API_BASE_URL } from "../constants/Config";
import { authService } from "./AuthService";

export interface StreamCallbacks {
    onChunk: (text: string) => void;
    onComplete: () => void;
    onError: (error: any) => void;
}

class ChatService {
    async sendMessageStream(
        conversationId: string,
        text: string,
        callbacks: StreamCallbacks
    ) {
        const token = await authService.getToken();
        if (!token) {
            callbacks.onError("No authentication token found.");
            return;
        }

        const url = `${API_BASE_URL}/conversations/${conversationId}/messages`;

        const options: any = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({ text }),
        };

        const es = new EventSource(url, options);

        es.addEventListener("open", () => {
            console.log("SSE connection opened");
        });

        es.addEventListener("close", (event: any) => {
            console.log("SSE connection closed by server", event);
            es.close();
            callbacks.onComplete();
        });

        es.addEventListener("message", (event: any) => {
            if (event.data === "[DONE]") {
                es.close();
                callbacks.onComplete();
                return;
            }

            try {
                const data = JSON.parse(event.data || "{}");
                if (data.text) {
                    callbacks.onChunk(data.text);
                }
            } catch (e) {
                console.warn("Failed to parse SSE data:", event.data);
            }
        });

        es.addEventListener("error", (event) => {
            console.error("SSE error:", event);
            es.close();
            // If it's a 200 but close, it might be fine, but usually error means failure
            if (event.type === "error") {
                callbacks.onError(event.message || "Stream connection failed");
            }
        });

        return () => es.close(); // Return cleanup function
    }

    async getMessages(conversationId: string) {
        const token = await authService.getToken();
        const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/messages`, {
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });
        if (!response.ok) throw new Error("Failed to fetch messages");
        return response.json();
    }

    async getConversations() {
        const token = await authService.getToken();
        const response = await fetch(`${API_BASE_URL}/conversations`, {
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });
        if (!response.ok) throw new Error("Failed to fetch conversations");
        return response.json();
    }

    async getAiProfiles() {
        const token = await authService.getToken();
        const response = await fetch(`${API_BASE_URL}/ai-profiles`, {
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });
        if (!response.ok) throw new Error("Failed to fetch AI profiles");
        return response.json();
    }

    async getAiProfile(id: string) {
        const token = await authService.getToken();
        const response = await fetch(`${API_BASE_URL}/ai-profiles/${id}`, {
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });
        if (!response.ok) throw new Error("Failed to fetch AI profile");
        return response.json();
    }

    async updateAiProfile(id: string, data: any) {
        const token = await authService.getToken();
        const response = await fetch(`${API_BASE_URL}/ai-profiles/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error("Failed to update AI profile");
        return response.json();
    }

    async createAiProfile(data: {
        display_name: string;
        base_system_prompt: string;
        base_personality_json: any;
        avatar_url?: string;
    }) {
        const token = await authService.getToken();
        const response = await fetch(`${API_BASE_URL}/ai-profiles`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error("Failed to create AI profile");
        return response.json();
    }

    async getConversation(id: string) {
        const token = await authService.getToken();
        const response = await fetch(`${API_BASE_URL}/conversations/${id}`, {
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });
        if (!response.ok) throw new Error("Failed to fetch conversation");
        return response.json();
    }

    async findOrCreateConversation(aiProfileId: string) {
        const token = await authService.getToken();
        const response = await fetch(`${API_BASE_URL}/conversations`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({ ai_profile_id: aiProfileId }),
        });
        if (!response.ok) throw new Error("Failed to create conversation");
        return response.json();
    }
}

export const chatService = new ChatService();
