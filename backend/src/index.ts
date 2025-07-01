import { createApp } from "./app";
import { setupVite, serveStatic, log } from "./vite";

const app = createApp();

(async () => {
  const server = app.listen(5000, "0.0.0.0", () => {
    log(`serving on port 5000`);
  });

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
})();