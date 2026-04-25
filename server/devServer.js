import express from "express";
import { registerApiRoutes } from "./routes.js";

const app = express();
const PORT = Number(process.env.API_PORT || 8787);

app.use(express.json({ limit: "256kb" }));
registerApiRoutes(app);

app.listen(PORT, () => {
  console.log(`PsycheGarden API dev server running on port ${PORT}`);
});
