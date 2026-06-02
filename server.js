import express from "express";
import path from "path";

const app = express();
const port = process.env.PORT || 3000;

const channels = {
  news: "https://example.com/stream/news",
  sports: "https://example.com/stream/sports",
  movies: "https://example.com/stream/movies"
};

app.set("views", path.join(process.cwd(), "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(process.cwd(), "public")));

app.get("/", (req, res) => {
  const selected = req.query.channel || "news";
  const url = channels[selected] || channels.news;
  res.render("index", { channels, selected, url });
});

app.listen(port, () => {
  console.log(`Web app running at http://localhost:${port}`);
});
