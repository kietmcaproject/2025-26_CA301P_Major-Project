
import os
import cv2
import numpy as np
import torch
from facenet_pytorch import InceptionResnetV1, MTCNN
import pickle
import logging
from typing import List, Tuple, Dict

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class FaceRecognitionModel:
    """Simple Face Recognition Model for training and testing."""
    
    def __init__(self, threshold: float = 0.6, device: str = 'cpu'):
        self.threshold = threshold
        self.device = device
        
        # Initialize models
        logger.info(f"Initializing models on device: {device}")
        self.mtcnn = MTCNN(keep_all=True, device=device)
        self.resnet = InceptionResnetV1(pretrained='vggface2').eval().to(device)
        
        # Storage for known faces
        self.known_face_encodings = []
        self.known_face_names = []
    
    def detect_and_encode(self, image: np.ndarray) -> List[np.ndarray]:
        """Detect faces in image and encode them."""
        try:
            with torch.no_grad():
                boxes, _ = self.mtcnn.detect(image)
                
                if boxes is not None:
                    faces = []
                    for box in boxes:
                        face = image[int(box[1]):int(box[3]), int(box[0]):int(box[2])]
                        
                        if face.size == 0:
                            continue
                        
                        face = cv2.resize(face, (160, 160))
                        face = np.transpose(face, (2, 0, 1)).astype(np.float32) / 255.0
                        face_tensor = torch.tensor(face).unsqueeze(0).to(self.device)
                        
                        encoding = self.resnet(face_tensor).detach().cpu().numpy().flatten()
                        faces.append(encoding)
                    
                    return faces
                return []
                
        except Exception as e:
            logger.error(f"Error in face detection/encoding: {e}")
            return []
    
    def add_face(self, name: str, image: np.ndarray) -> bool:
        """Add a new face to the known faces database."""
        try:
            encodings = self.detect_and_encode(image)
            
            if not encodings:
                logger.warning(f"No face detected in image for {name}")
                return False
            
            encoding = encodings[0]
            self.known_face_encodings.append(encoding)
            self.known_face_names.append(name)
            
            logger.info(f"Successfully added face for {name}")
            return True
            
        except Exception as e:
            logger.error(f"Error adding face for {name}: {e}")
            return False
    
    def recognize_faces(self, test_encodings: List[np.ndarray], threshold: float = None) -> List[Tuple[str, float]]:
        """Recognize faces in test encodings."""
        if threshold is None:
            threshold = self.threshold
            
        if not self.known_face_encodings:
            return [('No known faces', 0.0)] * len(test_encodings)
        
        recognized_results = []
        
        for test_encoding in test_encodings:
            distances = np.linalg.norm(
                np.array(self.known_face_encodings) - test_encoding, 
                axis=1
            )
            
            min_distance_idx = np.argmin(distances)
            min_distance = distances[min_distance_idx]
            confidence = max(0, 1 - (min_distance / threshold))
            
            if min_distance < threshold:
                name = self.known_face_names[min_distance_idx]
                recognized_results.append((name, confidence))
            else:
                recognized_results.append(('Unknown', confidence))
        
        return recognized_results
    
    def process_image(self, image: np.ndarray) -> List[Dict]:
        """Process an image to detect and recognize all faces."""
        try:
            boxes, _ = self.mtcnn.detect(image)
            
            if boxes is None:
                return []
            
            if len(image.shape) == 3 and image.shape[2] == 3:
                image_rgb = image
            else:
                image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            
            test_encodings = self.detect_and_encode(image_rgb)
            
            if not test_encodings:
                return []
            
            recognition_results = self.recognize_faces(test_encodings)
            
            results = []
            for i, (box, (name, _)) in enumerate(zip(boxes, recognition_results)):
                result = {
                    'name': name,
                    'bbox': box.tolist()
                }
                results.append(result)
            return results
            
        except Exception as e:
            logger.error(f"Error processing image: {e}")
            return []
    
    def train_on_directory(self, data_dir: str) -> bool:
        """Train the model on a directory of face images."""
        try:
            if not os.path.exists(data_dir):
                logger.error(f"Data directory {data_dir} does not exist")
                return False
            
            self.known_face_encodings = []
            self.known_face_names = []
            
            for person_dir in os.listdir(data_dir):
                person_path = os.path.join(data_dir, person_dir)
                
                if not os.path.isdir(person_path):
                    continue
                
                image_files = [f for f in os.listdir(person_path) 
                             if f.lower().endswith(('.jpg', '.jpeg', '.png', '.bmp'))]
                
                if not image_files:
                    logger.warning(f"No images found for {person_dir}")
                    continue
                
                for img_file in image_files:
                    img_path = os.path.join(person_path, img_file)
                    image = cv2.imread(img_path)
                    
                    if image is not None:
                        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
                        
                        if self.add_face(person_dir, image_rgb):
                                logger.info(f"Added {person_dir} from {img_file}")
                        else:
                                logger.warning(f"Failed to add {person_dir} from {img_file}")
            
            logger.info(f"Training completed. Added {len(self.known_face_names)} faces.")
            return True
            
        except Exception as e:
            logger.error(f"Error during training: {e}")
            return False
    
    def save_model(self, filepath: str) -> bool:
        """Save the trained model to disk."""
        try:
            model_data = {
                'known_face_encodings': self.known_face_encodings,
                'known_face_names': self.known_face_names,
                'threshold': self.threshold,
                'model_info': {
                    'mtcnn_version': 'facenet-pytorch',
                    'resnet_version': 'facenet-pytorch',
                    'encoding_dimension': 512,
                    'input_size': (160, 160)
                }
            }
            
            with open(filepath, 'wb') as f:
                pickle.dump(model_data, f)
            
            logger.info(f"Model saved to {filepath}")
            return True
            
        except Exception as e:
            logger.error(f"Error saving model: {e}")
            return False
    
    def load_model(self, filepath: str) -> bool:
        """Load a trained model from disk."""
        try:
            with open(filepath, 'rb') as f:
                model_data = pickle.load(f)
            
            self.known_face_encodings = model_data['known_face_encodings']
            self.known_face_names = model_data['known_face_names']
            self.threshold = model_data.get('threshold', 0.6)
            
            logger.info(f"Model loaded from {filepath}")
            logger.info(f"Loaded {len(self.known_face_names)} known faces")
            return True
            
        except Exception as e:
            logger.error(f"Error loading model: {e}")
            return False
    
    def get_model_info(self) -> Dict:
        """Get information about the current model."""
        return {
            'total_faces': len(self.known_face_names),
            'known_names': self.known_face_names,
            'threshold': self.threshold,
            'device': self.device
        }
    
    def clear_model(self):
        """Clear all stored face data."""
        self.known_face_encodings = []
        self.known_face_names = []
        logger.info("Model data cleared")


if __name__ == "__main__":
    print("Face Recognition Model - Simple Version")
    print("=" * 50)
    
    model = FaceRecognitionModel(threshold=0.6)
    print("✅ Model initialized successfully!")
    print("📁 Use 'train_on_directory()' to train on your face images")
    print("📸 Use 'process_image()' to recognize faces")
    print("💾 Use 'save_model()' to save your trained model")
