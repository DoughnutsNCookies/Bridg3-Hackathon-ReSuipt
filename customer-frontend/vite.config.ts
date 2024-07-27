import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      includeAssets: ["192.png", "512.png"],
      manifest: {
        name: "Suiecpts",
        short_name: "Suiecpts",
        description: "Best Project",
        theme_color: "#ffffff",
        icons: [
          {
            src: "192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
      srcDir: "src",
      registerType: "autoUpdate",
      devOptions: { enabled: true },
    }),
  ],
});
