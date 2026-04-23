import { Server } from "socket.io";
import { db } from "../server/db.ts";
import { analyzeVideo } from "../services/aiService.ts";
import { processClip } from "../services/videoService.ts";
import { v4 as uuidv4 } from "uuid";

export async function startProcessing(projectId: string, videoPath: string, io: Server) {
  try {
    io.emit("progress", { projectId, step: "transcribing", message: "Starting transcription and analysis..." });
    
    // Update status
    db.prepare("UPDATE projects SET status = 'processing' WHERE id = ?").run(projectId);

    // 1. Analysis Step (Simulation of transcription + analysis)
    const results = await analyzeVideo(videoPath);
    
    io.emit("progress", { projectId, step: "segmenting", message: "Identified viral moments. Generating clips..." });

    // 2. Clipping Step
    for (const result of results) {
      const clipId = uuidv4();
      
      // Save clip pending
      db.prepare(`
        INSERT INTO clips (id, project_id, title, start_time, end_time, viral_score, status, metadata) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        clipId, 
        projectId, 
        result.title, 
        result.startTime, 
        result.endTime, 
        result.viralScore, 
        'processing',
        JSON.stringify({ reasoning: result.reasoning })
      );

      // Process the clip with FFmpeg
      try {
        const clipPath = await processClip(videoPath, result.startTime, result.endTime, clipId);
        
        // Update clip status
        db.prepare("UPDATE clips SET status = 'completed', path = ? WHERE id = ?").run(clipPath, clipId);
        
        io.emit("clip-ready", { projectId, clipId, title: result.title });
      } catch (err) {
        console.error("Clip processing error:", err);
        db.prepare("UPDATE clips SET status = 'failed' WHERE id = ?").run(clipId);
      }
    }

    // 3. Finalize
    db.prepare("UPDATE projects SET status = 'completed' WHERE id = ?").run(projectId);
    io.emit("progress", { projectId, step: "completed", message: "Processing finished!" });

  } catch (error) {
    console.error("Workflow error:", error);
    db.prepare("UPDATE projects SET status = 'failed' WHERE id = ?").run(projectId);
    io.emit("progress", { projectId, step: "failed", message: "Error during processing." });
  }
}
