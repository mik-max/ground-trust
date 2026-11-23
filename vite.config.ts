import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

// In development, serve the share-image function (api/og.ts, a Vercel
// function in production) from this dev server, ahead of the /api proxy
// to the backend.
function shareImagesInDev(): Plugin {
  return {
    name: "share-images-in-dev",
    apply: "serve",
    configureServer(server) {
      process.env.PREVIEW_API_BASE ??= "http://localhost:8000/api";
      server.middlewares.use("/api/og", async (req, res) => {
        try {
          const { GET } = await server.ssrLoadModule("/api/og.ts");
          const response: Response = await GET(new Request(`http://localhost${req.originalUrl ?? req.url}`));
          res.statusCode = response.status;
          response.headers.forEach((value, key) => res.setHeader(key, value));
          res.end(Buffer.from(await response.arrayBuffer()));
        } catch (err) {
          res.statusCode = 500;
          res.end(String(err));
        }
      });
    },
  };
}

// Installable app (PWA). The service worker is our own (src/sw.ts): it keeps
// the app's files for quick, low-data starts and shows the night check-in
// reminders. The plugin builds it and fills in the list of files to keep.
// It only runs in production builds; `yarn build && yarn preview` to try it.
const pwa = VitePWA({
  strategies: "injectManifest",
  srcDir: "src",
  filename: "sw.ts",
  injectRegister: "script-defer",
  injectManifest: { globPatterns: ["**/*.{js,css,html,svg}"] },
  manifest: {
    id: "/",
    name: "GroundTrust",
    short_name: "GroundTrust",
    description: "Know a neighbourhood before you move in. Power, water, security, flooding and access, rated by the residents who live there.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f5f6f4",
    theme_color: "#111715",
    icons: [
      { src: "/pwa-192.png", sizes: "192x192", type: "image/png" },
      { src: "/pwa-512.png", sizes: "512x512", type: "image/png" },
      { src: "/pwa-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    // Long-press the app icon (Android) for a one-tap night check-in.
    shortcuts: [
      {
        name: "Check in at home tonight",
        short_name: "Check in",
        url: "/my-contributions?checkin=1",
        icons: [{ src: "/pwa-192.png", sizes: "192x192", type: "image/png" }],
      },
    ],
  },
});

export default defineConfig({
  plugins: [shareImagesInDev(), react(), tailwindcss(), pwa],
  server: {
    proxy: {
      "/api": "http://localhost:8000",
    },
  },
});
