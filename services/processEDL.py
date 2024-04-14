import json
from moviepy.editor import VideoFileClip, concatenate_videoclips
import os


def process_edl_file(edl_file, uploads_folder, output_folder):
    try:
        with open(edl_file) as f:
            edl_data = json.load(f)
    except FileNotFoundError:
        print(f"Error: JSON file '{edl_file}' not found.")
        return
    except json.JSONDecodeError:
        print(f"Error: JSON file '{edl_file}' is malformed.")
        return

    clips = []
    for edit_data in edl_data['edits']:
        try:
            clip_path = os.path.join(uploads_folder, edit_data['clipName'])
            clip = VideoFileClip(clip_path)
            source_in = list(map(int, edit_data['sourceIn'].split(':')))
            source_out = list(map(int, edit_data['sourceOut'].split(':')))
            # Convert time to seconds
            start_time = source_in[0] * 3600 + source_in[1] * \
                60 + source_in[2] + source_in[3] / 25
            end_time = source_out[0] * 3600 + source_out[1] * \
                60 + source_out[2] + source_out[3] / 25

            # Subclip the relevant portion of the clip
            subclip = clip.subclip(start_time, end_time)
            clips.append(subclip)
        except OSError:
            print(
                f"Error: Failed to load video clip '{edit_data['clipName']}'")

    try:
        final_clip = concatenate_videoclips(clips)
        output_file = os.path.splitext(
            os.path.basename(edl_file))[0] + "_output.mp4"
        output_path = os.path.join(output_folder, output_file)
        final_clip.write_videofile(output_path)
    finally:
        # Close all video clips
        for clip in clips:
            clip.close()
        if 'final_clip' in locals():
            final_clip.close()


def process_edl_files(folder_path, uploads_folder, output_folder):
    edl_files = [file for file in os.listdir(
        folder_path) if file.endswith('.json')]
    for edl_file in edl_files:
        full_path = os.path.join(folder_path, edl_file)
        print(f"Processing '{full_path}'...")
        process_edl_file(full_path, uploads_folder, output_folder)
        print(f"Processing of '{full_path}' completed.\n")


if __name__ == "__main__":
    edl_folder = "/app/parsedEDL"  # ../parsedEDL
    uploads_folder = "/app/uploads"  # ../uploads
    output_folder = "/app/editedvideos"  # ../editedvideos
    process_edl_files(edl_folder, uploads_folder, output_folder)
