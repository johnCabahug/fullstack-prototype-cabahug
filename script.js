// ================= STORAGE =================
const STORAGE_KEY = "ipt_demo_v1";

const SEED_ADMIN = {
  id: 1,
  firstName: "Admin",
  lastName: "User",
  email: "admin@example.com",
  password: "Password123!",
  verified: true,
  role: "admin",
};

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (
        parsed &&
        Array.isArray(parsed.users) &&
        Array.isArray(parsed.departments)
      ) {
        window.db = parsed;
        // Always ensure admin account exists
        ensureAdminExists();
        return;
      }
    }
  } catch (e) {
    console.warn("Storage corrupt or missing, seeding defaults.", e);
  }

  // Seed default data
  window.db = {
    users: [{ ...SEED_ADMIN }],
    departments: [
      { id: 1, name: "Engineering", description: "Software team" },
      { id: 2, name: "HR", description: "Human Resources" },
    ],
    employees: [],
    requests: [],
  };

  saveToStorage();
}

function ensureAdminExists() {
  const adminExists = window.db.users.some((u) => u.email === SEED_ADMIN.email);
  if (!adminExists) {
    window.db.users.unshift({ ...SEED_ADMIN });
    saveToStorage();
  }
}

function saveToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(window.db));
  } catch (e) {
    console.error("Failed to save to localStorage:", e);
  }
}

// ================= SECTION MANAGEMENT =================
const sections = {
  home: document.getElementById("homeSection"),
  register: document.getElementById("registerSection"),
  verify: document.getElementById("verifySection"),
  login: document.getElementById("loginSection"),
  dashboard: document.getElementById("dashboardSection"),
  profile: document.getElementById("profileSection"),
  accounts: document.getElementById("accountsSection"),
  departments: document.getElementById("departmentsSection"),
  employees: document.getElementById("employeesSection"),
  requests: document.getElementById("requestsSection"),
};

const navLinks = document.getElementById("navLinks");

// Show section
function showSection(sectionName) {
  Object.values(sections).forEach((s) => s.classList.remove("active"));
  sections[sectionName].classList.add("active");
  window.scrollTo(0, 0);
}

// ================= NAVIGATION =================
function setupNavigationHandlers() {
  document
    .querySelectorAll(".nav-login")
    .forEach((btn) =>
      btn.addEventListener("click", () => showSection("login")),
    );

  document
    .querySelectorAll(".nav-register")
    .forEach((btn) =>
      btn.addEventListener("click", () => showSection("register")),
    );

  document
    .querySelectorAll(".nav-logout")
    .forEach((btn) => btn.addEventListener("click", logout));
}

// Update nav UI
function updateNavigation() {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const isAdmin = localStorage.getItem("isAdmin") === "true";
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const nav = document.getElementById("navLinks");
  if (!nav) return;

  if (isLoggedIn && currentUser) {
    if (isAdmin) {
      nav.innerHTML = `
        <div class="nav-dropdown">
          <a href="#" class="nav-dropdown-toggle">Admin &#9660;</a>
          <div class="nav-dropdown-menu">
            <a href="#" onclick="window.location.hash='#/profile';return false;">Profile</a>
            <a href="#" onclick="goToAdminTab('employees');return false;">Employees</a>
            <a href="#" onclick="goToAdminTab('accounts');return false;">Accounts</a>
            <a href="#" onclick="goToAdminTab('departments');return false;">Departments</a>
            <a href="#" onclick="window.location.hash='#/requests';return false;">My Requests</a>
            <a href="#" onclick="logout();return false;" style="color:#e74c3c;">Logout</a>
          </div>
        </div>
      `;
    } else {
      nav.innerHTML = `
        <div class="nav-dropdown">
          <a href="#" class="nav-dropdown-toggle">User &#9660;</a>
          <div class="nav-dropdown-menu">
            <a href="#" onclick="window.location.hash='#/profile';return false;">Profile</a>
            <a href="#" onclick="window.location.hash='#/requests';return false;">My Requests</a>
            <a href="#" onclick="logout();return false;" style="color:#e74c3c;">Logout</a>
          </div>
        </div>
      `;
    }
  } else {
    nav.innerHTML = `
      <a href="javascript:void(0);" class="nav-login">Login</a>
      <a href="javascript:void(0);" class="nav-register">Register</a>
    `;
  }

  setupNavigationHandlers();
}

