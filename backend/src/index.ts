import { createApp } from "./app";
import { setupVite, serveStatic, log } from "./vite";

const app = createApp();

(async () => {
  if (app.get("env") === "development") {
    await setupVite(app, undefined);
  } else {
    serveStatic(app);
  }

  const PORT = Number(process.env.PORT) || 5000;
  app.listen(PORT, "0.0.0.0", () => {
    log(`serving on port ${PORT}`);
  });
})();