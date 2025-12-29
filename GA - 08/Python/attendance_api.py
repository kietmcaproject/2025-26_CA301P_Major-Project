from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
import base64
import os
import mysql.connector
from datetime import datetime, date
from face_recognition_model import FaceRecognitionModel

app = Flask(__name__)   
# CORS(app)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)


# ---------- CONFIG ----------
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',          # your MySQL user
    'password': '1234',      # your MySQL password
    'port': 3308,
    'database': 'smartattendance'
}

REGISTERED_FOLDER = r"D:\MCA\III sem\Major Project\smart-attendance-system\python\registered_image"
MODEL_PATH = r"D:\MCA\III sem\Major Project\smart-attendance-system\python\models\trained_face_model.pkl"

# ---------- LOAD MODEL ----------
model = FaceRecognitionModel()
if not model.load_model(MODEL_PATH):
    print("❌ Model not found or failed to load.")
else:
    print("✅ Model loaded successfully!")

# ---------- HELPER FUNCTION ----------
def store_attendance_in_db(name: str):
    """Insert recognized student attendance into database and return message."""
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor(buffered=True)

        reg_part = name[-4:]
        reg_no = str(int(reg_part))  # remove leading zeros

        cursor.execute("SELECT name FROM student WHERE registration_no = %s", (reg_no,))
        result = cursor.fetchone()
        if not result:
            return f"⚠️ Student not found in DB for reg_no {reg_no}"

        student_name = result[0]
        today = date.today()

        # check if attendance already marked today
        cursor.execute(
            "SELECT COUNT(*) FROM attendance WHERE registration_no = %s AND DATE(timestamp) = %s",
            (reg_no, today)
        )
        already_marked = cursor.fetchone()[0]

        if already_marked:
            return f"🟡 Attendance already marked for {student_name} ({reg_no}) today."

        # ✅ Safe check: ensure 'id' column exists (only once)
        cursor.execute("SHOW COLUMNS FROM attendance LIKE 'id'")
        column_exists = cursor.fetchone()
        if not column_exists:
            cursor.execute("ALTER TABLE attendance ADD COLUMN id INT AUTO_INCREMENT PRIMARY KEY FIRST")
            conn.commit()

        # Insert new attendance record
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        cursor.execute(
            "INSERT INTO attendance (registration_no, name, timestamp) VALUES (%s, %s, %s)",
            (reg_no, student_name, timestamp)
        )
        conn.commit()
        return f"✅ Attendance marked for {student_name} ({reg_no}) at {timestamp}"

    except mysql.connector.Error as e:
        return f"❌ Database Error: {e}"
    except ValueError:
        return f"⚠️ Invalid registration number format for '{name}'"
    finally:
        if conn.is_connected():
            cursor.close()
            conn.close()

# ---------- API ENDPOINT ----------
@app.route('/mark_attendance', methods=['POST'])
def mark_attendance():
    try:
        data = request.get_json()
        if 'image' not in data:
            return jsonify({"message": "No image received"}), 400

        image_data = data['image'].split(',')[1]
        image_bytes = base64.b64decode(image_data)
        np_arr = np.frombuffer(image_bytes, np.uint8)
        image = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

        results = model.process_image(image_rgb)
        if not results:
            return jsonify({"message": "No face detected"}), 200

        recognized_name = results[0]['name']
        if recognized_name == "Unknown":
            return jsonify({"message": "Unknown face - attendance not marked"}), 200

        msg = store_attendance_in_db(recognized_name)
        return jsonify({"message": msg}), 200

    except Exception as e:
        print("❌ Error:", e)
        return jsonify({"message": f"Error: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
