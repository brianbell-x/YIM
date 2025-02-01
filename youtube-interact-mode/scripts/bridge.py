import json
import sys
import os
from pathlib import Path
import struct
import json

def write_message(message):
    """Write a message to stdout in Chrome native messaging format."""
    # Chrome native messaging protocol: uint32 length prefix, then JSON message
    message_json = json.dumps(message)
    message_bytes = message_json.encode('utf-8')
    sys.stdout.buffer.write(struct.pack('I', len(message_bytes)))
    sys.stdout.buffer.write(message_bytes)
    sys.stdout.buffer.flush()

def read_message():
    """Read a message from stdin in Chrome native messaging format."""
    # Read the 4-byte length prefix
    length_bytes = sys.stdin.buffer.read(4)
    if not length_bytes:
        return None
    length = struct.unpack('I', length_bytes)[0]
    # Read the JSON message
    message_bytes = sys.stdin.buffer.read(length)
    message = json.loads(message_bytes.decode('utf-8'))
    return message

def main():
    # Default cache location
    cache_dir = Path('cache')
    cache_file = cache_dir / "transcripts_cache.json"
    
    if not cache_file.exists():
        write_message({"error": "Cache file not found"})
        return
    
    # Load cache
    with open(cache_file, 'r') as f:
        cache = json.load(f)
    
    # Read request from extension
    request = read_message()
    if not request or 'video_id' not in request:
        write_message({"error": "Invalid request"})
        return
    
    video_id = request['video_id']
    
    # Get transcript from cache
    if video_id in cache:
        write_message({
            "success": True,
            "transcript": cache[video_id]
        })
    else:
        write_message({
            "success": False,
            "error": "Transcript not found for video"
        })

if __name__ == "__main__":
    main() 