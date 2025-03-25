const tableBody = document.getElementById('employeeTableBody');
const filterButtons = document.querySelectorAll('.filter-btn');

async function fetchEmployees(department = 'all') {
    try {
        const url = department === 'all' ? '/employees' : `/employees/${department}`;
        const response = await fetch(url);
        const data = await response.json();
        if (response.ok) {
            renderEmployees(data);
        } else {
            console.error(data.error || 'Error fetching employees');
        }
    } catch (error) {
        console.error('Error loading employee data:', error);
    }
}

function renderEmployees(employees) {
    tableBody.innerHTML = employees.map((employee, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>
                <div class="employee-info">
                    <div class="employee-initial">${employee.Employee.charAt(0)}</div>
                    <div class="employee-details">
                        <div class="employee-name">${employee.Employee}</div>
                    </div>
                </div>
            </td>
            <td>${employee.Role}</td>
            <td>
                <span class="department-badge ${employee.Department}">
                    ${employee.Department}
                </span>
            </td>
            <td>
                <div class="attendance-container">
                    <div class="attendance-bar">
                        <div class="attendance-progress" style="width: ${employee.Attendance}%"></div>
                    </div>
                    <span class="attendance-value">${employee.Attendance}%</span>
                </div>
            </td>
            <td>
                <span class="coin-value">🪙 ${employee.Coins}</span>
            </td>
        </tr>
    `).join('');
}

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        fetchEmployees(button.dataset.department);
    });
});

fetchEmployees();