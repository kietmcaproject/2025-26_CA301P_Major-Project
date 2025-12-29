#!/usr/bin/env python3
"""
Script to train the face recognition model on manually added images.
This script will:
1. Look for images in the 'images' directory
2. Train the model on these images
3. Save the trained model
"""

import os
import cv2
import numpy as np
from face_recognition_model import FaceRecognitionModel
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def create_images_directory():
    """Create the images directory structure if it doesn't exist."""
    images_dir = "registered_images"
    if not os.path.exists(images_dir):
        os.makedirs(images_dir)
        logger.info(f"Created directory: {images_dir}")
        
        # Create a sample structure
        sample_dir = os.path.join(images_dir, "sample_person")
        os.makedirs(sample_dir, exist_ok=True)
        
        # Create a README file
        readme_content = """# Face Images Directory

Place face images here following this structure:

images/
├── john_doe/
│   ├── image1.jpg
│   ├── image2.jpg
│   └── image3.jpg
├── jane_smith/
│   ├── photo1.jpg
│   └── photo2.jpg
└── another_person/
    └── face.jpg

## Guidelines:
- Create a folder for each person
- Use their name as the folder name
- Add multiple images of the same person for better accuracy
- Supported formats: .jpg, .jpeg, .png, .bmp
- Ensure faces are clearly visible and well-lit
- Remove this sample_person folder when you add real images

## Example:
images/
├── ayush_kumar/
│   ├── ayush_front.jpg
│   ├── ayush_side.jpg
│   └── ayush_smile.jpg
└── friend_name/
    ├── friend1.jpg
    └── friend2.jpg
"""
        
        with open(os.path.join(images_dir, "README.md"), "w") as f:
            f.write(readme_content)
        
        logger.info("Created sample directory structure and README")
        return False  # No real images yet
    
    return True  # Directory exists

def train_model():
    """Train the face recognition model on images in the registered_images directory."""
    print("🚀 Face Recognition Model Training")
    print("=" * 50)
    
    # Check if images directory exists and has images
    if not create_images_directory():
        print("\n📁 Please add face images to the 'registered_images' directory first!")
        print("   Follow the structure shown in images/README.md")
        print("   Then run this script again.")
        return None
    
    # Check if there are any subdirectories with images
    images_dir = "registered_images"
    person_dirs = [d for d in os.listdir(images_dir) 
                   if os.path.isdir(os.path.join(images_dir, d)) and d != "sample_person"]
    
    if not person_dirs:
        print("\n📁 No person directories found in 'registered_images' folder!")
        print("   Please add images following the structure in registered_images/README.md")
        return None
    
    print(f"📊 Found {len(person_dirs)} person directories:")
    for person in person_dirs:
        person_path = os.path.join(images_dir, person)
        image_count = len([f for f in os.listdir(person_path) 
                          if f.lower().endswith(('.jpg', '.jpeg', '.png', '.bmp'))])
        print(f"   {person}: {image_count} images")
    
    # Initialize the model
    print("\n🤖 Initializing Face Recognition Model...")
    model = FaceRecognitionModel(threshold=0.6)
    
    # Train the model
    print("\n🎯 Training model on face images...")
    success = model.train_on_directory(images_dir)
    
    if success:
        print(f"\n✅ Training completed successfully!")
        print(f"   Total faces trained: {len(model.known_face_names)}")
        print(f"   Known names: {', '.join(model.known_face_names)}")
        
        # Save the trained model
        model_path = "models/trained_face_model.pkl"
        os.makedirs("models", exist_ok=True)
        
        if model.save_model(model_path):
            print(f"💾 Model saved to: {model_path}")
            
            # Display model information
            info = model.get_model_info()
            print(f"\n📋 Model Information:")
            print(f"   Total faces: {info['total_faces']}")
            print(f"   Threshold: {info['threshold']}")
            print(f"   Device: {info['device']}")
            
            return model
        else:
            print("❌ Failed to save the model!")
            return None
    else:
        print("❌ Training failed!")
        return None

def main():
    """Main function to train the model."""
    # Train the model
    model = train_model()
    
    if model:
        print(f"\n🎯 Training completed!")
        print(f"   1. Your model is trained and saved as 'models/trained_face_model.pkl'")
        print(f"   2. Use 'test_model.py' to test recognition")
        print(f"   3. Add more faces to 'registered_images/' directory and retrain if needed")
        
    else:
        print("\n❌ Model training failed!")
        print("   Please check that:")
        print("   - 'registered_images' directory contains person subdirectories")
        print("   - Each subdirectory contains valid image files")
        print("   - Images contain clearly visible faces")

if __name__ == "__main__":
    main()
