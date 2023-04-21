import CONFIG from "./config";
import { getMenu } from "./keyboards";
import { MyContext } from "./session";
import { convertOggToMp3, removefiles, getAndSaveVoice } from "./utils";
import { Composer, InlineKeyboard, InputFile } from "grammy";
import { Pool } from "pg";

export const addLesson = new Composer<MyContext>();

addLesson.command("stop", async (ctx) => {
  const { category, newLessonName, audioFileIds } = ctx.session;

  const pool = new Pool(CONFIG.DB);
  pool.query(
    `
        INSERT INTO lessons (type, name, audio_id_list)
        VALUES ($1, $2, $3)
        RETURNING *
  `,
    [category, newLessonName, audioFileIds],
    (err, res) => {
      pool.end();
      if (err) console.log(err);
    }
  );

  ctx.session.category = "idle";
  ctx.session.newLessonName = undefined;
  ctx.session.audioFileIds = undefined;
  await removefiles("./voice");

  await ctx.reply(`Darsliklar ${category} ro'xatiga qoshildi`, {
    reply_markup: getMenu(ctx.chat.id),
  });
});

addLesson.callbackQuery("addLesson", async (ctx) => {
  const keyboard = new InlineKeyboard()
    .text("Qoida", "addToQoida")
    .text("Qur'on", "addToQuran")
    .row()
    .text("O'rtga", "back");

  await ctx.editMessageText(
    "Iltimos kiritmoqchi bolgan darslik turini tanlang",
    {
      reply_markup: keyboard,
    }
  );
});

addLesson.callbackQuery("addToQoida", async (ctx) => {
  ctx.session.category = "qoida";
  await ctx.editMessageText("Qoida nomini kiriting!", {
    reply_markup: undefined,
  });
});

addLesson.callbackQuery("addToQuran", async (ctx) => {
  ctx.session.category = "quran";
  await ctx.editMessageText("Sura nomini kiriting!", {
    reply_markup: undefined,
  });
});

addLesson.on("message:text", (ctx, next) => {
  if (ctx.session.category === "idle") return next();
  ctx.session.newLessonName = ctx.message?.text;
  return ctx.reply("Audio filelar yuboring, oxirida /stop bosing");
});

addLesson.on("message:voice", async (ctx) => {
  const { category, newLessonName } = ctx.session;

  if (category === "idle" || !newLessonName) return;
  const file = await ctx.getFile(); // valid for at least 1 hour
  const path = file.file_path; // file path on Bot API server

  if (!path) return await ctx.reply("Xatolik yuz berdi");
  let audioFileIds = ctx.session.audioFileIds ?? [];

  const oggPath =
    `voice/${newLessonName}_${audioFileIds.length}.ogg` ??
    path.replace("oga", "ogg");
  const mp3Path =
    `audio/${category}/${newLessonName}_${audioFileIds.length}.mp3` ??
    path.replace("oga", "mp3").replace("voice", "audio");

  await getAndSaveVoice(path, oggPath);
  await convertOggToMp3(oggPath, mp3Path);

  const { audio } = await ctx.api.sendAudio(
    ctx.chat.id,
    new InputFile(mp3Path)
  );

  ctx.session.audioFileIds = [...audioFileIds, audio.file_id];
});
