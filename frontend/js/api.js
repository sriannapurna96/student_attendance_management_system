const BASE_URL = "http://127.0.0.1:5000";

// ADMIN: Add student
function addStudent() {
    fetch(`${BASE_URL}/admin/add-student`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            reg_no: document.getElementById("reg").value,
            name: document.getElementById("name").value,
            department: document.getElementById("dept").value
        })
    })
    .then(res => res.json())
    .then(data => alert(data.msg));
}

// FACULTY: Request department change
function requestChange() {
    fetch(`${BASE_URL}/faculty/request-change`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            faculty_id: 2,
            student_id: document.getElementById("sid").value,
            department: document.getElementById("newDept").value
        })
    })
    .then(res => res.json())
    .then(data => alert(data.msg));
}