// ================= HOME =================
document.getElementById("getStartedBtn").addEventListener("click", () => {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  showSection(isLoggedIn ? "dashboard" : "register");
});

// ================= PROFILE =================
function renderProfile() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser) {
    showSection("login");
    return;
  }

  const profileContent = document.getElementById("profileContent");
  profileContent.innerHTML = `
    <p style="margin:0.4rem 0;"><strong>Name:</strong> ${currentUser.firstName} ${currentUser.lastName}</p>
    <p style="margin:0.4rem 0;"><strong>Email:</strong> ${currentUser.email}</p>
    <p style="margin:0.4rem 0;"><strong>Role:</strong> ${currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}</p>
    <div style="margin-top:1rem;">
      <button class="btn btn-primary" onclick="alert('Edit Profile feature coming soon!')">Edit Profile</button>
    </div>
  `;
}

// ================= HASH ROUTING =================
function handleHash() {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const isAdmin = localStorage.getItem("isAdmin") === "true";
  const hash = window.location.hash;

  if (hash === "#/profile") {
    if (!isLoggedIn) {
      window.location.hash = "";
      showSection("login");
      return;
    }
    renderProfile();
    showSection("profile");
  } else if (hash === "#/accounts") {
    if (!isLoggedIn || !isAdmin) {
      window.location.hash = "";
      showSection("dashboard");
      return;
    }
    renderAccountsList();
    showSection("accounts");
  } else if (hash === "#/departments") {
    if (!isLoggedIn || !isAdmin) {
      window.location.hash = "";
      showSection("dashboard");
      return;
    }
    renderDepartmentsTable();
    showSection("departments");
  } else if (hash === "#/employees") {
    if (!isLoggedIn || !isAdmin) {
      window.location.hash = "";
      showSection("dashboard");
      return;
    }
    renderEmployeesTable();
    showSection("employees");
  } else if (hash === "#/requests") {
    if (!isLoggedIn) {
      window.location.hash = "";
      showSection("login");
      return;
    }
    renderRequestsTable();
    showSection("requests");
  }
}

window.addEventListener("hashchange", handleHash);

// Navigate to a specific admin section
function goToAdminTab(tabName) {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const isAdmin = localStorage.getItem("isAdmin") === "true";
  if (!isLoggedIn || !isAdmin) return;
  window.location.hash = `#/${tabName}`;
}

// ================= REGISTER =================
document.getElementById("registerForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const newUser = {
    id: Date.now(),
    firstName: firstName.value,
    lastName: lastName.value,
    email: regEmail.value,
    password: regPassword.value,
    verified: false,
    role: "user",
  };

  // Check for duplicate email
  const existing = window.db.users.find((u) => u.email === newUser.email);
  if (existing) {
    alert("An account with this email already exists.");
    return;
  }

  window.db.users.push(newUser);
  saveToStorage(); // persist after create

  localStorage.setItem("pendingEmail", newUser.email);
  sentEmail.textContent = newUser.email;
  showSection("verify");

  registerForm.reset();
});

cancelRegister.addEventListener("click", () => showSection("home"));

// ================= VERIFY =================
simulateVerify.addEventListener("click", () => {
  const pendingEmail = localStorage.getItem("pendingEmail");
  const user = window.db.users.find((u) => u.email === pendingEmail);

  if (user) {
    user.verified = true;
    saveToStorage(); // persist after update
  }

  verifiedAlert.style.display = "block";
  loginEmail.value = pendingEmail || "";

  showSection("login");
});

goToLoginFromVerify.addEventListener("click", () => showSection("login"));

