#!/usr/bin/env python3
import os
import cv2
import numpy as np
import mysql.connector
from datetime import datetime, date
from face_recognition_model import FaceRecognitionModel
import argparse

# ---------- DATABASE CONFIG ----------
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',                # change if needed
    'password': '1234',            # your MySQL password
    'database': 'smartattendance'  # your database name
}

# ---------- STORE ATTENDANCE ----------
def store_attendance_in_db(name: str):
    """Insert recognized student attendance into database."""
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor(buffered=True)

        # Extract last 4 characters (registration part)
        reg_part = name[-4:]
        reg_no = str(int(reg_part))  # remove leading zeros (e.g., "0113" -> "113")

        # Find matching student in DB by registration_no
        cursor.execute("SELECT name FROM student WHERE registration_no = %s", (reg_no,))
        result = cursor.fetchone()
        if not result:
            print(f"⚠️ Student '{name}' not found in student table (reg_no: {reg_no}).")
            return

        student_name = result[0]
        today = date.today()

        # Check if already marked today
        cursor.execute(
            "SELECT COUNT(*) FROM attendance WHERE registration_no = %s AND DATE(timestamp) = %s",
            (reg_no, today)
        )
        already_marked = cursor.fetchone()[0]

        if already_marked:
            print(f"🟡 Attendance already marked for {student_name} ({reg_no}) today.")
        else:
            timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            cursor.execute(
                "INSERT INTO attendance (registration_no, name, timestamp) VALUES (%s, %s, %s)",
                (reg_no, student_name, timestamp)
            )
            conn.commit()
            print(f"✅ Attendance marked for {student_name} ({reg_no}) at {timestamp}")

    except mysql.connector.Error as e:
        print(f"❌ Database Error: {e}")
    except ValueError:
        print(f"⚠️ Could not extract valid registration number from '{name}'")
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()

# ---------- MODEL LOADING ----------
def load_model(model_path: str = "models/trained_face_model.pkl"):
    if not os.path.exists(model_path):
        print(f"❌ Model file not found: {model_path}")
        return None
    model = FaceRecognitionModel()
    if model.load_model(model_path):
        info = model.get_model_info()
        print(f"✅ Model loaded ({info['total_faces']} faces)")
        return model
    return None

