import express from "express";
import path from "path";

const app = express();
const port = process.env.PORT || 3000;

// Serve the 'player' folder as static files
// This makes index.html and streams.json accessible
app.use("/player", express.static(path.join(process.cwd(), "player")));
app.use(express.static(path.join(process.cwd(), "public")));

// Route the root URL to serve the premium player UI
app.get("/", (req, res) => {
  res.sendFile(path.join(process.cwd(), "player", "index.html"));
});

app.listen(port, () => {
  console.log(`Web app running at http://localhost:${port}`);
});

// Paste this at the absolute bottom of server.js to load your bot safely!
import('./bot.js').then(() => {
  console.log("🚀 Success! Bot script imported and listening directly inside the server pipeline.");
}).catch((err) => {
  console.error("❌ Failed to initialize bot bundle directly:", err);
});
