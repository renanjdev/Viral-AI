import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import { setupApiRoutes } from "./src/server/routes.ts";
import { initDatabase } from "./src/server/db.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  const PORT = 3000;

  // Initialize Database
  initDatabase();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use("/uploads", express.static(path.join(__dirname, "uploads")));

  // WebSocket for progress updates
  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);
    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });

  // Attach io to app for use in routes/workers
  app.set("socketio", io);

  // Setup API Routes
  setupApiRoutes(app);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// Ensure uploads directory exists
import fs from "fs";
if (!fs.existsSync("./uploads")) {
  fs.mkdirSync("./uploads");
}

startServer();
