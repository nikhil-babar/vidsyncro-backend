#!/bin/bash

export PROJECT_ID="$PROJECT_ID"


echo "Running fetchVideosFromS3.js..."
node fetchVideosFromS3.js

echo "Transcribing Video files..."
python3 transcribeVideos.py

echo "Generate Title and Description files..."
node titleDescription.js

echo "Uploading transcripts to Amazon S3 bucket..."
node uploadFilesToS3.js

echo "All tasks completed."