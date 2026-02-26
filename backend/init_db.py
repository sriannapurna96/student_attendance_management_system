from flask import Flask, request, jsonify, session, send_file
from flask_cors import CORS
import sqlite3
import os
from datetime import datetime

# ================= APP SETUP =================
app = Flask(__name__)
app.secret_key = "attendance_secret"
CORS(app, supports_credentials=True)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "database.db")

# ================= DATABASE CONNECTION =================
def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

# ================= INITIALIZE DATABASE =================
def init_db():
    with get_db() as conn:
        cur = conn.cursor()

        # USERS TABLE
        cur.execute("""
        CREATE TABLE IF NOT EXISTS users (
            username TEXT PRIMARY KEY,
            password TEXT NOT NULL,
            role TEXT NOT NULL
        )
        """)

        # STUDENTS TABLE
        cur.execute("""
        CREATE TABLE IF NOT EXISTS students (
            reg_no TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            department TEXT,
            parent_name TEXT,
            parent_contact TEXT
        )
        """)

        # FACULTY TABLE
        cur.execute("""
        CREATE TABLE IF NOT EXISTS faculty (
            faculty_id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            subject TEXT,
            assigned_class TEXT
        )
        """)

        # ATTENDANCE TABLE (NEW)
        cur.execute("""
        CREATE TABLE IF NOT EXISTS attendance (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            reg_no TEXT NOT NULL,
            date TEXT NOT NULL,
            status TEXT CHECK(status IN ('Present', 'Absent')) NOT NULL,
            FOREIGN KEY (reg_no) REFERENCES students(reg_no)
        )
        """)

        # DEFAULT ADMIN USER
        cur.execute("""
        INSERT OR IGNORE INTO users (username, password, role)
        VALUES ('admin', 'admin', 'admin')
        """)

        conn.commit()

# Initialize database at startup
init_db()

# ================= HOME ROUTE =================
@app.route("/")
def home():
    return "Attendance Backend Running Successfully"

# ================= LOGIN =================
@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")
    role = data.get("role")

    with get_db() as conn:
        cur = conn.cursor()
        cur.execute("SELECT password, role FROM users WHERE username=?", (username,))
        user = cur.fetchone()

    if not user:
        return jsonify({"status": "error", "message": "Invalid username"}), 400

    if password != user["password"]:
        return jsonify({"status": "error", "message": "Invalid password"}), 400

    if role != user["role"]:
        return jsonify({"status": "error", "message": "Wrong role selected"}), 400

    session["username"] = username
    session["role"] = role

    return jsonify({"status": "success", "role": role})

# ================= RUN SERVER =================
if __name__ == "__main__":
    app.run(debug=True)