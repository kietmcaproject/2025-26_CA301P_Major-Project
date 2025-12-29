#!/usr/bin/env python3
"""
Simple setup script for the Face Recognition Model.
This script will:
1. Install required dependencies
2. Create necessary directories
"""

import subprocess
import sys
import os

def install_dependencies():
    """Install required dependencies."""
    print("📦 Installing dependencies...")
    
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✅ Dependencies installed successfully!")
        return True
        
    except subprocess.CalledProcessError as e:
        print(f"❌ Error installing dependencies: {e}")
        print("   Please try installing manually:")
        print("   pip install -r requirements.txt")
        return False

def create_directories():
    """Create necessary directories."""
    print("📁 Creating directories...")

    directories = ["registered_images", "models"]

    for directory in directories:
        if not os.path.exists(directory):
            os.makedirs(directory)
            print(f"   Created: {directory}/")
        else:
            print(f"   Exists: {directory}/")
    
    print("✅ Directories created successfully!")
    return True

def main():
    """Main setup function."""
    print("🎯 Face Recognition Model Setup")
    print("=" * 40)
    
    # Install dependencies
    if not install_dependencies():
        return False
    
    # Create directories
    if not create_directories():
        return False
    
    print("\n🎉 Setup completed successfully!")
    print("\n📋 Next steps:")
    print("   1. Add face images to 'images/' directory (one folder per person)")
    print("   2. Run: python train_model.py")
    print("   3. Run: python test_model.py")
    
    return True

if __name__ == "__main__":
    success = main()
    if not success:
        print("\n❌ Setup failed! Please check the errors above.")
        sys.exit(1)
