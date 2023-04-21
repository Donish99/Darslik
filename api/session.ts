import { Context, SessionFlavor } from "grammy";

export type Category = "idle" | "quran" | "qoida";
export type Lesson = { linkList: string[]; fileIdList: string[] };

interface SessionData {
  category: Category;
  newLessonName?: string;
  audioFileIndex?: number;
}
export type MyContext = Context & SessionFlavor<SessionData>;
export const initial = (): SessionData => ({ category: "idle" });
