# 🌟 Luminescent

**Luminescent** is a state-of-the-art, AI-native creative suite designed for the modern web. Built atop Google's most advanced Gemini models, it bridges the gap between professional photo editing and generative imagination.

## 🚀 Key Features

### 🎨 Generative Studio
- **Imagen 3 Integration**: Generate stunning visuals with "Standard" and "Pro" modes.
- **AI Variations**: Reinterpret your photos with adjustable creativity levels.
- **Sketch-to-Image**: Transform rough strokes into high-fidelity artwork.
- **Generative Expand**: Seamlessly outpaint and extend your canvas using AI.

### 🔍 Vision Intelligence
- **Deep Inspector**: Analyze composition, lighting, and artistic styles.
- **Smart Select**: Pixel-perfect object detection and automatic masking.
- **Live Assistant**: Real-time voice interaction with Gemini 2.5 Flash for creative brainstorming.

### 🛠️ Professional Editing
- **Non-Destructive History**: Infinite undo/redo with local persistence.
- **Product Studio**: Instant background removal and realistic shadow generation.
- **AI Restoration**: Fix scratches and enhance clarity on vintage photos.

## 🏗️ Technology Stack
- **Framework**: React 19 (Strict Mode)
- **Styling**: Tailwind CSS with custom Glassmorphism & Rainbow themes.
- **Storage**: IndexedDB for high-performance local binary storage (No data leaves your device).
- **Processing**: Inlined Web Workers for multi-threaded image manipulation.
- **AI Engine**: Google GenAI SDK (Gemini 3 Pro, 3 Flash, and Veo 3.1).

## 🔐 Launch & Security (Vercel Ready)

Luminescent is designed to be deployed effortlessly on Vercel or Netlify.

### ⚠️ Critical Security Step
Since this is an SPA, your `API_KEY` is technically accessible in the client bundle. To prevent unauthorized use:
1. **Restrict your API Key**: Go to [Google Cloud Console > Credentials](https://console.cloud.google.com/apis/credentials).
2. **Referrer Restrictions**: Add your production domains (e.g., `https://your-app.vercel.app/*`).
3. **Quotas**: Set a reasonable daily budget in the AI Studio console.

## 💻 Development

```bash
npm install
# Set API_KEY in your .env or environment variables
npm run dev
```

---
Made with ❤️ by Raziel & Gemini.