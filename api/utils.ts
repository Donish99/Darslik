import CONFIG from "./config";
import { Category } from "./session";
import ffmpegPath from "@ffmpeg-installer/ffmpeg";
import axios from "axios";
import Ffmpeg from "fluent-ffmpeg";
import {
  createWriteStream,
  readdirSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from "fs";
import path from "path";

export const convertOggToMp3 = (inPath: string, outPath: string) => {
  Ffmpeg.setFfmpegPath(ffmpegPath.path);
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
  writeFileSync(oggPath, data);
};

export const removefiles = async (directory: string) => {
  for (const file of readdirSync(directory)) {
    unlinkSync(path.join(directory, file));
  }
};

export const readJson = () =>
  JSON.parse(readFileSync("./lessons.json", "utf-8"));

export const insertIntoJson = async (
  category: Category,
  lesson: { name: string; link: string }
) => {
  let content = readJson();
  content[category] = [...content[category], lesson];
  writeFileSync("./lessons.json", JSON.stringify(content));
};