// ================= LOGIN =================
loginForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const email = loginEmail.value;
  const password = loginPassword.value;

  const user = window.db.users.find((u) => u.email === email);

  console.log("[Login] Attempting:", email);
  console.log(
    "[Login] DB users:",
    window.db.users.map((u) => u.email),
  );

  if (!user)
    return alert(`No account found for "${email}". Please register first.`);
  if (!user.verified) return alert("Email not verified. Please verify first.");
  if (user.password !== password) return alert("Incorrect password.");

  // LOGIN SUCCESS
  localStorage.setItem("isLoggedIn", "true");

  const isAdmin = user.role === "admin";
  localStorage.setItem("isAdmin", isAdmin ? "true" : "false");

  localStorage.setItem(
    "currentUser",
    JSON.stringify({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    }),
  );

  applyAuthClasses();

  userName.textContent = `${user.firstName} ${user.lastName}`;

  updateNavigation();
  renderProfile();
  showSection("profile");

  loginForm.reset();
  verifiedAlert.style.display = "none";
});

cancelLogin.addEventListener("click", () => showSection("home"));

// ================= ADMIN PANEL =================

// ========== A. ACCOUNTS ==========
function renderAccountsList() {
  const wrap = document.getElementById("accountsTableWrap");
  const users = window.db.users;

  if (!users.length) {
    wrap.innerHTML = `<p style="color:#666;">No accounts found.</p>`;
    return;
  }

  wrap.innerHTML = `
    <table class="admin-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Role</th>
          <th>Verified</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${users
          .map(
            (u) => `
          <tr>
            <td>${u.firstName} ${u.lastName}</td>
            <td>${u.email}</td>
            <td><span class="badge badge-${u.role}">${u.role}</span></td>
            <td><span class="badge ${u.verified ? "badge-yes" : "badge-no"}">${u.verified ? "✓ Yes" : "✗ No"}</span></td>
            <td>
              <div class="action-btns">
                <button class="btn btn-primary" onclick="openEditAccount(${u.id})">Edit</button>
                <button class="btn btn-secondary" onclick="resetPassword(${u.id})">Reset PW</button>
                <button class="btn btn-danger" onclick="deleteAccount(${u.id})">Delete</button>
              </div>
            </td>
          </tr>
        `,
          )
          .join("")}
      </tbody>
    </table>
  `;
}

// Show/hide account form
document.getElementById("addAccountBtn").addEventListener("click", () => {
  document.getElementById("accountFormTitle").textContent = "Add Account";
  document.getElementById("accountEditId").value = "";
  document.getElementById("accFirstName").value = "";
  document.getElementById("accLastName").value = "";
  document.getElementById("accEmail").value = "";
  document.getElementById("accPassword").value = "";
  document.getElementById("accRole").value = "user";
  document.getElementById("accVerified").checked = false;
  document.getElementById("accPassword").placeholder = "Required";
  document.getElementById("accountFormWrap").style.display = "block";
});

document.getElementById("cancelAccountBtn").addEventListener("click", () => {
  document.getElementById("accountFormWrap").style.display = "none";
});

function openEditAccount(id) {
  const user = window.db.users.find((u) => u.id === id);
  if (!user) return;

  document.getElementById("accountFormTitle").textContent = "Edit Account";
  document.getElementById("accountEditId").value = id;
  document.getElementById("accFirstName").value = user.firstName;
  document.getElementById("accLastName").value = user.lastName;
  document.getElementById("accEmail").value = user.email;
  document.getElementById("accPassword").value = "";
  document.getElementById("accPassword").placeholder =
    "Leave blank to keep current";
  document.getElementById("accRole").value = user.role;
  document.getElementById("accVerified").checked = user.verified;
  document.getElementById("accountFormWrap").style.display = "block";
  document
    .getElementById("accountFormWrap")
    .scrollIntoView({ behavior: "smooth" });
}

