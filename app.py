from flask import Flask, render_template, Response, request, jsonify
import cv2
import numpy as np
from tensorflow.keras.models import load_model

app = Flask(__name__)

# ✅ Load Model with Safe Mode Disabled
model = load_model("model/emotion_model.keras", safe_mode=False)
print("✅ Model Loaded Successfully!")

# ✅ Emotion Classes
emotion_classes = ["Angry", "Disgust", "Fear", "Happy", "Sad", "Surprise", "Neutral"]

# ✅ Initialize Video Capture
video_capture = cv2.VideoCapture(0)

def detect_emotions(frame):
    """Detect faces and emotions"""
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
    faces = face_cascade.detectMultiScale(gray, 1.3, 5)

    detected_emotion = "No Face"
    for (x, y, w, h) in faces:
        face = gray[y:y+h, x:x+w]
        face = cv2.resize(face, (48, 48)).reshape(1, 48, 48, 1) / 255.0
        prediction = model.predict(face, verbose=0)
        detected_emotion = emotion_classes[np.argmax(prediction)]

        # ✅ Draw Emotion on Face
        cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 255, 0), 2)
        cv2.putText(frame, detected_emotion, (x, y-10), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 0, 0), 2)

    return detected_emotion

def generate_frames():
    """Generate real-time frames"""
    while True:
        success, frame = video_capture.read()
        if not success:
            break

        detect_emotions(frame)

        _, buffer = cv2.imencode(".jpg", frame)
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/check_emotion', methods=['GET'])
def check_emotion():
    """API to get the latest detected emotion"""
    return jsonify({"emotion": detect_emotions(video_capture.read()[1])})

if __name__ == '__main__':
    app.run(debug=True)
