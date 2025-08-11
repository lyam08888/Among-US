#!/usr/bin/env python3
"""
Script to create empty MP3 files for Among Us V3 game
This creates minimal valid MP3 files to prevent 404 errors
"""

import os

def create_minimal_mp3(filename):
    """Create a minimal valid MP3 file"""
    # Minimal MP3 header for a very short silent audio file
    mp3_header = bytes([
        0xFF, 0xFB, 0x90, 0x00,  # MP3 frame header
        0x00, 0x00, 0x00, 0x00,  # Additional header data
        0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00
    ])
    
    with open(filename, 'wb') as f:
        f.write(mp3_header)

def main():
    # Create assets/sounds directory if it doesn't exist
    sounds_dir = "assets/sounds"
    os.makedirs(sounds_dir, exist_ok=True)
    
    # List of audio files needed
    audio_files = [
        "ambient.mp3",
        "button-click.mp3", 
        "task-complete.mp3",
        "emergency.mp3",
        "kill.mp3"
    ]
    
    print("Creating minimal MP3 files...")
    
    for audio_file in audio_files:
        filepath = os.path.join(sounds_dir, audio_file)
        create_minimal_mp3(filepath)
        print(f"Created: {filepath}")
    
    print("All audio files created successfully!")
    print("Note: These are minimal silent MP3 files. Replace with actual audio files for better experience.")

if __name__ == "__main__":
    main()