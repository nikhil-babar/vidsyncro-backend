export const taskToEventMapping = {
  publish_pipeline: {
    events: ["transcoding"],
  },
};

export const queueToDirectoryMapping = {
  [process.env.TRANSCODING_QUEUE]: "dash",
};

export const queueToEventMapping = {
  [process.env.TRANSCODING_QUEUE]: "transcoding",
};

export const queueToTask = {
  [process.env.TRANSCODING_QUEUE]: {
    TASK: process.env.TRANSCODING_TASK,
    TASK_IMAGE: process.env.TRANSCODING_TASK_IMAGE,
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
