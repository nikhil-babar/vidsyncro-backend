import ffmpegStatic from "ffmpeg-static";
import ffprobeStatic from "ffprobe-static";
import ffmpeg from "fluent-ffmpeg";
import { v4 as uuid } from "uuid";
import { mkdir } from "fs/promises";
import { spawn } from "child_process";

ffmpeg.setFfmpegPath(ffmpegStatic);
ffmpeg.setFfprobePath(ffprobeStatic.path);

const FORMATS = [
  {
    bitrate: 5000,
    resolution: {
      width: 1920,
      height: 1080,
    },
  },
  {
    bitrate: 2500,
    resolution: {
      width: 1280,
      height: 720,
    },
  },
  {
    bitrate: 1000,
    resolution: {
      width: 854,
      height: 480,
    },
  },
  {
    bitrate: 500,
    resolution: {
      width: 640,
      height: 360,
    },
  },
];

export class Transcoder {
  constructor(input_path) {
    this.input_path = input_path;
    this.id = uuid();
    this.output_path = `${process.cwd()}/${this.id}`;
    this.video_codec = "libx264";
    this.audio_codec = "aac";
    this.audio_rate = 44100;
    this.aspect_ratio = "16:9";
    this.x264_options = "keyint=24:min-keyint=24:no-scenecut";
    this.adaptation_sets = "id=0,streams=v id=1,streams=a";
    this.init_segment = "init-stream$RepresentationID$.m4s";
    this.media_segment = "chunk-stream$RepresentationID$-$Number%05d$.m4s";
  }

  getVideoResolution() {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(this.input_path, (err, data) => {
        if (err) {
          reject(err);
        }

        const videoStream = data.streams.find(
          (stream) => stream.codec_type === "video"
        );
        if (!videoStream) {
          reject("no-video-metadata-found");
        }

        const width = videoStream.width;
        const height = videoStream.height;
        const bitrate = videoStream.bit_rate;

        if (!width || !height || !bitrate) {
          reject("no-video-metadata-found");
        }

        resolve({
          resolution: {
            width,
            height,
          },
          bitrate: bitrate / 1000,
        });
      });
    });
  }

  async transcode() {
    try {
      const videoMetadata = await this.getVideoResolution();

      console.log("Metadata: ", videoMetadata);

      const formats = FORMATS.filter((e) => {
        return e.resolution.width <= videoMetadata.resolution.width;
      });

      console.log("Chosen formats: ", formats);

      await mkdir(this.output_path);

      const args = [
        "-re",
        "-i",
        this.input_path,
        ...formats.flatMap((e) => ["-map", "0"]),
        "-c:a",
        this.audio_codec,
        "-c:v",
        this.video_codec,
        "-ar:a",
        this.audio_rate,
        ...formats.flatMap((e, i) => [
          `-b:v:${i}`,
          `${e.bitrate}k`,
          `-s:v:${i}`,
          `${e.resolution.width}x${e.resolution.height}`,
        ]),
        "-adaptation_sets",
        this.adaptation_sets,
        "-use_timeline",
        "1",
        "-use_template",
        "1",
        "-init_seg_name",
        this.init_segment,
        "-media_seg_name",
        this.media_segment,
        "-f",
        "dash",
        "-reset_timestamps",
        "1",
        "-copyts",
        "-map_metadata",
        "-1",
        `${this.id}/dash.mpd`,
      ];

      const ffmpegProcess = spawn("ffmpeg", args);

      ffmpegProcess.stdout.on("data", (data) => {
        console.log(`stdout: ${data}`);
      });

      ffmpegProcess.stderr.on("data", (data) => {
        console.error(`stderr: ${data}`);
      });

      ffmpegProcess.on("close", (code) => {
        if (code === 0) {
          console.log("DASH encoding complete.");
        } else {
          console.error(`ffmpeg process exited with code ${code}`);
        }
      });
    } catch (error) {
      console.error("Transcoding error:", error);
    }
  }
}
