# Luminescent - Architecture & Developer Guide

## 1. Project Overview

**Luminescent** is a client-side heavy, single-page application (SPA) built for advanced AI photo editing. It bridges standard web technologies (Canvas API, Web Audio API) with state-of-the-art AI models (Gemini, Imagen, Veo).

### Core Tech Stack
*   **Framework**: React 19 (Functional components, Hooks context-based state).
*   **Language**: TypeScript (Strict typing for robustness).
*   **Build System**: Vite.
*   **Styling**: Tailwind CSS (Utility-first, Dark mode native).
*   **AI Integration**: Google GenAI SDK (`@google/genai`).
*   **Local Storage**: IndexedDB (via `utils/db.ts`) for persisting heavy image blobs.

---

## 2. Directory Structure & Key Files

### Root Level
| File | Purpose |
| :--- | :--- |
| `App.tsx` | The application shell. Handles high-level routing (Tabs: Home, Editor, Gallery, Chat) and global modals. |
| `index.tsx` | Entry point. Wraps the App in `ErrorBoundary`, `LanguageProvider`, `ThemeProvider`, and `BackgroundProvider`. |
| `types.ts` | **Critical**. Contains shared interfaces (`HistoryItem`, `Tab`, `Creation`). Modify this first when adding new data structures. |
| `metadata.json` | Configuration for permissions (microphone, geolocation). |

### `/components` (The UI Layer)
The UI is modularized into atoms (icons, sliders) and organisms (panels, views).

*   **Views (Top-Level Layouts)**
    *   `StartScreen.tsx`: The landing page with "Tilt Cards" and entry points.
    *   `EditorView.tsx`: The core workspace. Manages the split between the `DrawingCanvas` (left) and `*Panel` (right).
    *   `ChatView.tsx`: The conversational AI interface. Handles text/voice streaming.
    *   `GalleryView.tsx`: Grid view for saved creations using `GalleryThumbnail`.
    *   `GeneratorView.tsx` / `VideoView.tsx`: Specialized views for T2I and T2V tasks.

*   **Core Editor Components**
    *   `DrawingCanvas.tsx`: A complex canvas wrapper handling masking strokes, rectangles (smart select), and image compositing. Uses `forwardRef` to expose logic like `exportMask`.
    *   `ZoomPanWrapper.tsx`: A robust HOC (Higher Order Component) that provides Pan, Zoom, Rotate, and Flip functionality using CSS transforms.
    *   `CompareSlider.tsx`: A Before/After comparison tool.

*   **Tool Panels (Right Sidebar)**
    *   Each tool has a corresponding panel (e.g., `MagicErasePanel`, `FilterPanel`, `RetouchPanel`).
    *   **Pattern**: Panels accept props for state (brush size, prompt) and callbacks (`onApply`). They *do not* contain API logic; they delegate to `EditorContext`.

### `/contexts` (The State Layer)
Global state is divided by domain to prevent unnecessary re-renders.

*   `EditorContext.tsx`: **The Brain.**
    *   Holds the `currentImage` state.
    *   Contains the `handle*` functions (e.g., `handleMagicErase`) that bridge the UI and the Service layer.
    *   Manages loading states and errors.
*   `ThemeContext.tsx`: Handles CSS variable injection for dynamic theming.
*   `LanguageContext.tsx`: Manages i18n strings.
*   `BackgroundContext.tsx`: Toggles the animated background canvas.

### `/services` (The Logic Layer)
*   `geminiService.ts`: **The Engine.**
    *   Contains all calls to `@google/genai`.
    *   **Rules**:
        *   Input: `File` objects or Base64 strings.
        *   Output: `Promise<string>` (Base64 image) or `Promise<JSON>`.
        *   Error Handling: Includes retry logic (`withRetry`) and safety filter checks.

### `/utils` (Helpers)
*   `db.ts`: IndexedDB wrapper. Used to save "Creations" and the "Current Session" (Undo history) persistently.
*   `helpers.ts`: Contains the **Inline Web Worker**.
    *   *Note*: Instead of a separate `worker.ts` file, the worker code is defined as a string blob here. This ensures portability and avoids CORS/MIME issues in some hosting environments.
    *   Handles CPU-intensive tasks: Image Compression, Format Conversion, Text Overlay, Meme Generation.

---

## 3. Data Flow Architecture

### The "Edit" Lifecycle
1.  **User Action**: User clicks "Apply" in `MagicErasePanel`.
2.  **Panel**: Calls `onGenerate` prop.
3.  **View**: `EditorView` passes this to `EditorContext.handleMagicErase`.
4.  **Context**: 
    *   Sets `isLoading = true`.
    *   Calls `geminiService.generateInpaintedImage(image, mask, prompt)`.
5.  **Service**:
    *   Uploads bits to Gemini API.
    *   Receives generated image blob.
    *   Returns Base64 string.
6.  **Context**: 
    *   Converts Base64 to `File`.
    *   Calls `addImageToHistory(newImage)`.
7.  **Hook**: `useHistoryState` updates the `history` array.
8.  **Render**: `EditorView` detects new `currentImage` and re-renders the Canvas.

---

## 4. Extension Guide

### How to Add a New Tool (e.g., "Noise Reduction")

1.  **Define the Interface**:
    *   Update `types.ts`: Add `'noise-reduction'` to the `Tab` type.

2.  **Create the Icon**:
    *   Update `components/icons.tsx`: Export a `NoiseIcon`.

3.  **Implement the Service**:
    *   Update `services/geminiService.ts`: Add `generateDenoisedImage(file, intensity)`. Use the standard `_generateImageEdit` helper.

4.  **Create the UI Panel**:
    *   Create `components/NoisePanel.tsx`.
    *   Add sliders/buttons.
    *   Accept `onApply` prop.

5.  **Update State Management**:
    *   Update `contexts/EditorContext.tsx`: Add `handleApplyNoise`. Wire it to call the service.

6.  **Integrate into Editor**:
    *   Update `components/Toolbar.tsx`: Add the button.
    *   Update `components/EditorView.tsx`: Add the `case 'noise-reduction':` switch to render your panel.

7.  **Localization**:
    *   Update `i18n/locales/en.ts` and `pt-BR.ts` with tooltips and labels.

---

## 5. Critical Maintenance Notes

*   **API Keys**: Never hardcode API keys. They are injected via `process.env.API_KEY` (handled by Vite/Environment).
*   **Context Performance**: The `EditorContext` value is memoized using `useMemo`. If you add new state, ensure it's added to the dependency array.
*   **Web Worker**: If modifying image processing logic, edit the `workerCode` string in `utils/helpers.ts`. Remember that this code runs in an isolated scope (no external imports allowed inside the string).
*   **IndexedDB**: When changing the `HistoryItem` structure, consider if `DB_VERSION` in `utils/db.ts` needs bumping to handle schema migrations.

## 6. Known "Ghost" Files
*   `EditorView.tsx` (Root): This file may exist in the root but is unused. The active component is `components/EditorView.tsx`.
*   `workers/image.worker.ts`: Empty by design; logic moved to `utils/helpers.ts`.
