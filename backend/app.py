from flask import Flask, request, jsonify, session, send_file
from flask_cors import CORS
import sqlite3
import csv
import os

app = Flask(__name__)
app.secret_key = "secret"
CORS(app, supports_credentials=True)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "database.db")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

# ================= INIT DB =================
def init_db():
    with get_db() as conn:
        cur = conn.cursor()

        # users table (for login)
        cur.execute("""
        CREATE TABLE IF NOT EXISTS users (
            username TEXT PRIMARY KEY,
            password TEXT NOT NULL,
            role TEXT NOT NULL
        )
        """)

        # students table
        cur.execute("""
        CREATE TABLE IF NOT EXISTS students (
            reg_no TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            department TEXT,
            parent_name TEXT,
            parent_contact TEXT
        )
        """)

        # faculty table
        cur.execute("""
        CREATE TABLE IF NOT EXISTS faculty (
            faculty_id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            subject TEXT,
            assigned_class TEXT
        )
        """)

        # attendance table
        cur.execute("""
        CREATE TABLE IF NOT EXISTS attendance (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            reg_no TEXT NOT NULL,
            date TEXT NOT NULL,
            status TEXT CHECK(status IN ('Present', 'Absent')) NOT NULL,
            FOREIGN KEY (reg_no) REFERENCES students(reg_no)
        )
        """)

        # default admin user
        cur.execute("""
        INSERT OR IGNORE INTO users (username, password, role)
        VALUES ('admin', 'admin', 'admin')
        """)

        conn.commit()

# call init once
init_db()

# ================= STUDENTS =================

@app.route("/admin/students")
def get_students():
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute("SELECT * FROM students")
        rows = cur.fetchall()
    return jsonify([dict(r) for r in rows])

@app.route("/admin/update-student/<reg_no>", methods=["PUT"])
def update_student(reg_no):
    data = request.get_json()
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute("""
        UPDATE students SET
        name=?, department=?, parent_name=?, parent_contact=?
        WHERE reg_no=?
        """, (
            data["name"],
            data["department"],
            data["parent_name"],
            data["parent_contact"],
            reg_no
        ))
        conn.commit()
    return jsonify({"msg": "Updated"})

@app.route("/admin/delete-student/<reg_no>", methods=["DELETE"])
def delete_student(reg_no):
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute("DELETE FROM students WHERE reg_no=?", (reg_no,))
        conn.commit()
    return jsonify({"msg": "Deleted"})

@app.route("/admin/upload-students", methods=["POST"])
def upload_students():
    file = request.files["file"]
    added = 0
    skipped = 0

    with get_db() as conn:
        cur = conn.cursor()
        reader = csv.reader(file.stream.read().decode("utf-8").splitlines())
        next(reader)

        for row in reader:
            try:
                cur.execute("INSERT INTO students VALUES (?,?,?,?,?)", row)
                added += 1
            except:
                skipped += 1

        conn.commit()

    return jsonify({"added": added, "skipped": skipped})

# ================= FACULTY =================

@app.route("/admin/faculty")
def get_faculty():
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute("SELECT * FROM faculty")
        rows = cur.fetchall()
    return jsonify([dict(r) for r in rows])

@app.route("/admin/update-faculty/<fid>", methods=["PUT"])
def update_faculty(fid):
    data = request.get_json()
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute("""
        UPDATE faculty SET
        name=?, subject=?, assigned_class=?
        WHERE faculty_id=?
        """, (
            data["name"],
            data["subject"],
            data["assigned_class"],
            fid
        ))
        conn.commit()
    return jsonify({"msg": "Updated"})

@app.route("/admin/delete-faculty/<fid>", methods=["DELETE"])
def delete_faculty(fid):
    with get_db() as conn:
        cur = conn.cursor()
        cur.execute("DELETE FROM faculty WHERE faculty_id=?", (fid,))
        conn.commit()
    return jsonify({"msg": "Deleted"})

@app.route("/admin/upload-faculty", methods=["POST"])
def upload_faculty():
    file = request.files["file"]
    added = 0
    skipped = 0

    with get_db() as conn:
        cur = conn.cursor()
        reader = csv.reader(file.stream.read().decode("utf-8").splitlines())
        next(reader)

        for row in reader:
            try:
                cur.execute("INSERT INTO faculty VALUES (?,?,?,?)", row)
                added += 1
            except:
                skipped += 1

        conn.commit()

    return jsonify({"added": added, "skipped": skipped})

# ================= HOME & AUTH =================

@app.route("/")
def home():
    return "Attendance Backend Running Successfully"

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

# ================= SESSION ROUTES =================

@app.route("/check-session")
def check_session():
    return jsonify({
        "logged_in": True,
        "role": "admin"
    })

@app.route("/logout")
def logout():
    return jsonify({"msg": "Logged out"})

if __name__ == "__main__":
    app.run(debug=True)
