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
        "-maxrate:v:0",
        "5000k",
        "-bufsize:v:0",
        "10000k",
        "-profile:v:0",
        "high",
        "-level:v:0",
        "4.1",
        "-s:v:0",
        "1920x1080",
        "-b:v:1",
        "2500k",
        "-maxrate:v:1",
        "2500k",
        "-bufsize:v:1",
        "5000k",
        "-profile:v:1",
        "high",
        "-level:v:1",
        "4.1",
        "-s:v:1",
        "1280x720",
        "-b:v:2",
        "1000k",
        "-maxrate:v:2",
        "1000k",
        "-bufsize:v:2",
        "2000k",
        "-profile:v:2",
        "main",
        "-level:v:2",
        "3.1",
        "-s:v:2",
        "854x480",
        "-b:v:3",
        "500k",
        "-maxrate:v:3",
        "500k",
        "-bufsize:v:3",
        "1000k",
        "-profile:v:3",
        "baseline",
        "-level:v:3",
        "3.0",
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
        "-init_seg_name",
        `init_$RepresentationID$.m4s`,
        "-media_seg_name",
        "chunk_$RepresentationID$_$Number%05d$.m4s",
        "-use_timeline",
        "1",
        "-use_template",
        "1",
        "-window_size",
        "5",
        "-adaptation_sets",
        "id=0,streams=v id=1,streams=a",
        "-f",
        "dash",
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
