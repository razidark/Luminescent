# 🌌 Luminescent

Luminescent is a state-of-the-art, web-based creative suite designed for the next generation of content creators. It merges powerful photo editing capabilities with cutting-edge **Generative AI**, allowing you to edit, transform, and create visual media seamlessly.

---

## ✨ Key Features

### 🎨 Generative AI Power
- **Smart Erase & Replace**: Paint over unwanted objects or describe new elements to add.
- **Generative Backgrounds**: One-click background removal followed by AI-driven scene generation.
- **Imagen 3 Integration**: Generate high-fidelity images from pure text prompts.
- **Video Generation**: Transform static images into dynamic video clips using Google's Veo 3.1.

### 🎭 Creative Studio
- **Cinematic Filters**: Professional-grade filters (Blade Runner, Wes Anderson, Mad Max) with **intelligent local fallbacks** for offline use.
- **AI Cardify**: Transform your photos into interactive 3D trading cards (Pokémon, Magic, etc.).
- **Smart Select**: Precise object detection and masking powered by AI vision.
- **Photo Restoration**: Fix scratches and enhance clarity on old or damaged photos.

### 🚀 Premium Experience
- **Glassmorphism UI**: A sleek, modern interface with vibrant gradients and smooth animations.
- **Dynamic Themes**: Over 15 customizable themes (Luminescence, Neon, Matrix, etc.).
- **Keyboard Shortcuts**: Power-user tools for Undo/Redo, Peeking original, and Pan/Zoom.
- **Responsive Design**: Fully optimized for both desktop and mobile creative workflows.

---

## 🛠️ Technical Architecture

Luminescent is built with a focus on speed, reliability, and modern web standards:

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS + Custom Animations
- **AI Integration**: Google Generative AI SDK (v1beta)
- **Reliability Layer**:
    - **Model Fallback Chain**: Automatically switches between `gemini-3.1-flash-image-preview` and `gemini-3-pro-image-preview` if primary models fail.
    - **Local Processing**: Heavy use of `OffscreenCanvas` and Web Workers for real-time filters and adjustments without API latency.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- A Google [AI Studio API Key](https://aistudio.google.com/app/apikey)

### Installation
1.  **Clone the repository**:
    ```bash
    git clone <your-repo-url>
    cd Luminescent
    ```
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Configure your API key**:
    Open **Settings** in the app, enter your personal Gemini API key, and save it. The key is stored in this app's local settings and is not embedded in the build.
4.  **Run Development Server**:
    ```bash
    npm run dev
    ```

---

## 🔧 Troubleshooting

### "IMAGE_OUTPUT_NOT_SUPPORTED" or "Quota Exceeded"
Most generative features require the **IMAGE** modality. If you encounter these errors:
- **Billing**: Ensure you have a **paid billing plan** (Pay-as-you-go) enabled in AI Studio. Free tiers for image generation are extremely limited.
- **Model Choice**: Open **AI Settings** in the app and select **Gemini 3.1 Flash Image**.
- **Region**: Ensure your API key is used in a region that supports Gemini multimodal output.

### Filters Not Loading
If the AI filter fails, the app will automatically attempt to apply a **local fallback**. If this also fails, check if your browser supports `OffscreenCanvas`.

---

## 📄 License
This project is licensed under the Apache-2.0 License.

---

<div align="center">
Made with ❤️ by <b>Raziel</b> & <b>Gemini</b>.
</div>
