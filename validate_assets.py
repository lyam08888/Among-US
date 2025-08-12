#!/usr/bin/env python3
"""
Script to validate that all required assets are present for Among Us V3 game
"""

import os
import json

def check_file_exists(filepath):
    """Check if file exists and return its size"""
    if os.path.exists(filepath):
        return os.path.getsize(filepath)
    return None

def main():
    print("🔍 Validating Among Us V3 Assets...")
    print("=" * 50)
    
    # Define all required assets
    required_assets = {
        "Audio Files (Main)": [
            "assets/sounds/ambient.mp3",
            "assets/sounds/button-click.mp3",
            "assets/sounds/task-complete.mp3",
            "assets/sounds/emergency.mp3",
            "assets/sounds/kill.mp3",
            "assets/sounds/sabotage.mp3",
            "assets/sounds/vent.mp3",
            "assets/sounds/footstep.mp3",
            "assets/sounds/lobby.mp3",
            "assets/sounds/discussion.mp3"
        ],
        "Audio Files (Fallback)": [
            "assets/sounds/default-click.mp3",
            "assets/sounds/default-complete.mp3",
            "assets/sounds/default-kill.mp3",
            "assets/sounds/default-emergency.mp3",
            "assets/sounds/default-sabotage.mp3",
            "assets/sounds/default-vent.mp3",
            "assets/sounds/default-footstep.mp3",
            "assets/sounds/default-ambient.mp3",
            "assets/sounds/default-lobby.mp3",
            "assets/sounds/default-discussion.mp3"
        ]
    }
    
    total_files = 0
    missing_files = 0
    total_size = 0
    
    for category, files in required_assets.items():
        print(f"\n📁 {category}:")
        category_missing = 0
        
        for filepath in files:
            total_files += 1
            size = check_file_exists(filepath)
            
            if size is not None:
                total_size += size
                size_str = f"({size:,} bytes)" if size < 1024 else f"({size/1024:.1f} KB)"
                print(f"   ✅ {os.path.basename(filepath)} {size_str}")
            else:
                print(f"   ❌ {os.path.basename(filepath)} - MISSING")
                missing_files += 1
                category_missing += 1
        
        if category_missing == 0:
            print(f"   🎉 All {len(files)} files present!")
    
    print("\n" + "=" * 50)
    print("📊 VALIDATION SUMMARY:")
    print(f"   • Total files checked: {total_files}")
    print(f"   • Files present: {total_files - missing_files}")
    print(f"   • Files missing: {missing_files}")
    print(f"   • Total size: {total_size:,} bytes ({total_size/1024:.1f} KB)")
    
    if missing_files == 0:
        print("\n🎉 SUCCESS: All required assets are present!")
        print("🚀 Your Among Us game is ready to run!")
    else:
        print(f"\n⚠️  WARNING: {missing_files} files are missing!")
        print("💡 Run 'python create_all_audio_files.py' to create missing files")
    
    # Check HTML preload links
    print("\n🔍 Checking HTML preload links...")
    html_file = "index.html"
    if os.path.exists(html_file):
        with open(html_file, 'r', encoding='utf-8') as f:
            content = f.read()
            
        preload_issues = []
        if 'crossorigin="anonymous"' in content:
            preload_issues.append("Found crossorigin attribute in preload links")
        
        if preload_issues:
            print("   ⚠️  HTML Issues found:")
            for issue in preload_issues:
                print(f"      • {issue}")
        else:
            print("   ✅ HTML preload links are correctly formatted")
    else:
        print("   ❌ index.html not found")

if __name__ == "__main__":
    main()