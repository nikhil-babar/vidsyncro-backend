# Use an official Ubuntu runtime as a parent image
FROM ubuntu:latest

# Set the working directory in the container
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /app

# Install Node.js and npm
RUN apt-get update && apt-get install -y curl
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
RUN apt-get install -y nodejs 
RUN npm install 

# Install Python, pip, and required packages
RUN apt-get install -y python3 python3-pip
RUN pip3 install moviepy

# Make the shell script executable
RUN chmod +x /app/run_tasks.sh

# Run the shell script when the container launches
CMD ["/app/run_tasks.sh"]
