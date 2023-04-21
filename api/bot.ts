import { addLesson } from "./addLesson";
import CONFIG from "./config";
import { getMenu } from "./keyboards";
import { seeLesson } from "./seeLessons";
import { initial, MyContext } from "./session";
import { Bot, GrammyError, HttpError, session, webhookCallback } from "grammy";
import { Pool } from "pg";

if (!CONFIG.bot_token) throw new Error("BOT_TOKEN is unset");

const bot = new Bot<MyContext>(CONFIG.bot_token);
bot.use(session({ initial }));

/* Order matters! */
bot.use(addLesson);
bot.use(seeLesson);

bot.command("start", async (ctx) => {
  console.log("start");

  if (!ctx.from) return await ctx.reply("Wrong start");
  const { id, first_name: name, username } = ctx.from;
  const pool = new Pool(CONFIG.DB);
  pool.query(`SELECT * FROM users WHERE id = $1`, [id], async (err, res) => {
    pool.end();
    if (err) console.log(err);
    if (res.rows.length === 0)
      await pool.query(
        `
      INSERT INTO users (name, id, username)
      VALUES ($1, $2, $3)
      RETURNING *
      `,
        [name, id, username]
      );
    await ctx.reply(
      `Hush kelibsiz ${name}, Davom etish uchun pastdagi tugmalardan birini bosing`,
      { reply_markup: getMenu(id) }
    );
  });
  console.log("start");
});

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

export default webhookCallback(bot, "https");

// Start the bot.
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
bot.start();
