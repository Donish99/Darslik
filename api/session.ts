import { Context, SessionFlavor } from "grammy";

export type Category = "idle" | "quran" | "qoida";
export type Lesson = { name: string; link: string };

interface SessionData {
  category: Category;
  newLessonName?: string;
  lesson?: Lesson;
}
export type MyContext = Context & SessionFlavor<SessionData>;
export const initial = (): SessionData => ({ category: "idle" });
