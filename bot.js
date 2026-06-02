import TelegramBot from "node-telegram-bot-api";

const token = process.env.TG_TOKEN;
const webAppUrl = process.env.WEBAPP_URL || "https://your-public-domain.com";

if (!token) {
  console.error("Error: Set TG_TOKEN in environment before running the bot.");
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "Open the TV player:", {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "Open TV App",
            web_app: { url: webAppUrl }
          }
        ]
      ]
    }
  });
});

bot.on("message", (msg) => {
  if (msg.text && msg.text.toLowerCase().includes("channel")) {
    bot.sendMessage(msg.chat.id, "Use /start to open the TV player.");
  }
});

console.log("Telegram bot started");
