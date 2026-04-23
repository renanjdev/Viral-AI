import { Express } from "express";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import { db } from "./db.ts";
import { startProcessing } from "../workers/coordinator.ts";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const upload = multer({ storage });

export function setupApiRoutes(app: Express) {
  // Upload Video
  app.post("/api/upload", upload.single("video"), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No video file uploaded" });
    }

    const projectId = uuidv4();
    const name = req.body.name || req.file.originalname;
    const videoPath = req.file.path;

    db.prepare("INSERT INTO projects (id, name, original_video_path) VALUES (?, ?, ?)")
      .run(projectId, name, videoPath);

    // Start background processing
    startProcessing(projectId, videoPath, app.get("socketio"));

    res.json({ projectId, message: "Upload successful, processing started" });
  });

  // Get Projects
  app.get("/api/projects", (req, res) => {
    const projects = db.prepare("SELECT * FROM projects ORDER BY created_at DESC").all();
    res.json(projects);
  });

  // Get Project Clips
  app.get("/api/projects/:id/clips", (req, res) => {
    const clips = db.prepare("SELECT * FROM clips WHERE project_id = ?").all(req.params.id);
    res.json(clips);
  });

  // Get Status
  app.get("/api/projects/:id", (req, res) => {
    const project = db.prepare("SELECT * FROM projects WHERE id = ?").get(req.params.id);
    if (!project) return res.status(404).json({ error: "Project not found" });
    res.json(project);
  });
}
