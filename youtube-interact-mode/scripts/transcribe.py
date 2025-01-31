import yt_dlp
import openai
import os
import json
import argparse
from pathlib import Path
from pydub import AudioSegment
import math
import tempfile
import subprocess
import sys

MAX_CHUNK_SIZE_MB = 25
CHUNK_SIZE_BYTES = MAX_CHUNK_SIZE_MB * 1024 * 1024

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
            return f"{output_path}.mp3", info.get('duration', 0)
        except Exception as e:
            print(f"Error downloading audio: {e}")
            return None, 0

def split_audio(file_path, chunk_duration_ms=300000):  # 5 minutes per chunk
    """Split audio file into chunks."""
    audio = AudioSegment.from_mp3(file_path)
    chunks = []
    
    total_duration = len(audio)
    num_chunks = math.ceil(total_duration / chunk_duration_ms)
    
    for i in range(num_chunks):
        start = i * chunk_duration_ms
        end = min((i + 1) * chunk_duration_ms, total_duration)
        
        chunk = audio[start:end]
        chunk_path = f"{file_path}_chunk_{i}.mp3"
        chunk.export(chunk_path, format="mp3")
        chunks.append(chunk_path)
    
    return chunks

def transcribe_file(openai_api_key, audio_path):
    """Transcribe audio file using OpenAI Whisper API."""
    openai.api_key = openai_api_key
    
    try:
        # Check file size
        file_size = os.path.getsize(audio_path)
        
        if file_size > CHUNK_SIZE_BYTES:
            print(f"File size ({file_size / 1024 / 1024:.2f}MB) exceeds {MAX_CHUNK_SIZE_MB}MB limit. Splitting into chunks...")
            chunks = split_audio(audio_path)
            
            # Transcribe each chunk
            transcripts = []
            for i, chunk_path in enumerate(chunks):
                print(f"Transcribing chunk {i+1}/{len(chunks)}...")
                with open(chunk_path, "rb") as audio_file:
                    chunk_transcript = openai.Audio.transcribe("whisper-1", audio_file)
                    transcripts.append(chunk_transcript["text"])
                os.remove(chunk_path)  # Clean up chunk file
            
            return " ".join(transcripts)
        else:
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

def update_chrome_storage(video_id, transcript):
    """Update Chrome's local storage with the transcript."""
    try:
        # Use Chrome's developer tools protocol to set local storage
        chrome_cmd = [
            "chrome",
            "--headless",
            "--remote-debugging-port=9222",
            "https://www.youtube.com/watch?v=" + video_id
        ]
        
        # Start Chrome in headless mode
        process = subprocess.Popen(chrome_cmd)
        
        # Give Chrome a moment to start
        import time
        time.sleep(2)
        
        # Use Chrome DevTools Protocol to set local storage
        import websocket
        import json
        
        ws = websocket.create_connection("ws://localhost:9222/devtools/browser")
        ws.send(json.dumps({
            "id": 1,
            "method": "Storage.setLocalStorageItem",
            "params": {
                "key": "transcript",
                "value": transcript
            }
        }))
        
        # Clean up
        ws.close()
        process.terminate()
        print("Successfully updated Chrome's local storage with transcript")
        
    except Exception as e:
        print(f"Warning: Could not update Chrome's local storage: {e}")
        print("You'll need to manually copy the transcript from the cache file.")

def main():
    parser = argparse.ArgumentParser(description='Transcribe YouTube videos')
    parser.add_argument('url', help='YouTube video URL')
    parser.add_argument('--api-key', help='OpenAI API key')
    parser.add_argument('--cache-dir', default='cache', help='Directory for caching transcripts')
    parser.add_argument('--no-chrome-update', action='store_true', help='Skip updating Chrome storage')
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
        if not args.no_chrome_update:
            update_chrome_storage(video_id, cache[video_id])
        return
    
    # Get API key
    api_key = args.api_key or os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("No OpenAI API key provided")
        return
    
    # Download and transcribe
    print("Downloading audio...")
    audio_path, duration = download_audio(args.url, cache_dir / "temp_audio")
    if not audio_path:
        return
    
    print("Transcribing audio...")
    transcript = transcribe_file(api_key, audio_path)
    if not transcript:
        return
    
    # Save to cache
    cache[video_id] = transcript
    cache_file.write_text(json.dumps(cache, indent=2))
    
    # Update Chrome's local storage
    if not args.no_chrome_update:
        update_chrome_storage(video_id, transcript)
    
    # Clean up audio file
    os.remove(audio_path)
    
    print("Transcript:")
    print(transcript)

if __name__ == "__main__":
    main() 