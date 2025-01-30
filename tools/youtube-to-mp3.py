import yt_dlp
import os

def download_youtube_audio():
    # Get YouTube URL from user
    url = input("Enter the YouTube video URL: ").strip()
    
    try:
        # Get destination path
        dest = input("Enter destination directory (blank for current): ").strip() or '.'
        
        # yt-dlp configuration
        ydl_opts = {
            'format': 'bestaudio/best',
            'outtmpl': os.path.join(dest, '%(title)s.%(ext)s'),
            'quiet': False,
            'no_warnings': False,
        }
        
        # Download and process
        print("Downloading...")
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            print(f"Successfully downloaded: {info['title']}")
    
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    download_youtube_audio()
