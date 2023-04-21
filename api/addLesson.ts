import { getMenu } from "./keyboards";
import { MyContext } from "./session";
import {
  convertOggToMp3,
  insertIntoJson,
  removefiles,
  getAndSaveVoice,
} from "./utils";
import { Composer, InlineKeyboard, InputFile } from "grammy";

export const addLesson = new Composer<MyContext>();

addLesson.command("stop", async (ctx) => {
  const { category } = ctx.session;

  ctx.session.category = "idle";
  ctx.session.newLessonName = undefined;
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
  console.log(category, newLessonName);

  if (category === "idle" || !newLessonName) return;
  const file = await ctx.getFile(); // valid for at least 1 hour
  const path = file.file_path; // file path on Bot API server

  if (!path) return await ctx.reply("Xatolik yuz berdi");
  const audioFileIndex = ctx.session.audioFileIndex ?? 0;

  const oggPath =
    `voice/${newLessonName}${audioFileIndex}.ogg` ?? path.replace("oga", "ogg");
  const mp3Path =
    `audio/${category}/${newLessonName}${audioFileIndex}.mp3` ??
    path.replace("oga", "mp3").replace("voice", "audio");

  await getAndSaveVoice(path, oggPath);
  await convertOggToMp3(oggPath, mp3Path);

  const { audio } = await ctx.api.sendAudio(
    ctx.chat.id,
    new InputFile(mp3Path)
  );

  await insertIntoJson({
    category,
    link: mp3Path,
    fileId: audio.file_id,
    name: newLessonName,
  });

  ctx.session.audioFileIndex = audioFileIndex + 1;
});
