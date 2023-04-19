import { addLesson } from "./addLesson";
import CONFIG from "./config";
import { seeLesson } from "./seeLessons";
import { initial, MyContext } from "./session";
import {
  Bot,
  GrammyError,
  HttpError,
  InlineKeyboard,
  session,
  webhookCallback,
} from "grammy";

if (!CONFIG.bot_token) throw new Error("BOT_TOKEN is unset");

const bot = new Bot<MyContext>(CONFIG.bot_token);
bot.use(session({ initial }));
bot.use(addLesson);
bot.use(seeLesson);

bot.on("message", (ctx) => {
  const keyboard = new InlineKeyboard()
    .text("Qoidalarni ko'rish", "seeQoida")
    .text("Suralarni ko'rish", "seeQuran")
    .row();

  if (ctx.chat.id === CONFIG.admin_chat_id)
    keyboard.text("Darslik qoshish", "addLesson");

  return ctx.reply("Iltimos pastdagi tugmalardan birini bosing!", {
    reply_markup: keyboard,
  });
});

bot.callbackQuery("back", (ctx) => {
  const keyboard = new InlineKeyboard()
    .text("Qoidalarni ko'rish", "seeQoida")
    .text("Suralarni ko'rish", "seeQuran")
    .row();

  if (ctx.chat?.id === CONFIG.admin_chat_id)
    keyboard.text("Darslik qoshish", "addLesson");

  return ctx.editMessageText("Iltimos pastdagi tugmalardan birini bosing!", {
    reply_markup: keyboard,
  });
});

// Start the bot.
bot.start();
bot.catch((err) => {
  const ctx = err.ctx;
  console.error(`Error while handling update ${ctx.update.update_id}:`);
  const e = err.error;
  if (e instanceof GrammyError) {
    console.error("Error in request:", e.description);
  } else if (e instanceof HttpError) {
    console.error("Could not contact Telegram:", e);
  } else {
    console.error("Unknown error:", e);
  }
});

export default webhookCallback(bot, "http");