document.getElementById("saveAccountBtn").addEventListener("click", () => {
  const editId = document.getElementById("accountEditId").value;
  const firstName = document.getElementById("accFirstName").value.trim();
  const lastName = document.getElementById("accLastName").value.trim();
  const email = document.getElementById("accEmail").value.trim();
  const password = document.getElementById("accPassword").value;
  const role = document.getElementById("accRole").value;
  const verified = document.getElementById("accVerified").checked;

  if (!firstName || !lastName || !email)
    return alert("First name, last name, and email are required.");

  if (editId) {
    // UPDATE
    const user = window.db.users.find((u) => u.id === Number(editId));
    if (!user) return;

    // Check email uniqueness (exclude self)
    const duplicate = window.db.users.find(
      (u) => u.email === email && u.id !== user.id,
    );
    if (duplicate) return alert("Another account already uses that email.");

    user.firstName = firstName;
    user.lastName = lastName;
    user.email = email;
    user.role = role;
    user.verified = verified;
    if (password) user.password = password;
  } else {
    // CREATE
    if (!password) return alert("Password is required for new accounts.");
    const duplicate = window.db.users.find((u) => u.email === email);
    if (duplicate) return alert("An account with that email already exists.");

    window.db.users.push({
      id: Date.now(),
      firstName,
      lastName,
      email,
      password,
      role,
      verified,
    });
  }

  saveToStorage();
  document.getElementById("accountFormWrap").style.display = "none";
  renderAccountsList();
});

function resetPassword(id) {
  const user = window.db.users.find((u) => u.id === id);
  if (!user) return;

  const newPw = prompt(
    `Reset password for ${user.email}.\n\nEnter new password (min 6 characters):`,
  );
  if (newPw === null) return; // cancelled
  if (newPw.length < 6) return alert("Password must be at least 6 characters.");

  user.password = newPw;
  saveToStorage();
  alert(`Password for ${user.email} has been reset.`);
}

function deleteAccount(id) {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (currentUser && currentUser.id === id) {
    return alert("You cannot delete your own account.");
  }

  const user = window.db.users.find((u) => u.id === id);
  if (!user) return;

  if (!confirm(`Delete account for ${user.email}? This cannot be undone.`))
    return;

  window.db.users = window.db.users.filter((u) => u.id !== id);
  saveToStorage();
  renderAccountsList();
}

// ========== B. DEPARTMENTS ==========
function renderDepartmentsTable() {
  const wrap = document.getElementById("deptsTableWrap");
  const depts = window.db.departments;

  wrap.innerHTML = `
    <table class="admin-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Description</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${
          !depts.length
            ? `<tr><td colspan="3" style="text-align:center;color:#888;padding:1.5rem;">No departments found.</td></tr>`
            : depts
                .map(
                  (d) => `
              <tr>
                <td>${d.name}</td>
                <td>${d.description || '<span style="color:#aaa;">—</span>'}</td>
                <td>
                  <div class="action-btns">
                    <button class="btn btn-primary" onclick="openEditDept(${d.id})">Edit</button>
                    <button class="btn btn-danger" onclick="deleteDept(${d.id})">Delete</button>
                  </div>
                </td>
              </tr>
            `,
                )
                .join("")
        }
      </tbody>
    </table>
    <!-- Dept inline form -->
    <div id="deptFormWrap" style="display:none;" class="account-inline-form">
      <h3 id="deptFormTitle">Add/Edit Department</h3>
      <input type="hidden" id="deptEditId" />
      <div class="form-group">
        <label>Name</label>
        <input type="text" id="deptName" required />
      </div>
      <div class="form-group">
        <label>Description</label>
        <input type="text" id="deptDesc" />
      </div>
      <div class="form-actions">
        <button class="btn btn-success" id="saveDeptBtn" onclick="saveDept()">Save</button>
        <button class="btn btn-secondary" onclick="document.getElementById('deptFormWrap').style.display='none'">Cancel</button>
      </div>
    </div>
  `;
}

document.getElementById("addDeptBtn").addEventListener("click", () => {
  renderDepartmentsTable(); // ensure form is in DOM
  document.getElementById("deptFormTitle").textContent = "Add Department";
  document.getElementById("deptEditId").value = "";
  document.getElementById("deptName").value = "";
  document.getElementById("deptDesc").value = "";
  document.getElementById("deptFormWrap").style.display = "block";
});

