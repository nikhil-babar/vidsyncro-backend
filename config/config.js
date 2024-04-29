export const segments = {
  assets: "assets",
  edited_videos: "edited_videos",
  timeline_videos: "timeline_videos",
  production_videos: "production_videos",
  dash: "dash",
  video_assets: "video_assets",
};

export const tasks = {
  publish_to_edited_videos: "publish_to_edited_videos",
  publish_to_production_videos: "publish_to_production_videos",
};

export const events = {
  transcoding: "transcoding",
  transcription: "transcription",
};

export const segmentToTaskMapping = {
  edited_videos: tasks.publish_to_edited_videos,
  production_videos: tasks.publish_to_production_videos,
};

export const taskToEventMapping = {
  publish_to_production_videos: [events.transcoding],
  publish_to_edited_videos: [events.transcoding, events.transcription],
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
