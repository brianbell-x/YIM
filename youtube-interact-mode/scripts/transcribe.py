import yt_dlp
import openai
import os
import json
import argparse
from pathlib import Path

def download_audio(youtube_url, output_path):
    """Download YouTube video as audio."""
    ydl_opts = {
        'format': 'bestaudio/best',
        'outtmpl': f'{output_path}.%(ext)s',
        'quiet': True,
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
        }]
    }
    
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        try:
            info = ydl.extract_info(youtube_url, download=True)
            return f"{output_path}.mp3"
        except Exception as e:
            print(f"Error downloading audio: {e}")
            return None

def transcribe_file(openai_api_key, audio_path):
    """Transcribe audio file using OpenAI Whisper API."""
    openai.api_key = openai_api_key
    
    try:
        with open(audio_path, "rb") as audio_file:
            transcript = openai.Audio.transcribe("whisper-1", audio_file)
            return transcript["text"]
    except Exception as e:
        print(f"Error transcribing audio: {e}")
        return None

def get_video_id(url):
    """Extract video ID from YouTube URL."""
    if "v=" in url:
        return url.split("v=")[1].split("&")[0]
    elif "youtu.be/" in url:
        return url.split("youtu.be/")[1].split("?")[0]
    return None

def main():
    parser = argparse.ArgumentParser(description='Transcribe YouTube videos')
    parser.add_argument('url', help='YouTube video URL')
    parser.add_argument('--api-key', help='OpenAI API key')
    parser.add_argument('--cache-dir', default='cache', help='Directory for caching transcripts')
    args = parser.parse_args()

    # Ensure cache directory exists
    cache_dir = Path(args.cache_dir)
    cache_dir.mkdir(exist_ok=True)
    
    # Cache file path
    cache_file = cache_dir / "transcripts_cache.json"
    if not cache_file.exists():
        cache_file.write_text("{}")
    
    # Load cache
    cache = json.loads(cache_file.read_text())
    
    # Get video ID
    video_id = get_video_id(args.url)
    if not video_id:
        print("Invalid YouTube URL")
        return
    
    # Check cache
    if video_id in cache:
        print("Found transcript in cache:")
        print(cache[video_id])
        return
    
    # Get API key
    api_key = args.api_key or os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("No OpenAI API key provided")
        return
    
    # Download and transcribe
    print("Downloading audio...")
    audio_path = download_audio(args.url, cache_dir / "temp_audio")
    if not audio_path:
        return
    
    print("Transcribing audio...")
    transcript = transcribe_file(api_key, audio_path)
    if not transcript:
        return
    
    # Save to cache
    cache[video_id] = transcript
    cache_file.write_text(json.dumps(cache, indent=2))
    
    # Clean up audio file
    os.remove(audio_path)
    
    print("Transcript:")
    print(transcript)

if __name__ == "__main__":
    main() 