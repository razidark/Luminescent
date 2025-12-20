# Contributing to Luminescent

Thank you for your interest in contributing to Luminescent! We welcome contributions from the community to help make this the best AI-powered creative suite on the web.

## 🚀 Getting Started

1.  **Fork the repository** on GitHub.
2.  **Clone your fork** locally:
    ```bash
    git clone https://github.com/your-username/luminescent.git
    cd luminescent
    ```
3.  **Install dependencies**:
    ```bash
    npm install
    ```
4.  **Set up Environment**:
    Ensure you have a valid Google Gemini API Key. In development, you can set this in a `.env` file as `API_KEY=your_key_here` (if using a local backend proxy) or rely on the application's built-in key selector for hosted demos.

5.  **Run the development server**:
    ```bash
    npm run dev
    ```

## 🛠️ Coding Guidelines

### AI Model Usage
We adhere to strict guidelines regarding Google GenAI models:
*   **Text & Analysis**: Use `gemini-2.5-flash` for speed and `gemini-3-pro-preview` for complex reasoning.
*   **Image Generation**: Use `gemini-2.5-flash-image` for standard tasks and `gemini-3-pro-image-preview` for high-quality output.
*   **Video**: Use `veo-3.1-fast-generate-preview`.
*   **Audio**: Use `gemini-2.5-flash-native-audio-preview-09-2025`.

### Performance
*   **Heavy Operations**: Any CPU-intensive image manipulation (compression, resizing, pixel manipulation) **must** be offloaded to the Web Worker (`utils/helpers.ts`).
*   **State**: Use React Context for global state, but keep local UI state local to prevent unnecessary re-renders.

### Styling
*   Use **Tailwind CSS** for all styling.
*   Support both **Light** and **Dark** modes using the `dark:` modifier.
*   Use CSS variables (e.g., `var(--theme-accent)`) for dynamic theming.

##  Pull Request Process

1.  Create a new branch for your feature or fix: `git checkout -b feature/amazing-feature`.
2.  Commit your changes with clear, descriptive messages.
3.  Push to your fork and submit a Pull Request to the `main` branch.
4.  Provide a clear description of the changes and any relevant screenshots.

## 📄 License

By contributing, you agree that your contributions will be licensed under the project's [Apache 2.0 License](./LICENSE).
