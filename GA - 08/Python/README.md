# Simple Face Recognition Model

A simple face recognition system that trains on manually placed images and tests recognition capabilities.

## Features

- **Simple Training**: Just place images in folders and train the model
- **Face Recognition**: Test recognition on images or webcam
- **No Complex Features**: Focused only on core face recognition functionality

## Project Structure

```
model_only/
├── images/                    # Place face images here
│   ├── person1/              # One folder per person
│   │   ├── image1.jpg
│   │   └── image2.jpg
│   └── person2/
│       └── photo1.jpg
├── models/                    # Trained models are saved here
├── face_recognition_model.py  # Core face recognition model
├── train_model.py            # Script to train the model
├── test_model.py             # Script to test recognition
├── setup.py                  # Setup script
└── requirements.txt          # Python dependencies
```

## Quick Start

### 1. Setup
```bash
python setup.py
```

### 2. Add Face Images
- Create a folder in `images/` for each person
- Name the folder with the person's name
- Add multiple images of the same person for better accuracy
- Supported formats: `.jpg`, `.jpeg`, `.png`, `.bmp`

### 3. Train the Model
```bash
python train_model.py
```

### 4. Test Recognition
```bash
# Test with webcam
python test_model.py --webcam

# Test with an image
python test_model.py --image path/to/image.jpg

# Interactive mode
python test_model.py
```

## Usage Examples

### Training
```bash
python train_model.py
```
This will:
- Scan the `images/` directory
- Train the model on all found faces
- Save the trained model to `models/trained_face_model.pkl`

### Testing
```bash
# Webcam recognition
python test_model.py --webcam

# Single image recognition
python test_model.py --image test_photo.jpg
```

## Requirements

- Python 3.8+
- PyTorch
- OpenCV
- facenet-pytorch
- Other dependencies listed in `requirements.txt`

## Notes

- The model uses MTCNN for face detection and FaceNet for face encoding
- Recognition threshold is set to 0.6 by default (adjustable in the model)
- For best results, use clear, well-lit face images
- Multiple images per person improve recognition accuracy
