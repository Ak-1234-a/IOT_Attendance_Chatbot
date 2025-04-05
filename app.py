from flask import Flask, render_template, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient
import requests
import os

app = Flask(__name__)
CORS(app)

# MongoDB Connection
client = MongoClient("mongodb://localhost:27017/")
db = client["arun"]
collection = db["employees"]

TOTAL_WORKING_DAYS = 30

# Hugging Face API Configuration
HUGGINGFACE_API_URL = "https://api-inference.huggingface.co/models/google/flan-t5-large"
HUGGINGFACE_API_KEY = "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"  # 🔐 Replace this with your actual API key

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


if __name__ == '__main__':
    app.run(debug=True)
