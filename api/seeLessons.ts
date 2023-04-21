import CONFIG from "./config";
import { Lesson, MyContext } from "./session";
import { Composer, InlineKeyboard } from "grammy";
import { Pool } from "pg";

export const seeLesson = new Composer<MyContext>();

seeLesson.callbackQuery("seeQoida", async (ctx) => {
  const category = "qoida";
  const pool = new Pool(CONFIG.DB);
  pool.query(
    `SELECT * FROM LESSONS WHERE type=$1`,
    [category],
    async (err, res) => {
      pool.end();
      if (err) console.log(err);

      const keyboard = new InlineKeyboard().text("O'rtga", "back");
      for (let lesson of res.rows) {
        keyboard.text(lesson.name, lesson.id);
      }
      await ctx.editMessageText("Darslikni tanlang", {
        reply_markup: keyboard,
      });
    }
  );
});

seeLesson.callbackQuery("seeQuran", async (ctx) => {
  const category = "quran";
  const pool = new Pool(CONFIG.DB);
  pool.query(
    `SELECT * FROM LESSONS WHERE type=$1`,
    [category],
    async (err, res) => {
      pool.end();
      if (err) console.log(err);

      const keyboard = new InlineKeyboard().text("O'rtga", "back");
      for (let lesson of res.rows) {
        keyboard.text(lesson.name, lesson.id);
      }
      await ctx.editMessageText("Darslikni tanlang", {
        reply_markup: keyboard,
      });
    }
  );
});

seeLesson.on("callback_query:data", async (ctx, next) => {
  if (ctx.callbackQuery.data === "back") {
    ctx.session.category = "idle";
    return next();
  }

  const lessonId = ctx.callbackQuery.data;
  const pool = new Pool(CONFIG.DB);

  pool.query(
    `SELECT * FROM LESSONS WHERE id=$1`,
    [lessonId],
    async (err, res) => {
      pool.end();
      if (err) console.log(err);
      if (res.rowCount === 0)
        return await ctx.reply("Darslik ma'lumotlari kiritilmagan");

      const lesson = res.rows[0];
      for (let fileId of lesson.audio_id_list) {
        await ctx.replyWithAudio(fileId, {
          caption: `#${lesson.type} #${lesson.name}`,
        });
      }
    }
  );
});
