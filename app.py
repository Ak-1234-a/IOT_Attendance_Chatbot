from urllib.parse import quote_plus  # Add this at the top with other imports
from flask import Flask, render_template, jsonify, request, Response
from flask_cors import CORS
from pymongo import MongoClient
import requests
import os

app = Flask(__name__)
CORS(app)


# Load environment variables
raw_password = os.environ.get("MONGODB_PASSWORD", "your_default_password")
MONGODB_PASSWORD = quote_plus(raw_password)  # Escape special characters
HUGGINGFACE_API_KEY = os.environ.get("HUGGINGFACE_API_KEY", "your_default_hf_key")

# MongoDB Remote Connection (MongoDB Atlas)
MONGO_URI = f"mongodb+srv://arun:{MONGODB_PASSWORD}@iotapp.ccch7ff.mongodb.net/?retryWrites=true&w=majority&appName=IOTAPP"

client = MongoClient(MONGO_URI)
db = client["arun"]
collection = db["employees"]

TOTAL_WORKING_DAYS = 30

# Hugging Face API Configuration
HUGGINGFACE_API_URL = "https://api-inference.huggingface.co/models/google/flan-t5-large"
HUGGINGFACE_AUDIO_API_URL = "https://api-inference.huggingface.co/models/facebook/musicgen-small"

headers = {
    "Authorization": f"Bearer {HUGGINGFACE_API_KEY}",
    "Content-Type": "application/json"
}


def load_data():
    try:
        data = list(collection.find({}, {"_id": 0}))
        formatted_data = []
        for emp in data:
            present = emp.get("present_days", 0)
            attendance_percent = (present / TOTAL_WORKING_DAYS) * 100
            formatted_data.append({
                "Employee": emp.get("name", "Unknown"),
                "Role": emp.get("role", "Employee"),
                "Department": emp.get("department", "General"),
                "Attendance": round(attendance_percent),
                "Coins": present * 10
            })
        return formatted_data
    except Exception as e:
        print(f"❌ MongoDB fetch error: {e}")
        return []


@app.route('/')
def home():
    return render_template('index.html')


@app.route('/employees')
def get_employees():
    data = load_data()
    return jsonify(data)


@app.route('/employees/<string:department>')
def get_department_employees(department):
    data = load_data()
    filtered_data = [emp for emp in data if emp['Department'].strip().lower() == department.strip().lower()]
    if not filtered_data:
        return jsonify({"error": "Department not found"}), 404
    return jsonify(filtered_data)


@app.route('/motivate', methods=["POST"])
def generate_motivation():
    content = request.json
    name = content.get("name", "Employee")
    prompt = f"Create a short, cheerful motivational message with emojis for an employee named {name} who achieved 100% attendance this month."

    try:
        payload = {
            "inputs": prompt,
            "parameters": {
                "max_length": 100,
                "temperature": 0.9,
                "top_k": 50,
                "do_sample": True
            }
        }

        response = requests.post(HUGGINGFACE_API_URL, headers=headers, json=payload)

        if response.status_code == 200:
            generated_text = response.json()[0]['generated_text']
            return jsonify({"message": generated_text})
        else:
            print("⚠️ Hugging Face API error:", response.text)
            return jsonify({"message": f"Keep going strong, {name}! You’re a star!"})
    except Exception as e:
        print(f"❌ Hugging Face request error: {e}")
        return jsonify({"message": f"Keep going strong, {name}! You’re a star!"})


@app.route("/motivational-bgm")
def motivational_bgm():
    try:
        prompt = "Play an inspiring and uplifting short motivational music clip with positive energy."
        payload = {"inputs": prompt}

        audio_response = requests.post(HUGGINGFACE_AUDIO_API_URL, headers=headers, json=payload, stream=True)

        if audio_response.status_code == 200:
            content_type = audio_response.headers.get("Content-Type", "audio/mpeg")
            return Response(audio_response.iter_content(chunk_size=1024), content_type=content_type)
        else:
            print("🎵 BGM fetch failed:", audio_response.text)
            return Response(status=500)
    except Exception as e:
        print("❌ Error fetching BGM:", e)
        return Response(status=500)


if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=True, host='0.0.0.0', port=port)
