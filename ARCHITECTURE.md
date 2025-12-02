# Architecture Overview

Luminescent is a next-generation, client-side heavy application that leverages powerful server-side AI models from Google. This document outlines the key architectural decisions, patterns, and system design used in the codebase.

## 🛠️ Tech Stack

*   **Core**: React 19, TypeScript, Vite.
*   **Styling**: Tailwind CSS with a custom dynamic theming engine (RGB Rainbow support).
*   **AI Integration**: Google GenAI SDK (`@google/genai`).
*   **State Management**: React Context API (`EditorContext`, `HistoryContext`, `ThemeContext`).
*   **Storage**: IndexedDB (for large image blobs), LocalStorage (for user preferences).

## 📂 Directory Structure

*   `components/`: Reusable UI components.
    *   `*Panel.tsx`: Tool-specific control panels (e.g., `ErasePanel`, `FilterPanel`).
    *   `*View.tsx`: Main workspace views (e.g., `EditorView`, `GeneratorView`).
*   `contexts/`: Global state providers.
    *   `EditorContext`: The brain of the app. Manages the current image, active tool state, and coordinates AI operations.
    *   `LanguageContext`: Handles internationalization.
    *   `ThemeContext`: Manages the dynamic theme engine.
*   `hooks/`: Custom React hooks.
    *   `useHistoryState`: Manages the undo/redo stack and session persistence logic.
    *   `useLiveSession`: Manages the WebSocket connection and audio pipeline for Gemini Live.
*   `services/`: Business logic and API interaction.
    *   `geminiService.ts`: The abstraction layer for all AI model interactions. Handles model selection, config, and retries.
*   `utils/`: Helper functions.
    *   `db.ts`: IndexedDB wrapper for storing creations and editing history.
    *   `helpers.ts`: Image processing utilities and the **Inlined Web Worker**.
*   `i18n/`: Localization files for multi-language support.

## 🧩 Key Architectural Concepts

### 1. The Editor Engine
The editor revolves around the `EditorContext` and `EditorView`.
*   **Current Image**: The central piece of state is the `currentImage` (File object).
*   **History Stack**: Every destructive action (crop, filter, erase) pushes a new state to the `history` array managed by `useHistoryState`.
*   **Non-Blocking Processing**: Heavy image operations (compression, cropping, resizing, text compositing) are offloaded to a **Web Worker**.
    *   *Implementation Note*: The worker code is inlined as a string in `utils/helpers.ts` and instantiated via `URL.createObjectURL`. This ensures the worker runs correctly in various hosting environments where loading external worker files might face CORS or path resolution issues.

### 2. AI Service Layer (`geminiService.ts`)
This layer abstracts the `@google/genai` SDK. It is responsible for:
*   **Model Routing**: Choosing the right model for the task.
    *   `gemini-2.5-flash-image`: Fast edits, filters, basic generation.
    *   `gemini-3-pro-image-preview`: High-fidelity generation, upscaling, text rendering (Cardify).
    *   `veo-3.1`: Video generation.
*   **Error Handling**: Implements exponential backoff for rate limits (429) and handles safety blocks.
*   **Response Parsing**: Extracts image blobs or text from the complex Gemini response structure.

### 3. Gemini Live Implementation (`useLiveSession.ts`)
This hook manages the real-time, low-latency voice interaction.
*   **Audio Pipeline**: Uses the browser's `AudioContext`.
    *   **Input**: Captures microphone audio at **16kHz** (required by the model).
    *   **Output**: Receives raw PCM chunks from the model (typically **24kHz**).
*   **Stream Handling**: Uses `ScriptProcessorNode` to buffer and process raw audio data for transmission.
*   **Gapless Playback**: Manages a playback scheduling queue (`nextStartTime`) to ensure audio chunks played back sequentially without gaps or jitter.

### 4. Data Persistence & Performance
*   **IndexedDB**: To bypass LocalStorage size limits (usually 5MB), we use IndexedDB to store the full editing history and gallery creations (which can be large image/video blobs).
*   **Session Recovery**: On load, the app rehydrates the state from IndexedDB, allowing users to refresh the page without losing their work.

## 🎨 Theme Engine
The `ThemeContext` uses CSS Variables to enable dynamic theming.
*   The "Rainbow" theme uses a `requestAnimationFrame` loop to cycle HSL values, creating a smooth RGB effect on borders, text gradients, and accents.

