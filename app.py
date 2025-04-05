from flask import Flask, render_template, jsonify
from flask_cors import CORS
from pymongo import MongoClient

app = Flask(__name__)
CORS(app)

# MongoDB Connection
client = MongoClient("mongodb://localhost:27017/")
db = client["arun"]
collection = db["employees"]

TOTAL_WORKING_DAYS = 30

def load_data():
    try:
        data = list(collection.find({}, {"_id": 0, "__v": 0}))
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

if __name__ == '__main__':
    app.run(debug=True)
