#!/bin/bash

export PROJECT_ID="$PROJECT_ID"

echo "Running fetchVideosFromS3.js..."
node services/fetchVideosFromS3.js

echo "Transcribing Video files..."
python3 services/transcribeVideos.py

echo "Generate Title and Description files..."
node services/titleDescription.js

echo "Uploading transcripts to Amazon S3 bucket..."
node services/uploadFilesToS3.js

echo "All tasks completed."