import { Context, SessionFlavor } from "grammy";

export type Category = "idle" | "quran" | "qoida";
export type Lesson = { linkList: string[]; fileIdList: string[] };
export type Lessons = {
  qoida: { [k: string]: Lesson };
  quran: { [k: string]: Lesson };
};
export const initialLessons: Lessons = {
  qoida: {},
  quran: {},
};

interface SessionData {
  category: Category;
  newLessonName?: string;
  audioFileIndex?: number;
}
export type MyContext = Context & SessionFlavor<SessionData>;
export const initial = (): SessionData => ({ category: "idle" });
