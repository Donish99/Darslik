import CONFIG from "./config";
import { Category, Lesson, Lessons } from "./session";
import ffmpegPath from "@ffmpeg-installer/ffmpeg";
import axios from "axios";
import Ffmpeg from "fluent-ffmpeg";
import {
  createWriteStream,
  existsSync,
  mkdirSync,
  readdirSync,
  readFile,
  unlinkSync,
  writeFileSync,
} from "fs";
import path from "path";

const checkAndCreateDirectory = (path: string) => {
  let arr = path.split("/");
  arr.pop();
  arr.join("/");
  const dir = arr.join("/");
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
};

export const convertOggToMp3 = (inPath: string, outPath: string) => {
  Ffmpeg.setFfmpegPath(ffmpegPath.path);
  checkAndCreateDirectory(outPath);
  var outStream = createWriteStream(outPath);

  return new Promise((resolve, reject) => {
    Ffmpeg()
      .input(inPath)
      .audioQuality(96)
      .toFormat("mp3")
      .on("error", (error: any) => {
        console.log(`Encoding Error: ${error.message}`);
        return reject(error);
      })
      .on("exit", () => console.log("Audio recorder exited"))
      .on("close", () => console.log("Audio recorder closed"))
      .on("end", () => {
        console.log("Audio Transcoding succeeded");
        resolve("Success");
      })
      .pipe(outStream, { end: true });
  });
};

export const getAndSaveVoice = async (path: string, oggPath: string) => {
  const { data } = await axios.get(`${CONFIG.tg_url}/${path}`, {
    responseType: "arraybuffer",
  });
  checkAndCreateDirectory(oggPath);
  writeFileSync(oggPath, data);
};

export const removefiles = async (directory: string) => {
  for (const file of readdirSync(directory)) {
    unlinkSync(path.join(directory, file));
  }
};

// export const insertIntoJson = async ({
//   fileId,
//   name,
//   category,
//   link,
// }: {
//   category: "qoida" | "quran";
//   name: string;
//   link: string;
//   fileId: string;
// }) => {
//   let content = await readJson();

//   let lesson: Lesson = content[category]?.[name] ?? {
//     fileIdList: [],
//     linkList: [],
//   };
//   lesson = {
//     fileIdList: [...lesson.fileIdList, fileId],
//     linkList: [...lesson.linkList, link],
//   };

//   content[category][name] = lesson;
//   writeFileSync("./lessons.json", JSON.stringify(content));
// };
