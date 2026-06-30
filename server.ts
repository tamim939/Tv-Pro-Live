import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Live visitor count state
  let visitorCount = 0;
  const activeVisitors = new Set<string>();

  app.use(express.json());

  // API to get visitor count
  app.get("/api/visitors", (req, res) => {
    // In a real app, you'd use a more robust way to track active sessions
    // For this example, we'll return a simulated but slightly dynamic number
    // to give it a "live" feel, or just return the tracked count.
    res.json({ count: Math.max(1, visitorCount) });
  });

  // Track visitor (simple heart-beat)
  app.post("/api/visitor/heartbeat", (req, res) => {
    const { visitorId } = req.body;
    if (visitorId) {
      activeVisitors.add(visitorId);
      visitorCount = activeVisitors.size;
      
      // Cleanup after 30 seconds of inactivity (simulated)
      setTimeout(() => {
        activeVisitors.delete(visitorId);
        visitorCount = activeVisitors.size;
      }, 30000);
    }
    res.json({ status: "ok", count: visitorCount });
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
