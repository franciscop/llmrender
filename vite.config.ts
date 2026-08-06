import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: "src/index.tsx",
      formats: ["es"],
      fileName: () => "index.min.js",
    },
    rollupOptions: { external: ["react/jsx-runtime"] },
    minify: "terser",
    terserOptions: {
      mangle: {
        properties: {
          // Internal-only fields: never DOM props, never string-indexed.
          regex:
            /^(value|rows|lines|level|items|ordered|aligns|headers|attrs|cls|tag|url|child|top|bot|content|text|regex|render)$/,
        },
      },
    },
    sourcemap: false,
  },
  test: {
    environment: "jsdom",
    globals: true,
  },
});
