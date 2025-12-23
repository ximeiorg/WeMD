import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

import path from "path";

export default defineConfig({
  base: "./",
  resolve: {
    alias: {
      "@wemd/core": path.resolve(__dirname, "../../packages/core/src/index.ts"),
    },
  },
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom"],
          codemirror: [
            "codemirror",
            "@codemirror/lang-markdown",
            "@codemirror/language",
            "@codemirror/state",
            "@codemirror/view",
            "@uiw/codemirror-theme-github",
          ],
        },
      },
    },
  },
});
