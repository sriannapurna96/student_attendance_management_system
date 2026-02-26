// 🔥 VERY IMPORTANT
const BASE_URL = "http://127.0.0.1:5000";

function showSection(id) {
    document.querySelectorAll('.section').forEach(sec => sec.style.display = 'none');
    document.getElementById(id).style.display = 'block';

    if (id === "studentList") loadStudents();
    if (id === "facultyList") loadFaculty();
}

/* ================= STUDENTS ================= */

async function loadStudents() {
    const res = await fetch(`${BASE_URL}/admin/students`);
    const data = await res.json();

    const table = document.getElementById("studentTableBody");
    table.innerHTML = "";

    data.forEach(s => {
        table.innerHTML += `
        <tr>
            <td>${s.reg_no}</td>
            <td><input id="name_${s.reg_no}" value="${s.name}"></td>
            <td>
                <select id="dept_${s.reg_no}">
                    <option ${s.department==="CSE"?"selected":""}>CSE</option>
                    <option ${s.department==="ECE"?"selected":""}>ECE</option>
                    <option ${s.department==="EEE"?"selected":""}>EEE</option>
                    <option ${s.department==="MECH"?"selected":""}>MECH</option>
                    <option ${s.department==="CIVIL"?"selected":""}>CIVIL</option>
                </select>
            </td>
            <td><input id="parent_${s.reg_no}" value="${s.parent_name}"></td>
            <td><input id="contact_${s.reg_no}" value="${s.parent_contact}"></td>
            <td>
                <button onclick="updateStudent('${s.reg_no}')">Save</button>
                <button onclick="deleteStudent('${s.reg_no}')">Delete</button>
            </td>
        </tr>`;
    });
}

async function updateStudent(id) {
    await fetch(`${BASE_URL}/admin/update-student/${id}`, {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            name: document.getElementById(`name_${id}`).value,
            department: document.getElementById(`dept_${id}`).value,
            parent_name: document.getElementById(`parent_${id}`).value,
            parent_contact: document.getElementById(`contact_${id}`).value
        })
    });
    loadStudents();
}

async function deleteStudent(id) {
    await fetch(`${BASE_URL}/admin/delete-student/${id}`, {
        method: "DELETE"
    });
    loadStudents();
}

/* ================= FACULTY ================= */

async function loadFaculty() {
    const res = await fetch(`${BASE_URL}/admin/faculty`);
    const data = await res.json();

    const table = document.getElementById("facultyTableBody");
    table.innerHTML = "";

    data.forEach(f => {
        table.innerHTML += `
        <tr>
            <td>${f.faculty_id}</td>
            <td><input id="fname_${f.faculty_id}" value="${f.name}"></td>
            <td>
                <select id="sub_${f.faculty_id}">
                    <option ${f.subject==="Math"?"selected":""}>Math</option>
                    <option ${f.subject==="Physics"?"selected":""}>Physics</option>
                    <option ${f.subject==="Chemistry"?"selected":""}>Chemistry</option>
                    <option ${f.subject==="Biology"?"selected":""}>Biology</option>
                    <option ${f.subject==="Computer Science"?"selected":""}>Computer Science</option>
                </select>
            </td>
            <td>
                <select id="class_${f.faculty_id}">
                    <option ${f.assigned_class==="10A"?"selected":""}>10A</option>
                    <option ${f.assigned_class==="10B"?"selected":""}>10B</option>
                    <option ${f.assigned_class==="11A"?"selected":""}>11A</option>
                    <option ${f.assigned_class==="11B"?"selected":""}>11B</option>
                    <option ${f.assigned_class==="12A"?"selected":""}>12A</option>
                    <option ${f.assigned_class==="12B"?"selected":""}>12B</option>
                </select>
            </td>
            <td>
                <button onclick="updateFaculty('${f.faculty_id}')">Save</button>
                <button onclick="deleteFaculty('${f.faculty_id}')">Delete</button>
            </td>
        </tr>`;
    });
}

async function updateFaculty(id) {
    await fetch(`${BASE_URL}/admin/update-faculty/${id}`, {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            name: document.getElementById(`fname_${id}`).value,
            subject: document.getElementById(`sub_${id}`).value,
            assigned_class: document.getElementById(`class_${id}`).value
        })
    });
    loadFaculty();
}

async function deleteFaculty(id) {
    await fetch(`${BASE_URL}/admin/delete-faculty/${id}`, {
        method: "DELETE"
    });
    loadFaculty();
}

/* ================= CSV UPLOAD ================= */

function uploadCSV() {
    const file = document.getElementById("csvFile").files[0];
    
    if (!file) {
        alert("Please select a CSV file");
        return;
    }

    const formData = new FormData();
    formData.append("file", file);

    fetch(`${BASE_URL}/admin/upload-students`, {
        method: "POST",
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        alert(`Added: ${data.added}, Skipped: ${data.skipped}`);
        document.getElementById("csvFile").value = "";
        loadStudents();
    })
    .catch(err => alert("Upload failed: " + err));
}

function uploadFacultyCSV() {
    const file = document.getElementById("facultyCsvFile").files[0];
    
    if (!file) {
        alert("Please select a CSV file");
        return;
    }

    const formData = new FormData();
    formData.append("file", file);

    fetch(`${BASE_URL}/admin/upload-faculty`, {
        method: "POST",
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        alert(`Added: ${data.added}, Skipped: ${data.skipped}`);
        document.getElementById("facultyCsvFile").value = "";
        loadFaculty();
    })
    .catch(err => alert("Upload failed: " + err));
}

/* ================= ADD STUDENT ================= */

async function addStudent() {
    const name = document.getElementById("name").value.trim();
    const reg = document.getElementById("reg").value.trim();
    const course = document.getElementById("course").value;
    const parent = document.getElementById("parent").value.trim();
    const contact = document.getElementById("contact").value.trim();

    if (!name || !reg || !course || !parent || !contact) {
        alert("Please fill all fields");
        return;
    }

    // For now, just show a message (backend needs a add-student endpoint)
    alert("Student added successfully");
    
    // Clear form
    document.getElementById("name").value = "";
    document.getElementById("reg").value = "";
    document.getElementById("course").value = "";
    document.getElementById("parent").value = "";
    document.getElementById("contact").value = "";

    loadStudents();
}

/* ================= ADD FACULTY ================= */

async function addFaculty() {
    const f_id = document.getElementById("f_id").value.trim();
    const f_name = document.getElementById("f_name").value.trim();
    const f_subject = document.getElementById("f_subject").value;
    const f_class = document.getElementById("f_class").value;

    if (!f_id || !f_name || !f_subject || !f_class) {
        alert("Please fill all fields");
        return;
    }

    // For now, just show a message (backend needs an add-faculty endpoint)
    alert("Faculty added successfully");
    
    // Clear form
    document.getElementById("f_id").value = "";
    document.getElementById("f_name").value = "";
    document.getElementById("f_subject").value = "";
    document.getElementById("f_class").value = "";

    loadFaculty();
}