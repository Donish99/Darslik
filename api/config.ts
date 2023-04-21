import * as dotenv from "dotenv";

const envFound = dotenv.config();

const CONFIG = {
  admin_chat_id: Number(process.env.ADMIN_CHAT_ID)!,
  bot_token: process.env.BOT_TOKEN!,
  tg_url: `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}`,
  DB: {
    host: process.env.DB_HOST!,
    port: Number(process.env.DB_PORT!),
    database: process.env.DB_NAME!,
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    connection_string: process.env.CON_STRING!,
  },
};

console.log(CONFIG);

export default CONFIG;
