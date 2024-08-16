export const segments = {
  assets: "assets",
  edited_videos: "edited_videos",
  timeline_videos: "timeline_videos",
  production_videos: "production_videos",
  dash: "dash",
  video_assets: "video_assets",
};

export const events = {
  transcoding: "transcoding",
  transcription: "transcription",
  edl_processing: "edl_processing",
};

export const tasks = {
  assets: [events.transcription, events.edl_processing, events.transcoding],
  edited_videos: [events.transcoding],
  production_videos: [events.transcription],
  timeline_videos: [events.edl_processing],
};

export const eventDetails = {
  [events.transcoding]: {
    task_definition: "transcoding-task",
    task_image: "transcoding-task",
    output_directory: segments.dash,
    event: events.transcoding,
  },
  [events.transcription]: {
    task_definition: "transcription-task",
    task_image: "transcription-task",
    output_directory: segments.video_assets,
    event: events.transcription,
  },
  [events.edl_processing]: {
    task_definition: "edl-processing-task",
    task_image: "edl-processing-task",
    output_directory: segments.timeline_videos,
    event: events.edl_processing,
  },
};

export const env = {
  REGION: process.env.REGION,
  SNS_TOPIC: process.env.SNS_TOPIC,
  CLUSTER: process.env.CLUSTER,
  TRANSCODING_QUEUE: process.env.TRANSCODING_QUEUE,
  TRANSCODING_TASK: process.env.TRANSCODING_TASK,
  TRANSCODING_TASK_IMAGE: process.env.TRANSCODING_TASK_IMAGE,
  CLUSTER_SUBNET: process.env.CLUSTER_SUBNET,
  CLUSTER_SECURITY_GROUP: process.env.CLUSTER_SECURITY_GROUP,
  VIDEO_BUCKET: process.env.VIDEO_BUCKET,
  URL_EXPIRATION_SECONDS: process.env.URL_EXPIRATION_SECONDS,
  MONGO_URL: process.env.MONGO_URL,
  MONGO_DB_NAME: process.env.MONGO_DB_NAME,
};
