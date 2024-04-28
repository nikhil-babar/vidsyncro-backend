FROM ubuntu:focal

# WORKDIR /app

# COPY . /app

RUN apt-get update 
RUN apt-get install -y curl
RUN curl -sL https://deb.nodesource.com/setup_20.x | bash -
RUN apt-get upgrade -y
RUN apt-get install -y nodejs 
RUN apt-get install -y python3 python3-pip
RUN pip3 install assemblyai
RUN pip3 install --upgrade setuptools
RUN pip3 install python-dotenv


WORKDIR /home/app

COPY main.sh main.sh
COPY fetchVideosFromS3.js fetchVideosFromS3.js
COPY transcribeVideos.py transcribeVideos.py
COPY titleDescription.js titleDescription.js
COPY uploadFilesToS3.js uploadFilesToS3.js
COPY .env /home/app/.env
COPY package*.json .
COPY downloads /home/app/downloads

RUN npm install

RUN chmod +x main.sh
RUN chmod +x fetchVideosFromS3.js
RUN chmod +x transcribeVideos.py
RUN chmod +x titleDescription.js
RUN chmod +x uploadFilesToS3.js

ENTRYPOINT [ "/home/app/main.sh" ]



# RUN apt-get install -y python3 python3-pip

# RUN pip3 install openai-whisper
# RUN apt-get install -y ffmpeg

# RUN chmod +x /app/run_task.sh

# CMD ["/app/run_task.sh"]