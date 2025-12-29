# LibreChat React Native & Laravel Backend

## 📖 Project Overview

LibreChat is a **real‑time AI‑powered chat application** built with a **React Native** front‑end and a **Laravel** back‑end.  It showcases:
- **AI chat** powered by OpenAI's GPT‑4o‑realtime model.
- **Live voice streaming** using WebRTC (React Native WebRTC) for two‑way audio communication.
- **Authentication** via Laravel Sanctum.
- **Rich conversation management** (create, list, view, and stream messages).
- **AI profile handling** and **prompt building** services.
- **Realtime session creation** for voice calls.

The project is a learning sandbox for modern mobile development, real‑time communication, and server‑side AI integration.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| **Chat Service** | Handles sending/receiving messages, creating conversations, and streaming AI responses. |
| **Realtime Voice Service** | Sets up a WebRTC peer connection, captures microphone audio, streams voice from OpenAI, and provides a data channel for control messages. |
| **Auth Service** | Register, login, and fetch the current user using Laravel Sanctum tokens. |
| **AI Profile Management** | CRUD endpoints for AI profiles (system prompts, temperature, etc.). |
| **Prompt Builder** | Server‑side service that builds prompts for the AI model. |
| **Realtime Session API** | Generates an ephemeral token for the OpenAI realtime endpoint. |
| **Laravel API** | RESTful routes for auth, AI profiles, conversations, messages, feedback, and realtime sessions. |
| **React Native UI** | Modern mobile UI with dark mode support, gradient backgrounds, and smooth animations. |

---

## 🛠️ Technology Stack

- **Frontend**: React Native (TypeScript), `react-native-webrtc`, `axios`, `react-navigation`
- **Backend**: Laravel 12 (PHP 8.2), Sanctum, OpenAI PHP SDK (`openai-php/laravel`)
- **Realtime**: OpenAI Realtime API (`gpt-4o-realtime-preview-2024-12-17`)
- **Database**: SQLite (default) – can be swapped for MySQL/PostgreSQL.
- **Package Management**: npm (frontend), Composer (backend)
- **Development Tools**: Vite (frontend bundler), Laravel Sail (Docker dev environment optional)

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (>=18) and **npm**
- **PHP** (>=8.2) and **Composer**
- **Android SDK** (for Android emulator/device) – see React Native docs.
- **OpenAI API key** with access to the Realtime model.

### Backend Setup

1. Clone the repository and navigate to the project root.
2. Copy the example env file and set your variables:
   ```bash
   cp backend/.env.example backend/.env
   ```
3. Edit `backend/.env` and add:
   ```env
   OPENAI_API_KEY=your_openai_key_here
   ```
4. Install dependencies and run migrations:
   ```bash
   cd backend
   composer install
   php artisan key:generate
   php artisan migrate --force
   ```
5. (Optional) Start the Laravel development server:
   ```bash
   php artisan serve
   ```
   The API will be available at `http://127.0.0.1:8000/api`.

### Frontend Setup

1. Install npm packages:
   ```bash
   cd my-app
   npm install
   ```
2. Create a `.env` file in `my-app` (copy from `.env.example` if present) and set the backend URL if you are not using the default localhost:
   ```env
   VITE_API_BASE_URL=http://127.0.0.1:8000/api
   ```
3. Run the app on Android (or iOS):
   ```bash
   npm run android   # or `npm run ios`
   ```
   The Metro bundler will start and the app will launch on the emulator/device.

---

## 📡 API Overview

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a new user.
| `POST` | `/api/auth/login` | Login and receive a Sanctum token.
| `GET` | `/api/me` | Get the authenticated user.
| `GET/POST` | `/api/ai-profiles` | Manage AI profiles.
| `GET` | `/api/conversations` | List conversations.
| `POST` | `/api/conversations` | Create a new conversation.
| `GET` | `/api/conversations/{id}` | View a conversation.
| `GET` | `/api/conversations/{id}/messages` | List messages for a conversation.
| `POST` | `/api/conversations/{id}/messages` | Send a message (handled by `ChatController`).
| `POST` | `/api/conversations/{id}/realtime-session` | Generate an ephemeral token for the OpenAI Realtime endpoint.
| `POST` | `/api/messages/{id}/feedback` | Submit feedback for a message.

---

## 🎤 Realtime Voice Flow

1. The front‑end calls `chatService.getRealtimeSession(conversationId)` to obtain an **ephemeral token**.
2. `RealtimeVoiceService` creates a `RTCPeerConnection` and captures the microphone via `mediaDevices.getUserMedia`.
3. An SDP **offer** is sent to OpenAI's Realtime endpoint (`https://api.openai.com/v1/realtime`).
4. The response SDP **answer** is applied, establishing a two‑way audio stream.
5. A **data channel** (`oai-events`) is used for control messages (e.g., sending text prompts during a call).

---

## 🧪 Testing & Verification

- **Backend**: Run `php artisan test` to execute the Laravel test suite.
- **Frontend**: Use the React Native testing library or manually test the UI on an emulator/device.
- **Realtime**: Verify voice streaming by starting a call from the chat screen; you should hear the AI's spoken response and see the microphone indicator.

---

## 🤝 Contributing

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/awesome-feature`).
3. Make your changes and ensure both backend and frontend tests pass.
4. Open a Pull Request describing the changes.

---

## 📄 License

This project is licensed under the **MIT License** – see the `LICENSE` file for details.

---

## 📞 Contact

For questions or suggestions, feel free to open an issue or contact the repository maintainer.
