import express from "express";
import path from "path";
import fs from "fs";

const app = express();
const port = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(process.cwd(), "views"));

app.use("/player", express.static(path.join(process.cwd(), "player")));
app.use(express.static(path.join(process.cwd(), "public")));

// 🗂️ Dashboard Route
app.get("/", (req, res) => {
  const streams = JSON.parse(fs.readFileSync(path.join(process.cwd(), "player", "streams.json"), "utf8"));
  res.render("index", { channels: streams });
});

// 📺 Dedicated Channel Detail Route
app.get("/channel/:id", (req, res) => {
  const streams = JSON.parse(fs.readFileSync(path.join(process.cwd(), "player", "streams.json"), "utf8"));
  const channel = streams.find(c => c.id === req.params.id);
  if (!channel) return res.redirect("/");
  res.render("player", { channel });
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
