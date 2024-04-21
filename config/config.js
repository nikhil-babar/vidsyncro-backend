export const projectDirectory = {
  assets: "assets",
  transcoded_videos: "transcoded_videos",
  edited_videos: "edited_videos",
};

export const taskToEventMapping = {
  publish_pipeline: {
    events: ["transcoding"],
  },
};

export const queueToTask = {
  [process.env.TRANSCODING_QUEUE]: {
    task: process.env.TRANSCODING_TASK,
    task_image: process.env.TRANSCODING_TASK_IMAGE,
    output_directory: projectDirectory.transcoded_videos,
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
