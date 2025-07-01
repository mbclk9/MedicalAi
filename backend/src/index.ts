import { createApp } from "./app";
import { setupVite, serveStatic, log } from "./vite";

const app = createApp();

(async () => {
  const port = process.env.PORT || 5000;
  const server = app.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
  });

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
})();