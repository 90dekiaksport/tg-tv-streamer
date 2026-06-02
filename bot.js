import TelegramBot from "node-telegram-bot-api";

const token = process.env.TG_TOKEN;

// 1. Your live Render website link (with the crucial trailing slash):
const webAppUrl = "https://tg-tv-streamer.onrender.com/"; 

// 2. Initialize the Telegram Bot with live polling active
const bot = new TelegramBot(token, { polling: true });

// 3. FORCE TELEGRAM TO UPDATE THE MENU BUTTON (Added here so it updates instantly on boot)
bot.setChatMenuButton({
  menu_button: JSON.stringify({
    type: "web_app",
    text: "📺 Open TV App",
    web_app: { url: webAppUrl }
  })
}).then(() => {
  console.log("🔄 Telegram Menu Button URL updated successfully!");
}).catch((err) => {
  console.error("❌ Failed to update Telegram Menu Button:", err);
});

// Listen for the /start command
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "Welcome! Click the button below to open the live TV player:", {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "📺 Open TV App",
            web_app: { url: webAppUrl }
          }
        ]
      ]
    }
  });
});

// Fallback listener if they type text instead of using the app button
bot.on("message", (msg) => {
  if (msg.text && !msg.text.startsWith("/")) {
    bot.sendMessage(msg.chat.id, "Please use the /start command to launch the TV player layout.");
  }
});

// Confirmation message so you see it in VS Code terminal
console.log("🚀 Success! Your Telegram bot is online and listening for commands...");