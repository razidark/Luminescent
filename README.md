# Luminescent

**Luminescent** is a next-generation, web-based creative suite powered by Google's Gemini and Imagen models. It merges professional-grade photo editing capabilities with state-of-the-art Generative AI, allowing users to edit, transform, and create visual media through a unified, glassmorphic interface.

## 🌟 Features

### Generative AI Tools
*   **Image Generation**: Create high-fidelity images. Supports **Standard** (Fast, via `gemini-2.5-flash-image`) and **Pro** (High-Res, via `gemini-3-pro-image-preview`) modes.
*   **Video Creation**: Generate videos from text prompts or animate static images using `veo-3.1-fast-generate-preview`.
*   **Variations**: Generate stylistic or compositional variations of existing images.
*   **Cardify**: Transform photos into custom trading cards (Pokémon, Magic, Tarot, etc.) using `gemini-2.5-flash` for layout and text generation.

### AI Editing Suite
*   **Magic Erase (Inpainting)**: Remove unwanted objects or replace them using generative fill.
*   **Smart Retouch**: Professional portrait retouching (skin smoothing, teeth whitening) and localized adjustments.
*   **Generative Expand**: Outpaint images to extend the canvas seamlessly.
*   **Upscale**: Enhance image resolution using AI upscaling (`gemini-3-pro-image-preview`).
*   **Background Removal & Replacement**: Isolate subjects and place them in new, generated environments.
*   **Product Studio**: Specialized workflow for e-commerce photography with realistic shadow generation.
*   **Sketch-to-Image**: Turn rough drawings into polished artwork using control-guided generation.
*   **Magic Merge**: Intelligently blend two images using semantic understanding.
*   **AI Focus**: Apply realistic depth-of-field and bokeh effects.

### Live & Multimodal
*   **Gemini Live**: Real-time, low-latency voice interaction with the AI assistant using `gemini-2.5-flash-native-audio-preview`.
*   **Multimodal Chat**: Analyze images, videos, and audio files within a chat interface. Supports text-to-speech.

## 🏗 Architecture

For a detailed technical breakdown of the system design, state management, and AI service layer, please refer to [ARCHITECTURE.md](./ARCHITECTURE.md).

### Quick Stats
*   **Framework**: React 19 with TypeScript.
*   **Build Tool**: Vite.
*   **Styling**: Tailwind CSS with a custom theming engine (supports dynamic RGB rainbows, dark/light modes).
*   **State Management**: React Context API (`EditorContext`, `HistoryContext`, `ThemeContext`).

## 🚀 Setup

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/yourusername/luminescent.git
    cd luminescent
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Configuration**:
    The app requires a Google Gemini API Key. This is injected via `process.env.API_KEY`.
    
    *Note: For Veo and Pro models, the app includes a dynamic key selector (`window.aistudio`) for hosted environments to ensure billing-enabled keys are used.*

4.  **Run Development Server**:
    ```bash
    npm run dev
    ```

## 📂 Project Structure

*   `components/`: UI components and Tool Panels (e.g., `ErasePanel`, `GeneratorView`, `VideoView`).
*   `services/`: API interaction logic (`geminiService.ts`).
*   `contexts/`: Global state providers.
*   `hooks/`: Custom React hooks (`useLiveSession`, `useHistoryState`).
*   `utils/`: Database helpers and image processing logic.
*   `i18n/`: Localization files.

## ❓ Troubleshooting

*   **Error 403 (Permission Denied)**: This usually means your API key does not have access to the specific model (e.g., Veo or Gemini 1.5 Pro). Ensure you are using a key from a Google Cloud Project with billing enabled.
*   **"Local Storage Full"**: Luminescent uses IndexedDB for heavy assets, but if you see this error, try clearing your browser cache or using the "Reset History" button in settings.
*   **Microphone Access Denied**: Ensure you have granted microphone permissions to the browser for the Gemini Live feature to work.

## 🤝 Contributing

Contributions are welcome! Please ensure any heavy image manipulation is handled in the Web Worker and that new AI features use the appropriate Gemini model version defined in the coding guidelines.
