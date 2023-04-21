import CONFIG from "./config";
import { InlineKeyboard } from "grammy";

export const getMenu = (chatId: number | undefined) => {
  const keyboard = new InlineKeyboard()
    .text("Qoidalarni ko'rish", "seeQoida")
    .text("Suralarni ko'rish", "seeQuran")
    .row();

  if (chatId === CONFIG.admin_chat_id)
    keyboard.text("Darslik qoshish", "addLesson");

  return keyboard;
};
