import * as dotenv from "dotenv";
dotenv.config();

const CONFIG = {
  admin_chat_id: Number(process.env.ADMIN_CHAT_ID) ?? 0,
  bot_token: process.env.BOT_TOKEN ?? "",
  tg_url: `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}`,
};

export default CONFIG;
