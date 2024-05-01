import { mkdir } from "fs/promises";
import { spawn } from "child_process";
import { join } from "path";

export async function mp4ToDash(videoURL, outDir) {
  try {
    const outFile = join(outDir, "dash.mpd");

    await mkdir(outDir);

    await new Promise((resolve, reject) => {
      const ffmpegProcess = spawn("ffmpeg", [
        "-re",
        "-i",
        videoURL,
        "-map",
        "0",
        "-map",
        "0",
        "-map",
        "0",
        "-map",
        "0",
        "-c:a",
        "aac",
        "-c:v",
        "libx264",
        "-b:v:0",
        "5000k",
        "-s:v:0",
        "1920x1080",
        "-b:v:1",
        "2500k",
        "-s:v:1",
        "1280x720",
        "-b:v:2",
        "1000k",
        "-s:v:2",
        "854x480",
        "-b:v:3",
        "500k",
        "-s:v:3",
        "640x360",
        "-aspect:v:0",
        "16:9",
        "-aspect:v:1",
        "16:9",
        "-aspect:v:2",
        "16:9",
        "-aspect:v:3",
        "16:9",
        "-ar:a:0",
        "44100",
        "-adaptation_sets",
        "id=0,streams=v id=1,streams=a",
        "-f",
        "dash",
        "-reset_timestamps",
        "1",
        "-copyts",
        "-map_metadata",
        "-1",
        outFile,
      ]);

      ffmpegProcess.stdout.on("data", (data) => {
        console.log(`stdout: ${data}`);
      });

      ffmpegProcess.stderr.on("data", (data) => {
        console.error(`stderr: ${data}`);
      });

      ffmpegProcess.on("close", (code) => {
        console.log(`child process exited with code ${code}`);
        resolve();
      });

      ffmpegProcess.on("error", (err) => {
        console.log(`child process error: `, err);
        reject();
      });
    });
  } catch (error) {
    throw error;
  }
}
