/* SESSION CHECK */
fetch("http://127.0.0.1:5000/check-session", {
    credentials: "include"
})
.then(res => res.json())
.then(data => {
    if (!data.logged_in || data.role !== "admin") {
        window.location.href = "../login.html";
    }
});

/* UI LOGIC */
function toggleMenu(element) {
    document.querySelectorAll('.submenu').forEach(menu => {
        if (menu !== element.nextElementSibling) {
            menu.style.display = 'none';
        }
    });

    const submenu = element.nextElementSibling;
    submenu.style.display =
        submenu.style.display === 'block' ? 'none' : 'block';
}

function showSection(id) {
    document.querySelectorAll(".section").forEach(sec => {
        sec.style.display = "none";
    });

    document.getElementById(id).style.display = "block";

    if (id === "studentList") {
        loadStudents();
    }

    if (id === "facultyList") {
        loadFaculty();
    }
}


showSection('dashboard');

/* LOGOUT */
function logout() {
    fetch("http://127.0.0.1:5000/logout", {
        credentials: "include"
    })
    .then(() => {
        window.location.href = "../login.html";
    });
}
