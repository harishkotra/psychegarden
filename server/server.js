import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { registerApiRoutes } from "./routes.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, "../dist");

app.use(express.json({ limit: "256kb" }));
registerApiRoutes(app);
app.use(express.static(distPath));

app.get("*", (_req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

const PORT = Number(process.env.PORT || 8080);
app.listen(PORT, () => {
  console.log(`PsycheGarden server running on port ${PORT}`);
});
