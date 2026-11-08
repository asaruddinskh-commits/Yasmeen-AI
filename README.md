# YESMIN AI — Next-Generation AI Girlfriend & Personal Jarvis Assistant

YESMIN AI is a full-stack, production-ready AI companion, personal Jarvis assistant, Gemini Live real-time voice communicator, and sandboxed coding agent built with React 19, TypeScript, Express, and Google Gemini 3.8.

---

## Key Features & Highlights

1. **Custom Assistant Identity & Name Customization**
   - Default name: **YESMIN AI**
   - Users can dynamically customize the assistant name to any name (e.g., *Muskan*, *Jarvis*, *Aria*) via **Settings → Profile & Assistant**.
   - Custom name automatically propagates throughout the entire app:
     - Navigation headers & branding
     - Greetings ("*Hi, Jaan! I'm Muskan. How can I help you?*")
     - Voice responses
     - Live Voice Mode
     - System context prompts
   - Changes persist permanently across page refreshes, browser restarts, and device sessions via server-side storage & LocalStorage sync.
   - Customizable user nickname (default: *Jaan*, e.g., *Babu*, *Boss*, *Alex*), greeting styles, and personality modes.

2. **AI Companion & Girlfriend Mode**
   - Caring, playful, supportive, witty, and emotionally expressive companion.
   - Deep multimodal conversation supporting English, Hindi, and natural Hinglish.
   - 5 built-in personality modes:
     - *Girlfriend / Companion*
     - *Friendly Companion*
     - *Professional Jarvis*
     - *Coding Specialist*
     - *Study & Academic Tutor*

3. **Gemini Live Realtime Voice Mode**
   - Powered by official `@google/genai` Live API (`gemini-3.8-live`).
   - Bidirectional 16kHz linear PCM audio streaming via WebSocket bridge (`/live`).
   - 24kHz low-latency output audio playback with natural speech pacing.
   - Immediate user interruption handling (stops speaking instantly on interruption signal and resumes listening).
   - Animated 3D-styled AI Orb with reactive audio waveform pulse.

4. **Multi-Engine TTS & ElevenLabs**
   - Direct ElevenLabs API proxy (`/api/voice/elevenlabs`) with voice stability, speed, and model selection.
   - Browser SpeechSynthesis fallback with natural voice selection.
   - Auto-speak toggle and instant replay.

5. **AI Coding Agent & Isolated Sandbox**
   - Plan, generate, and edit multi-file codebases.
   - Real sandboxed execution via `/api/sandbox/run` with console logging, error capture, and execution timing.
   - File explorer, code editor, live component preview, and one-click file download.

6. **Apps & Actions & Android Companion Bridge**
   - Launch web applications safely (YouTube, Gmail, WhatsApp, Telegram, Google Maps, Calculator, Calendar).
   - Android WebView Companion Bridge architecture with ready-to-use Kotlin code (`@JavascriptInterface`) and native intent specifications.
   - Safety guard modal for sensitive hardware access.

7. **Grounded Web Intelligence**
   - Real-time search with Google Search grounding.
   - Verified source citations, snippets, and direct links.
   - One-click "Discuss in Chat" integration.

8. **Persistent Memory Bank**
   - Automatically injects user preferences, facts, and goals into conversation context.
   - Full CRUD: search, edit, delete, and clear memories.

9. **14 Integrated API Services Manager**
   - Dedicated management cards for Gemini, ElevenLabs, OpenAI, Anthropic, Speech-to-Text, Text-to-Speech, Search, Vision, Maps, Firebase, Storage, Coding Sandbox, Analytics, and Custom APIs.

---

## Installation & Setup

### 1. Prerequisites
- Node.js >= 20.x
- npm >= 10.x

### 2. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Populate your API keys:
```env
PORT=3000
GEMINI_API_KEY="your_actual_gemini_api_key"
ELEVENLABS_API_KEY="your_optional_elevenlabs_key"
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Run Development Server
```bash
npm run dev
```
The server will boot on `http://localhost:3000` with live Vite middlewares and WebSocket live bridge.

### 5. Production Build & Deployment
```bash
npm run build
npm start
```

---

## Security Architecture

- **Server-Side API Proxy:** All AI API keys (`GEMINI_API_KEY`, `ELEVENLABS_API_KEY`) remain strictly on the backend. No secret credentials are ever exposed in client bundles.
- **Sandboxed Execution:** User-submitted code executes in an isolated environment with timeouts and memory limits.
- **Action Confirmation:** Sensitive operations require explicit confirmation before execution.
