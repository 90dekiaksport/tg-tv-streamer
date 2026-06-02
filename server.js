import express from "express";
import path from "path";

const app = express();
const port = process.env.PORT || 3000;

// Serve the 'player' folder as static files
// This makes streams.json accessible at /player/streams.json
app.use("/player", express.static(path.join(process.cwd(), "player")));

// Route the root URL to serve the premium player UI
app.get("/", (req, res) => {
  res.sendFile(path.join(process.cwd(), "player", "index.html"));
});

app.listen(port, () => {
  console.log(`Web app running at http://localhost:${port}`);
});
