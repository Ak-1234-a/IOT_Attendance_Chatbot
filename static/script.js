const apiURL = "/employees";
let employees = [];

function getInitials(name) {
  return name
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase();
}

function createDepartmentButtons(departments) {
  const container = document.getElementById("departmentFilters");
  container.innerHTML = "";

  const allBtn = document.createElement("button");
  allBtn.className = "filter-btn active";
  allBtn.textContent = "All Employees";
  allBtn.dataset.department = "all";
  container.appendChild(allBtn);

  departments.forEach(dept => {
    const btn = document.createElement("button");
    btn.className = "filter-btn";
    btn.textContent = dept;
    btn.dataset.department = dept;
    container.appendChild(btn);
  });

  addFilterListeners();
}

function addFilterListeners() {
  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const dept = btn.dataset.department;
      const filtered = dept === "all" ? employees : employees.filter(e => e.Department === dept);
      renderTable(filtered);
    });
  });
}
function renderTable(data) {
    const tbody = document.getElementById("employeeTableBody");
    tbody.innerHTML = "";
  
    const sorted = [...data].sort((a, b) => b.Attendance - a.Attendance);
    const allDepartments = [...new Set(employees.map(e => e.Department))];
  
    sorted.forEach((emp, idx) => {
      const row = document.createElement("tr");
  
      const trophyIcon = ["🥇", "🥈", "🥉"][idx] || `${idx + 1}`;
      const nameInitials = getInitials(emp.Employee);
      const weeklyProgress = Math.min(emp.Attendance % 10 * 10, 100);
      const deptIndex = allDepartments.indexOf(emp.Department);
      const deptClass = `department-${deptIndex % 10}`; // reuse colors cyclically if > 10
  
      if (emp.Attendance === 100) {
        Swal.fire({
          title: "🎉 Perfect Attendance!",
          text: `${emp.Employee} has 100% attendance!`,
          icon: "success",
          timer: 2500,
          showConfirmButton: false
        });
      }
  
      row.innerHTML = `
        <td>${trophyIcon}</td>
        <td>
          <div class="employee-info">
            <div class="employee-initial">${nameInitials}</div>
            <div class="employee-details">
              <span class="employee-name">${emp.Employee}</span>
              <div class="weekly-progress-bar">
                <div class="progress" style="width: ${weeklyProgress}%;"></div>
              </div>
            </div>
          </div>
        </td>
        <td>${emp.Role}</td>
        <td><span class="department-badge ${deptClass}">${emp.Department}</span></td>
        <td>
          <div class="attendance-container">
            <div class="attendance-bar">
              <div class="attendance-progress" style="width: ${emp.Attendance}%;"></div>
            </div>
            <span class="attendance-value">${emp.Attendance}%</span>
          </div>
        </td>
        <td><span class="coin-icon">🪙</span> ${emp.Coins}</td>
      `;
  
      tbody.appendChild(row);
    });
  }
  
  function setupDarkModeToggle() {
    const toggle = document.getElementById("darkModeToggle");
  
    // Load saved theme
    const darkMode = localStorage.getItem("darkMode") === "true";
    document.body.classList.toggle("dark-mode", darkMode);
    toggle.checked = darkMode;
  
    toggle.addEventListener("change", () => {
      document.body.classList.toggle("dark-mode", toggle.checked);
      localStorage.setItem("darkMode", toggle.checked);
    });
  }
  
  window.onload = setupDarkModeToggle;
  
async function fetchEmployees() {
  try {
    const res = await fetch(apiURL);
    employees = await res.json();
    const departments = [...new Set(employees.map(e => e.Department))];
    createDepartmentButtons(departments);
    renderTable(employees);
  } catch (err) {
    console.error("Error fetching employees:", err);
  }
}

fetchEmployees();
setInterval(fetchEmployees, 10000); // auto refresh every 10s
