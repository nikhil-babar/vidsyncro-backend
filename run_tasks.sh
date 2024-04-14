#!/bin/bash

# Step 1: Run edlparser.js
echo "Running edlparser.js..."
node services/edlparser.js

# Step 2: Fetch required videos from S3
echo "Fetching videos from S3..."
node services/fetchvideoss3.js

# Step 3: Process EDL files
echo "Processing EDL files..."
python3 services/processEDL.py

echo "Uploading all edited videos to Amazon S3 bucket..."
node services/uploadeditedvideos.js


echo "All tasks completed."
