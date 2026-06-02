import com.github.kotlintelegrambot.Bot
import com.github.kotlintelegrambot.bot
import com.github.kotlintelegrambot.dispatch
import com.github.kotlintelegrambot.dispatcher.command
import com.github.kotlintelegrambot.entities.InlineKeyboardButton
import com.github.kotlintelegrambot.entities.InlineKeyboardMarkup
import com.github.kotlintelegrambot.entities.webapp.WebAppInfo

fun main() {
    val token = System.getenv("TG_TOKEN") ?: error("Environment variable TG_TOKEN is required.")

    val bot: Bot = bot {
        this.token = token
        dispatch {
            command("start") {
                val chatId = message?.chat?.id
                if (chatId != null) {
                    val webAppUrl = "https://YOUR_GITHUB_USERNAME.github.io/tg-tv-streamer/"
                    val watchButton = InlineKeyboardButton.WebApp(
                        text = "📺 Watch Live TV",
                        webApp = WebAppInfo(url = webAppUrl)
                    )

                    val keyboard = InlineKeyboardMarkup.create(
                        listOf(
                            listOf(watchButton)
                        )
                    )

                    bot.sendMessage(
                        chatId = chatId,
                        text = "Welcome! Tap the button below to open the live TV player.",
                        replyMarkup = keyboard
                    )
                }
            }
        }
    }

    bot.startPolling()
    println("Telegram bot started. Waiting for /start commands...")
}
