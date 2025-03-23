import cv2
import numpy as np

# ✅ Load Haarcascade Face Detector
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")

def recognize_faces(frame, model):
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, 1.3, 5)

    emotion_detected = "Neutral"

    for (x, y, w, h) in faces:
        face_img = gray[y:y+h, x:x+w]
        face_img = cv2.resize(face_img, (48, 48))
        face_img = face_img / 255.0
        face_img = face_img.reshape(1, 48, 48, 1)

        prediction = model.predict(face_img)
        emotion_detected = ["Angry", "Disgust", "Fear", "Happy", "Neutral", "Sad", "Surprise"][np.argmax(prediction)]

        cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 255, 0), 2)
        cv2.putText(frame, emotion_detected, (x, y-10), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 0, 0), 2)

    return frame, emotion_detected
