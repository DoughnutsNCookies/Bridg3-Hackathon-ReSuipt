import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "prompt",
      includeAssets: [
        "icon.png",
        "logo.png",
        "logoText.png",
        "logoMerchant.png",
      ],
      manifest: {
        name: "ReSuipt Merchant",
        short_name: "ReSuipt Merchant",
        description: "ReSuipt Merchant App",
        theme_color: "#ffffff",
        icons: [
          {
            src: "icon.png",
            sizes: "500x500",
            type: "image/png",
          },
        ],
      },
      srcDir: "src",
      scope: "/",
      devOptions: { enabled: true },
    }),
  ],
});
