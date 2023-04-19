import { MyContext } from "./session";
import { readJson } from "./utils";
import { Composer, InlineKeyboard, Keyboard } from "grammy";

export const seeLesson = new Composer<MyContext>();

seeLesson.callbackQuery("seeQoida", async (ctx) => {
  ctx.session.category === "qoida";
  let content = readJson();
  const keyboard = new InlineKeyboard().text("O'rtga", "back");
  content["qoida"].forEach(
    (element: { name: string; link: string }, index: number) => {
      if (index % 2) keyboard.row();
      keyboard.text(element.name);
    }
  );
  await ctx.editMessageText("Darslikni tanlang", { reply_markup: keyboard });
});
seeLesson.callbackQuery("seeQuran", async (ctx) => {
  ctx.session.category === "quran";
  let content = readJson();
  const keyboard = new InlineKeyboard().text("O'rtga", "back");
  content["quran"].forEach(
    (element: { name: string; link: string }, index: number) => {
      keyboard.text(element.name);
      if (index % 2) keyboard.row();
    }
  );
  await ctx.editMessageText("Darslikni tanlang", { reply_markup: keyboard });
});
