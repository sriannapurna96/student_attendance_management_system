function login() {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const role = document.getElementById("role").value;

    if (!username || !password) {
        alert("Please enter username and password");
        return;
    }

    if (role === "") {
        alert("Select a role");
        return;
    }

    fetch("http://127.0.0.1:5000/login", {
        method: "POST",
        credentials: "include", // very important for session cookie
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username,
            password,
            role
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === "success") {
            // Redirect based on role
            if (role === "admin") {
                location.href = "admin/dashboard.html";
            } else if (role === "faculty") {
                location.href = "faculty/dashboard.html";
            } else if (role === "student") {
                location.href = "student/dashboard.html";
            } else if (role === "parent") {
                location.href = "parent/dashboard.html";
            }
        } else {
            alert(data.message || "Login failed");
        }
    })
    .catch(() => {
        alert("Cannot connect to backend server");
    });
}

function togglePassword() {
    const pwd = document.getElementById("password");
    pwd.type = pwd.type === "password" ? "text" : "password";
}

function showSection(sectionId) {
    // hide all sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(sec => sec.style.display = 'none');

    // show selected section
    document.getElementById(sectionId).style.display = 'block';
}