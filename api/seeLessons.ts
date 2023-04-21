import { Lesson, MyContext } from "./session";
import { readJson } from "./utils";
import { Composer, InlineKeyboard } from "grammy";

export const seeLesson = new Composer<MyContext>();

seeLesson.callbackQuery("seeQoida", async (ctx) => {
  ctx.session.category = "qoida";
  let { content } = readJson();
  const keyboard = new InlineKeyboard().text("O'rtga", "back");
  for (let name in content["qoida"]) {
    keyboard.text(name);
  }
  await ctx.editMessageText("Darslikni tanlang", { reply_markup: keyboard });
});

seeLesson.callbackQuery("seeQuran", async (ctx) => {
  ctx.session.category = "quran";
  let { content } = readJson();
  const keyboard = new InlineKeyboard().text("O'rtga", "back");
  for (let name in content["qoida"]) {
    keyboard.text(name);
  }
  await ctx.editMessageText("Darslikni tanlang", { reply_markup: keyboard });
});

seeLesson.on("callback_query:data", async (ctx, next) => {
  if (ctx.callbackQuery.data === "back" || ctx.session.category === "idle") {
    ctx.session.category = "idle";
    return next();
  }

  const lessonName = ctx.callbackQuery.data;
  const { category } = ctx.session;
  let { content } = readJson();
  const lesson: Lesson = content[category][lessonName];
  for (let fileId of lesson.fileIdList) {
    await ctx.replyWithAudio(fileId, {
      caption: `#${lessonName} #${category}`,
    });
  }
});
