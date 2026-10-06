import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

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

export default defineConfig({
  plugins: [shareImagesInDev(), react(), tailwindcss()],
  server: {
    proxy: {
      "/api": "http://localhost:8000",
    },
  },
});
