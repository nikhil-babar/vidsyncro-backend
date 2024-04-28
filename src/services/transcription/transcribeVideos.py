import os
import subprocess
import assemblyai as aai
from dotenv import load_dotenv
load_dotenv()
aai.settings.api_key = os.getenv("TRANSCRIBE_AI_API_KEY")


def assembly_transcribe(video_path):
    try:
        transcript = aai.Transcriber().transcribe(video_path)
        subtitles = transcript.export_subtitles_srt()
        
        video = os.path.basename(video_path) 
        filename, _ = os.path.splitext(video)  # Discard extension (stored in _)
        output_filename = f"{filename}.srt"
        with open(output_filename, "a") as f:  
            f.write(subtitles)
        f.close()
        print("Transcription and subtitles generated successfully for:", video_path)
    except subprocess.CalledProcessError as e:
        print("Error: Transcription failed with error code:", e.returncode)
    except FileNotFoundError:
        print("Error: command not found. Make sure Assembly AI is installed and accessible in the system PATH.")


def transcribe_videos_in_folder(input_folder):
    video_files = [f for f in os.listdir(input_folder) if os.path.isfile(os.path.join(input_folder, f)) and f.lower().endswith('.mp4')]
    
    print("video-files = ", video_files)

    for video_file in video_files:
        print("For ", video_file);
        video_path = os.path.join(input_folder, video_file)
        print("Transcribing video:", video_path)
        assembly_transcribe(video_path)

# # Define input and output folders
raw_videos_folder = "downloads"

# # Ensure results folder exists

# # Transcribe videos in the rawVideos folder and save results in the results folder
transcribe_videos_in_folder(raw_videos_folder)

















# import os
# import subprocess

# def whisper_transcribe(video_path):
#     try:
#         whisper_command = ["whisper", video_path, "--model", "tiny"]
#         subprocess.run(whisper_command, check=True)

#         print("Transcription and subtitles generated successfully for:", video_path)
#     except subprocess.CalledProcessError as e:
#         print("Error: Whisper AI command failed with error code:", e.returncode)
#     except FileNotFoundError:
#         print("Error: Whisper AI command not found. Make sure Whisper AI is installed and accessible in the system PATH.")