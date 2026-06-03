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
// 🔄 Global Subscriber Array Setup
let liveSubscribers = [];

// Initialize global channels for the background scheduler
const streamsPath = path.join(process.cwd(), "player", "streams.json");
global.channels = JSON.parse(fs.readFileSync(streamsPath, "utf8"));

app.set("view engine", "ejs");
app.set("views", path.join(process.cwd(), "views"));

app.use(express.json());
app.use("/player", express.static(path.join(process.cwd(), "player")));
app.use(express.static(path.join(process.cwd(), "public")));

// ⏰ 15-Minute Advance 'setInterval' Loop
setInterval(() => {
    const now = new Date();
    if (!global.channels || !Array.isArray(global.channels)) return;

    global.channels.forEach(match => {
        // Skip if already notified or if no kickoff time is defined
        if (match.notificationSent || !match.kickoffISO) return;

        try {
            const kickoffDate = new Date(match.kickoffISO);
            if (isNaN(kickoffDate.getTime())) return;

            // Calculate the exact window: Kickoff Time minus 15 minutes
            const notificationWindow = new Date(kickoffDate.getTime() - (15 * 60 * 1000));

            // If the current time hits or passes that 15-minute advance warning mark
            if (now >= notificationWindow) {
                sendLiveNotification(match.id, match.title);
                match.notificationSent = true; // Mark true so it never repeats
                console.log(`[Notification System] 15-minute advance alert fired for: ${match.title}`);
            }
        } catch (error) {
            console.error(`[Scheduler Error] Failed processing match ID ${match.id}:`, error);
        }
    });
}, 60000);

// 🚀 Core Notification Bot Dispatcher Function
async function sendLiveNotification(channelId, matchName) {
    const botToken = process.env.TG_TOKEN;
    // Replace 'YOUR_BOT_USERNAME' with your actual bot username
    const botUsername = "90_dekika_bot"; 
    
    const matchSubscribers = liveSubscribers.filter(sub => sub.channelId === channelId);
    
    for (const sub of matchSubscribers) {
        const text = `⚽ *Incoming Match Alert!*\n\n"${matchName}" starts in *15 minutes*! Get ready to watch the action live.`;
        const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

        try {
            await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: sub.userId,
                    text: text,
                    parse_mode: "Markdown",
                    reply_markup: {
                        inline_keyboard: [[
                            { text: "📺 Open Match Now", url: `https://t.me/${botUsername}/app?startapp=${channelId}` }
                        ]]
                    }
                })
            });
        } catch (err) {
            console.error(`[Dispatcher Error] Failed to notify user ${sub.userId}:`, err.message);
        }
    }

    // Flush subscribers for this match after dispatch
    liveSubscribers = liveSubscribers.filter(sub => sub.channelId !== channelId);
}

// 🗂️ Dashboard Route
app.get("/", (req, res) => {
  const streams = global.channels.map(ch => {
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
  let channel = global.channels.find(c => c.id === req.params.id);
  if (!channel) return res.redirect("/");
  
  if (!channel.servers || channel.servers.length === 0) {
    channel.servers = [{ name: "Server 1", url: channel.src, type: channel.src.includes(".m3u8") ? "m3u8" : "iframe" }];
  }
  res.render("player", { channel, promoConfig });
});

//  Frontend Subscription Endpoint
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
  
  const match = global.channels.find(c => c.id === channelId);
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
