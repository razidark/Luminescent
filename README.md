
# Luminescent

**Luminescent** is a next-generation, web-based creative suite powered by Google's Gemini and Imagen models.

## ⚠️ Security Note (Hosting)

When hosting this app on platforms like Vercel or Netlify using `process.env.API_KEY`, the key is bundled into the frontend. **To prevent unauthorized use and costs:**

1.  **Restrict your API Key**: Go to the [Google Cloud Console](https://console.cloud.google.com/apis/credentials), edit your API Key, and under "Application restrictions", choose **Websites**. Add your domain (e.g., `https://your-app.vercel.app/*`).
2.  **Set Quotas**: Limit the number of requests per day in the Google Cloud/AI Studio console to avoid unexpected bills.

## 🌟 Features

### Generative AI Tools
*   **Image Generation**: Create high-fidelity images. Supports **Standard** (Fast) and **Pro** (High-Res) modes.
*   **Video Creation**: Generate videos from text prompts or animate static images using `veo-3.1`.
*   **Variations**: Generate stylistic or compositional variations.

### AI Editing Suite
*   **Magic Erase & Retouch**: Remove objects or enhance portraits.
*   **Generative Expand**: Outpaint images to extend the canvas.
*   **AI Inspector**: Get deep technical breakdowns of any image.

## 🏗 Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for details.

### Quick Stats
*   **Framework**: React 19 + Vite.
*   **Styling**: Tailwind CSS.
*   **AI SDK**: `@google/genai`.

## 🚀 Setup

1.  `npm install`
2.  Set `API_KEY` in your hosting environment variables.
3.  `npm run dev`
