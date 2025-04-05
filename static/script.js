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

let confettiInterval;

function startConfettiRain() {
  confettiInterval = setInterval(() => {
    confetti({ particleCount: 50, spread: 100, origin: { x: 0, y: 0.6 } });
    confetti({ particleCount: 50, spread: 100, origin: { x: 1, y: 0.6 } });
  }, 500); // Change interval for faster/slower rain
}

function stopConfettiRain() {
  clearInterval(confettiInterval);
}


const shownPopups = new Set();
function renderTable(data) {
  const tbody = document.getElementById("employeeTableBody");
  tbody.innerHTML = "";

  const sorted = [...data].sort((a, b) => b.Attendance - a.Attendance);
  const allDepartments = [...new Set(employees.map(e => e.Department))];

  sorted.forEach(async (emp, idx) => {
    const row = document.createElement("tr");

    const trophyIcon = ["🥇", "🥈", "🥉"][idx] || `${idx + 1}`;
    const nameInitials = getInitials(emp.Employee);

    const presentDays = (emp.Attendance / 100) * 30;
    const weeklyProgress = Math.min((presentDays % 7) / 7 * 100, 100);
    const deptIndex = allDepartments.indexOf(emp.Department);
    const deptClass = `department-${deptIndex % 10}`;
    if (Math.round(emp.Attendance) === 100 && !shownPopups.has(emp.Employee)) {
      shownPopups.add(emp.Employee);
      try {
        const res = await fetch("/motivate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: emp.Employee })
        });
        const data = await res.json();
    
        Swal.fire({
          title: "🎉 Perfect Attendance!",
          html: `<strong>${emp.Employee}</strong> has 100% attendance!<br><em>"${data.message}"</em>`,
          icon: "success",
          timer: 8000,
          showConfirmButton: true
        });
    
        // ✅ 1. Speak the motivational message first
        const synth = window.speechSynthesis;
        const utter = new SpeechSynthesisUtterance(`${emp.Employee} has 100 percent attendance! Here's a message for you: ${data.message}`);
        utter.lang = "en-US";
        utter.rate = 1;
        synth.speak(utter);
    
        // ✅ 2. After speech ends, THEN play music & confetti
        utter.onend = async () => {
          try {
            const audioRes = await fetch("/motivational-bgm");
            const blob = await audioRes.blob();
            const url = URL.createObjectURL(blob);
            const finalAudio = new Audio(url);
    
            // ✨ Start confetti AFTER TTS
            startConfettiRain();
    
            finalAudio.play();
            finalAudio.onended = () => {
              stopConfettiRain(); // ✅ Confetti stops when actual BGM ends
            };
          } catch (e) {
            console.error("BGM error:", e);
          }
        };
    
      } catch (err) {
        console.error("Motivation fetch error:", err);
      }
    }
    

    row.innerHTML = `
      <td>${trophyIcon}</td>
      <td>
        <div class="employee-info">
          <div class="employee-initial">${nameInitials}</div>
          <div class="employee-details">
            <span class="employee-name">${emp.Employee}</span>
            <div class="weekly-progress-bar">
              <div class="progress" style="width: ${weeklyProgress.toFixed(2)}%;"></div>
            </div>
          </div>
        </div>
      </td>
      <td>${emp.Role}</td>
      <td><span class="department-badge ${deptClass}">${emp.Department}</span></td>
      <td>
        <div class="attendance-container">
          <div class="attendance-bar">
            <div class="attendance-progress" style="width: ${emp.Attendance.toFixed(2)}%;"></div>
          </div>
          <span class="attendance-value">${emp.Attendance.toFixed(2)}%</span>
        </div>
      </td>
      <td><span class="coin-icon">🪙</span> ${emp.Coins}</td>
    `;

    tbody.appendChild(row);
  });
}

function setupDarkModeToggle() {
  const toggle = document.getElementById("darkModeToggle");
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

    // Update last refreshed time
    const now = new Date();
    document.getElementById("lastUpdated").textContent = 
      `Last refreshed: ${now.toLocaleString()}`;
  } catch (err) {
    console.error("Error fetching employees:", err);
  }
}


fetchEmployees();
setInterval(fetchEmployees, 10000);
