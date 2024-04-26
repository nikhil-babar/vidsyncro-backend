export const segments = {
  assets: "assets",
  edited_videos: "edited_videos",
  timeline_videos: "timeline_videos",
  production_videos: "production_videos",
};

export const tasks = {
  publish_to_edited_videos: "publish_to_edited_videos",
  publish_to_production_videos: "publish_to_production_videos",
};

export const events = {
  transcoding: "transcoding",
};

export const segmentToTaskMapping = {
  edited_videos: tasks.publish_to_edited_videos,
  production_videos: tasks.publish_to_production_videos,
};

export const taskToEventMapping = {
  publish_to_production_videos: [events.transcoding],
  publish_to_edited_videos: [events.transcoding],
};

export const eventDetails = {
  [events.transcoding]: {
    task_definition: process.env.TRANSCODING_TASK,
    task_image: process.env.TRANSCODING_TASK_IMAGE,
    output_directory: "dash",
    event: "transcoding",
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
