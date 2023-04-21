import { addLesson } from "./addLesson";
import CONFIG from "./config";
import { getMenu } from "./keyboards";
import { seeLesson } from "./seeLessons";
import { initial, MyContext } from "./session";
import { Bot, GrammyError, HttpError, session, webhookCallback } from "grammy";

if (!CONFIG.bot_token) throw new Error("BOT_TOKEN is unset");

const bot = new Bot<MyContext>(CONFIG.bot_token);
bot.use(session({ initial }));

/* Order matters! */
bot.use(addLesson);
bot.use(seeLesson);

bot.on(
  "message",
  async (ctx) =>
    await ctx.reply("Iltimos pastdagi tugmalardan birini bosing!", {
      reply_markup: getMenu(ctx.chat.id),
    })
);

bot.callbackQuery(
  "back",
  async (ctx) =>
    await ctx.editMessageText("Iltimos pastdagi tugmalardan birini bosing!", {
      reply_markup: getMenu(ctx.chat?.id),
    })
);

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

export default webhookCallback(bot, "https");
