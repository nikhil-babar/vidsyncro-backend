import { Transcoder } from "./transcoder.js";
import { resolve } from "path";

const LOCAL_VIDEO = resolve(process.cwd(), "videos", "pursuit.mp4");

console.log(LOCAL_VIDEO);

const transcoder = new Transcoder(LOCAL_VIDEO);

await transcoder.transcode();
