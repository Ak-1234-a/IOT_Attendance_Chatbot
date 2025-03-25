from flask import Flask, render_template, jsonify
import pandas as pd
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

def load_data():
    try:
        df = pd.read_csv('employees.csv', encoding='utf-8')
        return df.to_dict(orient='records')
    except Exception as e:
        print(f"Error loading CSV: {e}")
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