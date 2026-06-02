import express from "express";
import path from "path";

const app = express();
const port = process.env.PORT || 3000;

const channels = {
  brazil_france: {
    title: "Brazil vs France",
    schedule: "23:00 PM THURSDAY",
    streamUrl: "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8",
    logoLeft: "https://upload.wikimedia.org/wikipedia/en/0/05/Flag_of_Brazil.svg",
    logoRight: "https://upload.wikimedia.org/wikipedia/en/c/c3/Flag_of_France.svg"
  },
  argentina_germany: {
    title: "Argentina vs Germany",
    schedule: "20:00 PM FRIDAY",
    streamUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    logoLeft: "https://upload.wikimedia.org/wikipedia/commons/1/1a/Flag_of_Argentina.svg",
    logoRight: "https://upload.wikimedia.org/wikipedia/en/b/ba/Flag_of_Germany.svg"
  },
  italy_spain: {
    title: "Italy vs Spain",
    schedule: "18:30 PM SATURDAY",
    streamUrl: "https://wowzaec2demo.streamlock.net/live/bigbuckbunny/playlist.m3u8",
    logoLeft: "https://upload.wikimedia.org/wikipedia/en/0/03/Flag_of_Italy.svg",
    logoRight: "https://upload.wikimedia.org/wikipedia/en/9/9a/Flag_of_Spain.svg"
  }
};

app.set("views", path.join(process.cwd(), "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(process.cwd(), "public")));

app.get("/", (req, res) => {
  const selectedId = req.query.channel || Object.keys(channels)[0];
  const match = channels[selectedId] || channels[Object.keys(channels)[0]];
  res.render("index", { channels, selectedId, match });
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
