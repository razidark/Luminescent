
# Architecture Overview

Luminescent is a client-side heavy application.

## 🔐 API Key Security

Since this is a single-page application (SPA), environment variables injected via Vite (`process.env.API_KEY`) are technically accessible to the end-user via browser inspection.

### Mitigation Strategies:

1.  **Domain Whitelisting (Referrer Restriction)**:
    The primary security layer is restricting the API key to specific HTTP referrers in the Google Cloud Console. This ensures the key only works when requests originate from your hosted domain.

2.  **Quota Management**:
    Usage limits are enforced at the API provider level (Google Cloud) rather than the application level to prevent budget overruns.

3.  **Advanced Model Protection**:
    For high-cost models (like Veo or Pro Image), the app utilizes the `window.aistudio.openSelectKey()` interface when available, shifting the cost responsibility to the user if they have their own credentials.

## 🛠️ Tech Stack

*   **Core**: React 19, TypeScript, Vite.
*   **Storage**: IndexedDB for large image blobs.
*   **Processing**: Inlined Web Worker for non-blocking image manipulation.

## 🧩 Core Components

### AI Service Layer (`geminiService.ts`)
Handles communication with:
- `gemini-2.5-flash-image`
- `gemini-3-pro-image-preview`
- `veo-3.1-fast-generate-preview`

### History Engine (`useHistoryState.ts`)
Manages the undo/redo stack and persists state to IndexedDB.
