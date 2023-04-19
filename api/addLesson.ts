import { Lesson, MyContext } from "./session";
import {
  convertOggToMp3,
  insertIntoJson,
  removefiles,
  getAndSaveVoice,
} from "./utils";
import { Composer, InlineKeyboard, InputFile } from "grammy";

export const addLesson = new Composer<MyContext>();

addLesson.callbackQuery("addLesson", (ctx) => {
  const keyboard = new InlineKeyboard()
    .text("Qoida", "addToQoida")
    .text("Qur'on", "addToQuran")
    .row()
    .text("O'rtga", "back");

  ctx.editMessageText("Iltimos kiritmoqchi bolgan darslik turini tanlang", {
    reply_markup: keyboard,
  });
});

addLesson.callbackQuery("addToQoida", (ctx) => {
  ctx.session.category = "qoida";
  ctx.editMessageText("Qoida nomini kiriting!", { reply_markup: undefined });
});

addLesson.callbackQuery("addToQuran", (ctx) => {
  ctx.session.category = "quran";
  ctx.editMessageText("Sura nomini kiriting!", { reply_markup: undefined });
});

addLesson.on("msg:text", (ctx, next) => {
  if (ctx.session.category === "idle") return next();
  ctx.session.newLessonName = ctx.message?.text;
  return ctx.reply("Audio file yuboring");
});

addLesson.on("message:voice", async (ctx) => {
  const { category, newLessonName } = ctx.session;
  if (category === "idle" || !newLessonName) return;
  const file = await ctx.getFile(); // valid for at least 1 hour
  const path = file.file_path ?? ""; // file path on Bot API server

  const oggPath = `voice/${newLessonName}.ogg` ?? path.replace("oga", "ogg");
  const mp3Path =
    `audio/${category}/${newLessonName}.mp3` ??
    path.replace("oga", "mp3").replace("voice", "audio");

  await getAndSaveVoice(path, oggPath);
  await convertOggToMp3(oggPath, mp3Path);

  const lesson: Lesson = {
    link: mp3Path,
    name: newLessonName,
  };
  insertIntoJson(category, lesson);
  await removefiles("./voice");

  ctx.session.category = "idle";
  ctx.session.newLessonName = undefined;
  await ctx.replyWithAudio(new InputFile(mp3Path), {
    caption: `${category} qoshildi`,
  });
});
