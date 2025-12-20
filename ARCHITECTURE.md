# System Architecture

Luminescent follows a "Thick Client, Thin Server" philosophy. Almost all heavy lifting happens inside the user's browser to maximize privacy and responsiveness.

## 🔄 Data Lifecycle

1. **Input**: Images are processed via `FileReader` and immediately compressed using a dedicated **Web Worker**.
2. **Storage**: Compressed Blobs are stored in **IndexedDB**. This bypasses the 5MB limit of LocalStorage, allowing for massive editing sessions.
3. **History**: The `useHistoryState` hook manages a pointer-based undo/redo stack. It serializes Blobs to IndexedDB after every successful AI operation.
4. **AI Processing**: 
   - **Flash Models**: Used for real-time vision, object detection, and quick edits.
   - **Pro Models**: Used for complex reasoning (Meme captions, Cardify logic) and high-res image generation.
   - **Live API**: Utilizes WebSockets for raw PCM audio streaming.

## 🧵 Multithreading (Web Workers)

To prevent the UI from freezing during pixel-intensive tasks (like cropping, text rendering, or format conversion), Luminescent uses an inlined Web Worker in `utils/helpers.ts`. 

The worker handles:
- Canvas compositing.
- Real-time image compression.
- Format conversion (WEBP/PNG/JPEG).
- Complex cropping logic.

## 🎨 Design System

The UI uses a custom **Glassmorphism** engine implemented via Tailwind CSS. 
- **Dynamic Theming**: CSS Variables are injected via `ThemeContext`.
- **Rainbow Mode**: Uses `requestAnimationFrame` to cycle HSL values across the entire application interface, creating a unique "Luminescent" glow.

## 📡 API Interaction

The app uses the `@google/genai` SDK. It implements a **Retry-with-Backoff** strategy for transient network errors and includes a unique "Requested entity not found" handler that automatically prompts the user to select a valid API key via the AI Studio bridge.