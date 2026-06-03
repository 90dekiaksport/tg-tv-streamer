/* c:\Users\msi\telegram-tv\server.js */
import express from "express";
import path from "path";
import fs from "fs";
import { bot } from './bot.js';

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
let liveSubscribers = [];

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

// 🔔 Notification Subscription Endpoint
app.post("/api/notifications/subscribe", (req, res) => {
  const { userId, channelId } = req.body;
  if (!userId || !channelId) return res.status(400).send("Missing userId or channelId");

  // Store preference (preventing duplicates)
  const exists = liveSubscribers.some(s => s.userId === userId && s.channelId === channelId);
  if (!exists) {
    liveSubscribers.push({ userId, channelId });
  }
  
  res.json({ success: true, message: "Subscribed successfully" });
});

// 🛠️ Mockup Admin Trigger (Call this to notify users when a specific match goes live)
// Usage: GET /api/admin/trigger-live/mexico-southafrica
app.get("/api/admin/trigger-live/:channelId", (req, res) => {
  const { channelId } = req.params;
  const subscribers = liveSubscribers.filter(sub => sub.channelId === channelId);
  
  const streams = JSON.parse(fs.readFileSync(path.join(process.cwd(), "player", "streams.json"), "utf8"));
  const match = streams.find(c => c.id === channelId);
  const title = match ? match.title : "Your Match";

  subscribers.forEach(sub => {
    bot.sendMessage(sub.userId, `🔔 LIVE NOW: ${title.toUpperCase()}\n\nClick the button below to start watching immediately!`, {
      reply_markup: {
        inline_keyboard: [[{ text: "📺 Watch Live", web_app: { url: "https://tg-tv-streamer.onrender.com/" } }]]
      }
    }).catch(err => console.error(`Bot failed to notify ${sub.userId}:`, err.message));
  });

  // Clear subscribers for this match after notification is sent
  liveSubscribers = liveSubscribers.filter(sub => sub.channelId !== channelId);
  
  res.send(`Notifications sent to ${subscribers.length} users for ${title}`);
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
