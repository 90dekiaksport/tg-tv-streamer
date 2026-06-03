/* c:\Users\msi\telegram-tv\server.js */
import express from "express";
import path from "path";
import fs from "fs";

const app = express();
const port = process.env.PORT || 3000;

// 🎛️ Admin Promotion Controls
const promoConfig = {
  showHomePromos: true, // Master toggle for home page promotions
  homePromos: [
    { text: "🔥 join VIP Betting Channel!", link: "https://t.me/zetena_dekika_sport", imageUrl: "https://cdn.jsdelivr.net/gh/90dekiaksport/radioimg@main/90dekika.png?raw=true" },
    { text: "⚽ Stream Live Matches in HD Here!", link: "https://t.me/bisrat_sport_433et", imageUrl: "https://cdn.jsdelivr.net/gh/90dekiaksport/radioimg@main/433sport.png?raw=true" }
  ],
  showStationPromo: true, // Toggle for the banner inside channel pages
  stationPromo: { 
    text: "💥 JOIN OUR CHANNEL", 
    link: "https://t.me/sponsor_link", 
    imageUrl: "https://cdn.jsdelivr.net/gh/90dekiaksport/radioimg@main/90dekika.png?raw=true" 
  }
};

// Global in-memory chat storage
let chatMessages = [];

app.set("view engine", "ejs");
app.set("views", path.join(process.cwd(), "views"));

app.use(express.json());
app.use("/player", express.static(path.join(process.cwd(), "player")));
app.use(express.static(path.join(process.cwd(), "public")));

// 🗂️ Dashboard Route
app.get("/", (req, res) => {
  const streams = JSON.parse(fs.readFileSync(path.join(process.cwd(), "player", "streams.json"), "utf8")).map(ch => {
    // Backward compatibility: Convert single src to servers array if necessary
    if (!ch.servers || ch.servers.length === 0) {
      ch.servers = [{ name: "Server 1", url: ch.src, type: ch.src.includes(".m3u8") ? "m3u8" : "iframe" }];
    }
    return ch;
  });
  res.render("index", { channels: streams, promoConfig });
});

// 📜 DMCA Policy Route
app.get("/dmca", (req, res) => {
  res.render("dmca");
});

// 📺 Dedicated Channel Detail Route
app.get("/channel/:id", (req, res) => {
  const streams = JSON.parse(fs.readFileSync(path.join(process.cwd(), "player", "streams.json"), "utf8"));
  let channel = streams.find(c => c.id === req.params.id);
  if (!channel) return res.redirect("/");
  
  if (!channel.servers || channel.servers.length === 0) {
    channel.servers = [{ name: "Server 1", url: channel.src, type: channel.src.includes(".m3u8") ? "m3u8" : "iframe" }];
  }
  res.render("player", { channel, promoConfig });
});

// 💬 Chat API Endpoints
app.get("/api/chat/:channelId", (req, res) => {
  const channelId = req.params.channelId;
  const channelMessages = chatMessages.filter(m => m.channelId === channelId);
  res.json(channelMessages);
});

app.post("/api/chat/:channelId", (req, res) => {
  const { username, text } = req.body;
  if (!text) return res.status(400).send("Message text is required");

  const newMessage = {
    channelId: req.params.channelId,
    // Sanitize username for display
    username: username ? username.substring(0, 20) : "Guest",
    text,
    timestamp: Date.now()
  };

  chatMessages.push(newMessage);
  if (chatMessages.length > 200) chatMessages.shift(); // Keep memory lean on Render free tier
  res.status(201).json(newMessage);
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