function openEditDept(id) {
  const dept = window.db.departments.find((d) => d.id === id);
  if (!dept) return;
  document.getElementById("deptFormTitle").textContent = "Edit Department";
  document.getElementById("deptEditId").value = id;
  document.getElementById("deptName").value = dept.name;
  document.getElementById("deptDesc").value = dept.description || "";
  document.getElementById("deptFormWrap").style.display = "block";
  document
    .getElementById("deptFormWrap")
    .scrollIntoView({ behavior: "smooth" });
}

function saveDept() {
  const editId = document.getElementById("deptEditId").value;
  const name = document.getElementById("deptName").value.trim();
  const desc = document.getElementById("deptDesc").value.trim();

  if (!name) return alert("Department name is required.");

  if (editId) {
    const dept = window.db.departments.find((d) => d.id === Number(editId));
    if (!dept) return;
    dept.name = name;
    dept.description = desc;
  } else {
    window.db.departments.push({ id: Date.now(), name, description: desc });
  }

  saveToStorage();
  renderDepartmentsTable();
}

function deleteDept(id) {
  const dept = window.db.departments.find((d) => d.id === id);
  if (!dept) return;
  // Check if any employee uses this dept
  const inUse = window.db.employees.some((e) => e.deptId === id);
  if (inUse)
    return alert(
      `Cannot delete "${dept.name}" — it is assigned to one or more employees.`,
    );
  if (!confirm(`Delete department "${dept.name}"?`)) return;
  window.db.departments = window.db.departments.filter((d) => d.id !== id);
  saveToStorage();
  renderDepartmentsTable();
}

// ========== C. EMPLOYEES ==========
function renderEmployeesTable() {
  const wrap = document.getElementById("employeesTableWrap");
  const employees = window.db.employees;

  wrap.innerHTML = `
    <table class="admin-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Position</th>
          <th>Dept</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${
          !employees.length
            ? `<tr><td colspan="5" style="text-align:center;color:#888;padding:1.5rem;">No employees.</td></tr>`
            : employees
                .map((emp) => {
                  const user = window.db.users.find((u) => u.id === emp.userId);
                  const dept = window.db.departments.find(
                    (d) => d.id === emp.deptId,
                  );
                  return `
                <tr>
                  <td>${emp.employeeId}</td>
                  <td>${user ? `${user.firstName} ${user.lastName}` : '<span style="color:#e74c3c;">Unknown</span>'}</td>
                  <td>${emp.position}</td>
                  <td>${dept ? dept.name : '<span style="color:#e74c3c;">Unknown</span>'}</td>
                  <td>
                    <div class="action-btns">
                      <button class="btn btn-primary" onclick="openEditEmployee('${emp.id}')">Edit</button>
                      <button class="btn btn-danger" onclick="deleteEmployee('${emp.id}')">Delete</button>
                    </div>
                  </td>
                </tr>
              `;
                })
                .join("")
        }
      </tbody>
    </table>
  `;
}

function populateDeptDropdown(selectedId = null) {
  const select = document.getElementById("empDept");
  select.innerHTML = window.db.departments
    .map(
      (d) =>
        `<option value="${d.id}" ${d.id === selectedId ? "selected" : ""}>${d.name}</option>`,
    )
    .join("");
}

document.getElementById("addEmployeeBtn").addEventListener("click", () => {
  document.getElementById("employeeFormTitle").textContent = "Add Employee";
  document.getElementById("employeeEditId").value = "";
  document.getElementById("empId").value = "";
  document.getElementById("empUserEmail").value = "";
  document.getElementById("empPosition").value = "";
  document.getElementById("empHireDate").value = "";
  populateDeptDropdown();
  document.getElementById("employeeFormWrap").style.display = "block";
});

document.getElementById("cancelEmployeeBtn").addEventListener("click", () => {
  document.getElementById("employeeFormWrap").style.display = "none";
});

function openEditEmployee(id) {
  const emp = window.db.employees.find((e) => e.id === id);
  if (!emp) return;
  const user = window.db.users.find((u) => u.id === emp.userId);

  document.getElementById("employeeFormTitle").textContent = "Edit Employee";
  document.getElementById("employeeEditId").value = id;
  document.getElementById("empId").value = emp.employeeId;
  document.getElementById("empUserEmail").value = user ? user.email : "";
  document.getElementById("empPosition").value = emp.position;
  document.getElementById("empHireDate").value = emp.hireDate;
  populateDeptDropdown(emp.deptId);
  document.getElementById("employeeFormWrap").style.display = "block";
  document
    .getElementById("employeeFormWrap")
    .scrollIntoView({ behavior: "smooth" });
}

