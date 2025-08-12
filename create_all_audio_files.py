#!/usr/bin/env python3
"""
Script to create all required MP3 files for Among Us V3 game
This creates minimal valid MP3 files to prevent 404 errors and includes fallback files
"""

import os
import struct

def create_minimal_mp3(filename, duration_frames=10):
    """
    Create a minimal valid MP3 file with specified duration
    Each frame represents about 26ms of audio
    """
    # MP3 frame header for Layer III, 44.1kHz, 128kbps, stereo
    frame_header = bytes([0xFF, 0xFB, 0x90, 0x00])
    
    # Create frame data (mostly zeros for silence)
    frame_data = bytes([0x00] * 144)  # 144 bytes per frame for 128kbps
    
    # Build complete MP3 data
    mp3_data = bytearray()
    
    # Add ID3v2 header (optional but good practice)
    id3_header = b'ID3\x03\x00\x00\x00\x00\x00\x00'
    mp3_data.extend(id3_header)
    
    # Add MP3 frames
    for _ in range(duration_frames):
        mp3_data.extend(frame_header)
        mp3_data.extend(frame_data)
    
    # Write to file
    with open(filename, 'wb') as f:
        f.write(mp3_data)

def create_audio_file_with_type(filepath, audio_type):
    """Create audio file with different characteristics based on type"""
    if audio_type == 'music':
        # Longer duration for music files
        create_minimal_mp3(filepath, duration_frames=50)  # ~1.3 seconds
    elif audio_type == 'ambient':
        # Even longer for ambient sounds
        create_minimal_mp3(filepath, duration_frames=100)  # ~2.6 seconds
    else:
        # Short duration for SFX
        create_minimal_mp3(filepath, duration_frames=5)   # ~0.13 seconds

def main():
    # Create assets/sounds directory if it doesn't exist
    sounds_dir = "assets/sounds"
    os.makedirs(sounds_dir, exist_ok=True)
    
    # Define all audio files with their types
    audio_files = {
        # Main audio files (some already exist)
        "ambient.mp3": "ambient",
        "button-click.mp3": "sfx", 
        "task-complete.mp3": "sfx",
        "emergency.mp3": "sfx",
        "kill.mp3": "sfx",
        
        # Missing main audio files
        "sabotage.mp3": "sfx",
        "vent.mp3": "sfx",
        "footstep.mp3": "sfx",
        "lobby.mp3": "music",
        "discussion.mp3": "music",
        
        # Fallback audio files
        "default-click.mp3": "sfx",
        "default-complete.mp3": "sfx",
        "default-kill.mp3": "sfx",
        "default-emergency.mp3": "sfx",
        "default-sabotage.mp3": "sfx",
        "default-vent.mp3": "sfx",
        "default-footstep.mp3": "sfx",
        "default-ambient.mp3": "ambient",
        "default-lobby.mp3": "music",
        "default-discussion.mp3": "music"
    }
    
    print("🎵 Creating MP3 files for Among Us V3...")
    print("=" * 50)
    
    created_count = 0
    skipped_count = 0
    
    for audio_file, audio_type in audio_files.items():
        filepath = os.path.join(sounds_dir, audio_file)
        
        if os.path.exists(filepath):
            print(f"⏭️  Skipped (exists): {audio_file}")
            skipped_count += 1
        else:
            create_audio_file_with_type(filepath, audio_type)
            
            # Get file size for confirmation
            file_size = os.path.getsize(filepath)
            type_icon = "🎵" if audio_type == "music" else "🌊" if audio_type == "ambient" else "🔊"
            
            print(f"✅ Created {type_icon}: {audio_file} ({file_size} bytes)")
            created_count += 1
    
    print("=" * 50)
    print(f"🎉 Audio files creation completed!")
    print(f"📊 Summary:")
    print(f"   • Created: {created_count} files")
    print(f"   • Skipped: {skipped_count} files (already existed)")
    print(f"   • Total: {len(audio_files)} files")
    print()
    print("📝 Notes:")
    print("   • These are minimal silent MP3 files to prevent 404 errors")
    print("   • Replace with actual audio files for better game experience")
    print("   • Fallback files provide redundancy if main files fail to load")
    print("   • Music files are longer than SFX files")

if __name__ == "__main__":
    main()