# ---------- TEST WEBCAM ----------
def test_webcam(model):
    print("\n📹 Starting webcam recognition... (press 'q' to quit)")
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("❌ Could not open webcam")
        return

    logged_names = set()
    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            display_frame = frame.copy()
            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = model.process_image(frame_rgb)

            for result in results:
                bbox = result['bbox']
                name = result['name']
                x1, y1, x2, y2 = map(int, bbox)
                color = (0, 255, 0) if name != 'Unknown' else (0, 0, 255)
                cv2.rectangle(display_frame, (x1, y1), (x2, y2), color, 2)
                cv2.putText(display_frame, name, (x1, y1 - 10),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

                # Store attendance only once per session
                if name != 'Unknown' and name not in logged_names:
                    store_attendance_in_db(name)
                    logged_names.add(name)

            cv2.imshow('Face Recognition - Attendance', display_frame)
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
    finally:
        cap.release()
        cv2.destroyAllWindows()
        print("\n📹 Webcam recognition stopped")

# ---------- MAIN ----------
def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--webcam', '-w', action='store_true', help='Use webcam for testing')
    parser.add_argument('--model', '-m', type=str, default='models/trained_face_model.pkl')
    args = parser.parse_args()

    model = load_model(args.model)
    if not model:
        return

    if args.webcam:
        test_webcam(model)
    else:
        print("Run with --webcam to start recognition (e.g., python test_model.py --webcam)")

if __name__ == "__main__":
    main()

# #!/usr/bin/env python3
# """
# Simple script to test the trained face recognition model.
# This script will:
# 1. Load the trained model
# 2. Test recognition on images or webcam
# 3. Display results
# """

# import os
# import cv2
# import numpy as np
# from face_recognition_model import FaceRecognitionModel
# import argparse
# from datetime import datetime

# def load_model(model_path: str = "models/trained_face_model.pkl"):
#     """Load the trained face recognition model."""
#     if not os.path.exists(model_path):
#         print(f"❌ Model file not found: {model_path}")
#         print("   Please train the model first using 'train_model.py'")
#         return None
    
#     print(f"🤖 Loading model from: {model_path}")
#     model = FaceRecognitionModel()
    
#     if model.load_model(model_path):
#         print("✅ Model loaded successfully!")
#         info = model.get_model_info()
#         print(f"   Total faces: {info['total_faces']}")
#         print(f"   Known names: {', '.join(info['known_names'])}")
#         return model
#     else:
#         print("❌ Failed to load model!")
#         return None

# def test_single_image(model, image_path: str):
#     """Test recognition on a single image file."""
#     print(f"\n📸 Testing image: {image_path}")
    
#     if not os.path.exists(image_path):
#         print(f"❌ Image file not found: {image_path}")
#         return
    
#     # Load image
#     image = cv2.imread(image_path)
#     if image is None:
#         print(f"❌ Failed to load image: {image_path}")
#         return
    
#     # Convert to RGB
#     image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    
#     # Process image
#     print("🔍 Recognizing faces...")
#     results = model.process_image(image_rgb)
    
#     if results:
#         print(f"✅ Found {len(results)} face(s):")
#         # Track recognized names for this run
#         logged_names = set()
#         for i, result in enumerate(results):
#             print(f"\n   Face {i+1}:")
#             print(f"     Name: {result['name']}")
#             print(f"     Bounding Box: {result['bbox']}")
#             # Save recognized name and timestamp if not Unknown and not already logged
#             if result['name'] != 'Unknown' and result['name'] not in logged_names:
#                 log_path = os.path.join(os.path.dirname(__file__), 'recognitions.txt')
#                 with open(log_path, 'a') as log_file:
#                     timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
#                     log_file.write(f"{result['name']} - {timestamp}\n")
#                 logged_names.add(result['name'])
#     else:
#         print("❌ No faces detected in the image")

# def test_webcam(model):
#     """Test recognition using webcam."""
#     print("\n📹 Starting webcam recognition...")
#     print("   Press 'q' to quit")
    
#     cap = cv2.VideoCapture(0)
    
#     if not cap.isOpened():
#         print("❌ Could not open webcam")
#         return
    
#     # Track recognized names for this run
#     logged_names = set()
#     try:
#         while True:
#             ret, frame = cap.read()
#             if not ret:
#                 print("❌ Failed to capture frame")
#                 break
#             # Create a copy for display
#             display_frame = frame.copy()
#             # Process frame
#             frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
#             results = model.process_image(frame_rgb)
#             # Draw results on frame
#             for result in results:
#                 bbox = result['bbox']
#                 name = result['name']
#                 # Draw bounding box
#                 x1, y1, x2, y2 = map(int, bbox)
#                 color = (0, 255, 0) if name != 'Unknown' else (0, 0, 255)
#                 cv2.rectangle(display_frame, (x1, y1), (x2, y2), color, 2)
#                 # Draw name only
#                 label = f"{name}"
#                 cv2.putText(display_frame, label, (x1, y1-10), 
#                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)
#                 # Save recognized name and timestamp if not Unknown and not already logged
#                 if name != 'Unknown' and name not in logged_names:
#                     log_path = os.path.join(os.path.dirname(__file__), 'recognitions.txt')
#                     with open(log_path, 'a') as log_file:
#                         timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
#                         log_file.write(f"{name} - {timestamp}\n")
#                     logged_names.add(name)
#             # Display frame
#             cv2.imshow('Face Recognition Test', display_frame)
#             # Handle key presses
#             key = cv2.waitKey(1) & 0xFF
#             if key == ord('q'):
#                 break
#     finally:
#         cap.release()
#         cv2.destroyAllWindows()
#         print("\n📹 Webcam recognition stopped")

# def main():
#     """Main function."""
#     parser = argparse.ArgumentParser(description='Test Face Recognition Model')
#     parser.add_argument('--image', '-i', type=str, help='Path to image file to test')
#     parser.add_argument('--webcam', '-w', action='store_true', help='Test with webcam')
#     parser.add_argument('--model', '-m', type=str, default='models/trained_face_model.pkl', 
#                        help='Path to trained model file')
    
#     args = parser.parse_args()
    
#     print("🧪 Face Recognition Model Test")
#     print("=" * 40)
    
#     # Load model
#     model = load_model(args.model)
#     if model is None:
#         return
    
#     if args.image:
#         # Test single image
#         test_single_image(model, args.image)
        
#     elif args.webcam:
#         # Test with webcam
#         test_webcam(model)
        
#     else:
#         # Interactive mode
#         print("\n🎯 Choose an option:")
#         print("   1. Test a single image")
#         print("   2. Test with webcam")
#         print("   3. Exit")
        
#         while True:
#             choice = input("\nEnter your choice (1-3): ").strip()
            
#             if choice == '1':
#                 image_path = input("Enter image path: ").strip()
#                 if image_path:
#                     test_single_image(model, image_path)
#                 break
                
#             elif choice == '2':
#                 test_webcam(model)
#                 break
                
#             elif choice == '3':
#                 print("👋 Goodbye!")
#                 break
                
#             else:
#                 print("❌ Invalid choice. Please enter 1, 2, or 3.")
    
#     print("\n✅ Testing completed!")

# if __name__ == "__main__":
#     main()