document.getElementById("saveEmployeeBtn").addEventListener("click", () => {
  const editId = document.getElementById("employeeEditId").value;
  const employeeId = document.getElementById("empId").value.trim();
  const userEmail = document.getElementById("empUserEmail").value.trim();
  const position = document.getElementById("empPosition").value.trim();
  const deptId = Number(document.getElementById("empDept").value);
  const hireDate = document.getElementById("empHireDate").value;

  if (!employeeId || !userEmail || !position || !hireDate) {
    return alert("All fields are required.");
  }

  const linkedUser = window.db.users.find((u) => u.email === userEmail);
  if (!linkedUser)
    return alert(
      `No account found with email "${userEmail}". Please create the account first.`,
    );

  if (editId) {
    const emp = window.db.employees.find((e) => e.id === editId);
    if (!emp) return;
    emp.employeeId = employeeId;
    emp.userId = linkedUser.id;
    emp.position = position;
    emp.deptId = deptId;
    emp.hireDate = hireDate;
  } else {
    window.db.employees.push({
      id: String(Date.now()),
      employeeId,
      userId: linkedUser.id,
      position,
      deptId,
      hireDate,
    });
  }

  saveToStorage();
  document.getElementById("employeeFormWrap").style.display = "none";
  renderEmployeesTable();
});

function deleteEmployee(id) {
  const emp = window.db.employees.find((e) => e.id === id);
  if (!emp) return;
  if (
    !confirm(
      `Delete employee record "${emp.employeeId}"? This cannot be undone.`,
    )
  )
    return;

  window.db.employees = window.db.employees.filter((e) => e.id !== id);
  saveToStorage();
  renderEmployeesTable();
}

// ================= REQUESTS =================

// --- Navigation ---
document.getElementById("requestsBackBtn").addEventListener("click", () => {
  window.location.hash = "";
  showSection("dashboard");
});

// --- Render requests table ---
function renderRequestsTable() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const wrap = document.getElementById("requestsTableWrap");
  if (!currentUser) return;

  const myRequests = (window.db.requests || [])
    .filter((r) => r.employeeEmail === currentUser.email)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  if (!myRequests.length) {
    wrap.innerHTML = `
      <p style="color:#555;margin-bottom:1rem;">You have no requests yet.</p>
      <button class="btn btn-success" onclick="openRequestModal()">Create One</button>`;
    return;
  }

  const statusBadge = (status) => {
    const cls =
      status === "Approved"
        ? "badge-approved"
        : status === "Rejected"
          ? "badge-rejected"
          : "badge-pending";
    return `<span class="badge ${cls}">${status}</span>`;
  };

  wrap.innerHTML = `
    <table class="admin-table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Type</th>
          <th>Items</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${myRequests
          .map(
            (r) => `
          <tr>
            <td style="white-space:nowrap;">${r.date}</td>
            <td>${r.type}</td>
            <td>
              ${r.items.map((i) => `<div style="font-size:0.88rem;">${i.name} <span style="color:#888;">×${i.qty}</span></div>`).join("")}
            </td>
            <td>${statusBadge(r.status)}</td>
            <td>
              <div class="action-btns">
                <button class="btn btn-danger"
                  ${r.status !== "Pending" ? 'disabled title="Only pending requests can be cancelled"' : ""}
                  onclick="cancelRequest('${r.id}')">Cancel</button>
              </div>
            </td>
          </tr>
        `,
          )
          .join("")}
      </tbody>
    </table>`;
}

function cancelRequest(id) {
  const req = window.db.requests.find((r) => r.id === id);
  if (!req) return;
  if (req.status !== "Pending")
    return alert("Only pending requests can be cancelled.");
  if (!confirm("Cancel this request?")) return;
  window.db.requests = window.db.requests.filter((r) => r.id !== id);
  saveToStorage();
  renderRequestsTable();
}

