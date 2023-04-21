import { Context, SessionFlavor } from "grammy";

export type Category = "idle" | "quran" | "qoida";
export type Lesson = { fileIdList: string[] };
export type Lessons = {
  qoida: { [k: string]: Lesson };
  quran: { [k: string]: Lesson };
};

interface SessionData {
  category: Category;
  newLessonName?: string;
  audioFileIds?: string[];
}
export type MyContext = Context & SessionFlavor<SessionData>;
export const initial = (): SessionData => ({ category: "idle" });