// --- Modal open/close ---
function openRequestModal() {
  renderItemRows([{ name: "", qty: 1 }]);
  document.getElementById("reqType").value = "Equipment";
  document.getElementById("requestModal").style.display = "flex";
}

function closeRequestModal() {
  document.getElementById("requestModal").style.display = "none";
}

document
  .getElementById("newRequestBtn")
  .addEventListener("click", openRequestModal);
document
  .getElementById("closeRequestModal")
  .addEventListener("click", closeRequestModal);
document
  .getElementById("cancelRequestModal")
  .addEventListener("click", closeRequestModal);

document.getElementById("requestModal").addEventListener("click", (e) => {
  if (e.target === document.getElementById("requestModal")) closeRequestModal();
});

// --- Dynamic item rows ---
function renderItemRows(items) {
  const list = document.getElementById("reqItemsList");
  list.innerHTML = items
    .map(
      (item, idx) => `
    <div class="item-row" data-idx="${idx}">
      <input type="text"   class="item-name" placeholder="Item name" value="${item.name}" />
      <input type="number" class="item-qty"  placeholder="Qty" value="${item.qty}" min="1" />
      <button class="remove-item" title="Remove" ${items.length === 1 ? 'disabled style="opacity:0.3;"' : ""}>&#215;</button>
    </div>
  `,
    )
    .join("");

  list.querySelectorAll(".remove-item").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = Number(btn.closest(".item-row").dataset.idx);
      const current = collectItems();
      current.splice(idx, 1);
      renderItemRows(current);
    });
  });
}

function collectItems() {
  return Array.from(document.querySelectorAll("#reqItemsList .item-row")).map(
    (row) => ({
      name: row.querySelector(".item-name").value.trim(),
      qty: Number(row.querySelector(".item-qty").value) || 1,
    }),
  );
}

document.getElementById("addItemBtn").addEventListener("click", () => {
  const current = collectItems();
  current.push({ name: "", qty: 1 });
  renderItemRows(current);
});

// --- Submit request ---
document.getElementById("submitRequestBtn").addEventListener("click", () => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser) return;

  const type = document.getElementById("reqType").value;
  const items = collectItems();
  const validItems = items.filter((i) => i.name.length > 0);

  if (!validItems.length)
    return alert("Please add at least one item with a name.");

  const request = {
    id: String(Date.now()),
    employeeEmail: currentUser.email,
    type,
    items: validItems,
    status: "Pending",
    date: new Date().toISOString().split("T")[0],
  };

  if (!Array.isArray(window.db.requests)) window.db.requests = [];
  window.db.requests.push(request);
  saveToStorage();
  closeRequestModal();
  renderRequestsTable();
});

// ================= LOGOUT =================
document.getElementById("backToDashboardBtn").addEventListener("click", () => {
  window.location.hash = "";
  showSection("dashboard");
});

function logout() {
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("currentUser");
  localStorage.removeItem("isAdmin");

  applyAuthClasses();
  updateNavigation();
  showSection("home");
}

// ================= AUTH CLASS HANDLER =================
function applyAuthClasses() {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const isAdmin = localStorage.getItem("isAdmin") === "true";

  document.body.classList.remove(
    "authenticated",
    "not-authenticated",
    "is-admin",
  );

  if (isLoggedIn) {
    document.body.classList.add("authenticated");
    if (isAdmin) document.body.classList.add("is-admin");
  } else {
    document.body.classList.add("not-authenticated");
  }
}

// ================= INIT APP =================
function initApp() {
  loadFromStorage(); // Phase 4: load (or seed) persistent data

  applyAuthClasses();

  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  if (isLoggedIn && currentUser) {
    userName.textContent = `${currentUser.firstName} ${currentUser.lastName}`;
    renderProfile();
    showSection("profile");
  } else {
    showSection("home");
  }

  updateNavigation();
  handleHash(); // handle direct navigation to #/profile on load
}

// Run
window.addEventListener("DOMContentLoaded", initApp);
