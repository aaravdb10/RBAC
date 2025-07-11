// RBAC System - Main JavaScript File
// Role-Based Access Control Demo Application

// Global Variables
let currentUser = null;
let currentRole = null;
let isDarkMode = false;
const API_BASE_URL = 'http://localhost:5000/api';

// Mock Data for demonstration
const mockData = {
    users: [
        { id: 1, name: 'John Admin', email: 'admin@company.com', role: 'admin', status: 'active' },
        { id: 2, name: 'Jane Manager', email: 'manager@company.com', role: 'manager', status: 'active' },
        { id: 3, name: 'Bob Employee', email: 'employee@company.com', role: 'employee', status: 'active' },
        { id: 4, name: 'Alice Smith', email: 'alice@company.com', role: 'employee', status: 'active' },
        { id: 5, name: 'Mike Johnson', email: 'mike@company.com', role: 'manager', status: 'inactive' }
    ],
    leaveRequests: [
        { id: 1, userId: 3, employeeName: 'Bob Employee', type: 'vacation', startDate: '2025-01-15', endDate: '2025-01-20', days: 5, reason: 'Family vacation', status: 'pending' },
        { id: 2, userId: 4, employeeName: 'Alice Smith', type: 'sick', startDate: '2025-01-10', endDate: '2025-01-12', days: 3, reason: 'Medical appointment', status: 'approved' },
        { id: 3, userId: 3, employeeName: 'Bob Employee', type: 'personal', startDate: '2025-01-25', endDate: '2025-01-25', days: 1, reason: 'Personal matters', status: 'rejected' }
    ],
    systemLogs: [
        { id: 1, action: 'User Login', user: 'admin@company.com', timestamp: '2025-01-08 10:30:00', status: 'success' },
        { id: 2, action: 'Role Assignment', user: 'admin@company.com', timestamp: '2025-01-08 10:15:00', status: 'success' },
        { id: 3, action: 'Leave Request', user: 'employee@company.com', timestamp: '2025-01-08 09:45:00', status: 'success' },
        { id: 4, action: 'User Update', user: 'manager@company.com', timestamp: '2025-01-08 09:30:00', status: 'success' }
    ]
};

// Demo users for login
const demoUsers = {
    'admin@company.com': {
        email: 'admin@company.com',
        password: 'admin123',
        role: 'admin',
        name: 'John Admin',
        department: 'IT'
    },
    'manager@company.com': {
        email: 'manager@company.com',
        password: 'manager123',
        role: 'manager',
        name: 'Jane Manager',
        department: 'HR'
    },
    'employee@company.com': {
        email: 'employee@company.com',
        password: 'employee123',
        role: 'employee',
        name: 'Bob Employee',
        department: 'Finance'
    }
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing app...');
    initializeDarkMode();
    setupEventListeners();
    checkExistingSession();
});

// Initialize dark mode from localStorage
function initializeDarkMode() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        isDarkMode = true;
        document.documentElement.setAttribute('data-theme', 'dark');
        updateDarkModeIcon();
    }
}

// Toggle dark mode
function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    if (isDarkMode) {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    } else {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
    }
    updateDarkModeIcon();
}

// Update dark mode icon
function updateDarkModeIcon() {
    const darkModeToggles = document.querySelectorAll('.dark-mode-toggle');
    darkModeToggles.forEach(toggle => {
        const icon = toggle.querySelector('i');
        if (icon) {
            icon.className = isDarkMode ? 'fas fa-sun' : 'fas fa-moon';
        }
    });
}

// Show different pages
function showHomePage() {
    console.log('Showing home page');
    hideAllPages();
    document.getElementById('homePage').style.display = 'block';
}

function showRegisterPage() {
    console.log('Showing register page');
    hideAllPages();
    document.getElementById('registerPage').style.display = 'block';
}

function showLoginPage() {
    console.log('Showing login page');
    hideAllPages();
    document.getElementById('loginPage').style.display = 'block';
}

function showDashboardPage() {
    console.log('Showing dashboard page');
    hideAllPages();
    document.getElementById('dashboardPage').style.display = 'block';
    setupDashboard();
}

function hideAllPages() {
    const pages = ['homePage', 'registerPage', 'loginPage', 'dashboardPage'];
    pages.forEach(pageId => {
        const element = document.getElementById(pageId);
        if (element) {
            element.style.display = 'none';
        }
    });
}

// Check for existing session
function checkExistingSession() {
    const savedUser = localStorage.getItem('currentUser');
    const savedRole = localStorage.getItem('currentRole');
    
    if (savedUser && savedRole) {
        currentUser = JSON.parse(savedUser);
        currentRole = savedRole;
        showDashboardPage();
    } else {
        showHomePage();
    }
}

// Setup event listeners
function setupEventListeners() {
    // Dark mode toggles
    document.querySelectorAll('.dark-mode-toggle').forEach(toggle => {
        toggle.addEventListener('click', toggleDarkMode);
    });

    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Register form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    // Demo buttons
    document.querySelectorAll('.demo-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const role = this.getAttribute('data-role');
            demoLogin(role);
        });
    });

    // Password toggle
    const togglePassword = document.getElementById('togglePassword');
    if (togglePassword) {
        togglePassword.addEventListener('click', function() {
            const passwordField = document.getElementById('password');
            const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordField.setAttribute('type', type);
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });
    }

    // Logout button
    document.addEventListener('click', function(e) {
        if (e.target.matches('.logout-btn') || e.target.closest('.logout-btn')) {
            logout();
        }
    });

    // Access denied modal close
    const closeAccessModal = document.getElementById('closeAccessModal');
    if (closeAccessModal) {
        closeAccessModal.addEventListener('click', closeAccessDeniedModal);
    }
}

// Demo login function
function demoLogin(role) {
    console.log('Demo login for role:', role);
    
    let demoEmail;
    switch(role) {
        case 'admin':
            demoEmail = 'admin@company.com';
            break;
        case 'manager':
            demoEmail = 'manager@company.com';
            break;
        case 'employee':
            demoEmail = 'employee@company.com';
            break;
        default:
            showToast('Invalid demo role', 'error');
            return;
    }

    const user = demoUsers[demoEmail];
    if (user) {
        currentUser = user;
        currentRole = user.role;
        
        // Save to localStorage
        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem('currentRole', user.role);
        
        showToast(`Logged in as ${user.name} (${user.role})`, 'success');
        showDashboardPage();
    } else {
        showToast('Demo user not found', 'error');
    }
}

// Handle login form submission
function handleLogin(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const email = formData.get('email');
    const password = formData.get('password');
    
    console.log('Login attempt:', email);
    
    // Check demo users
    const user = demoUsers[email];
    if (user && user.password === password) {
        currentUser = user;
        currentRole = user.role;
        
        // Save to localStorage
        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem('currentRole', user.role);
        
        showToast(`Welcome back, ${user.name}!`, 'success');
        showDashboardPage();
    } else {
        showToast('Invalid email or password', 'error');
    }
}

// Handle register form submission
function handleRegister(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const userData = {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        password: formData.get('password'),
        confirmPassword: formData.get('confirmPassword'),
        department: formData.get('department')
    };
    
    // Basic validation
    if (userData.password !== userData.confirmPassword) {
        showToast('Passwords do not match', 'error');
        return;
    }
    
    if (demoUsers[userData.email]) {
        showToast('User already exists', 'error');
        return;
    }
    
    // Create new user (for demo purposes)
    const newUser = {
        email: userData.email,
        password: userData.password,
        role: 'employee', // Default role
        name: `${userData.firstName} ${userData.lastName}`,
        department: userData.department
    };
    
    // Add to demo users
    demoUsers[userData.email] = newUser;
    
    showToast('Account created successfully! Please log in.', 'success');
    showLoginPage();
}

// Setup dashboard based on user role
function setupDashboard() {
    if (!currentUser || !currentRole) {
        showHomePage();
        return;
    }
    
    // Update navigation
    setupNavigation();
    
    // Update user info
    const userName = document.getElementById('userName');
    const userRole = document.getElementById('userRole');
    
    if (userName) userName.textContent = currentUser.name;
    if (userRole) userRole.textContent = currentRole.charAt(0).toUpperCase() + currentRole.slice(1);
    
    // Setup dashboard content
    const dashboardTitle = document.getElementById('dashboardTitle');
    const dashboardSubtitle = document.getElementById('dashboardSubtitle');
    
    if (currentRole === 'admin') {
        if (dashboardTitle) dashboardTitle.textContent = 'Admin Dashboard';
        if (dashboardSubtitle) dashboardSubtitle.textContent = 'Complete system control and user management';
        showAdminDashboard();
    } else if (currentRole === 'manager') {
        if (dashboardTitle) dashboardTitle.textContent = 'Manager Dashboard';
        if (dashboardSubtitle) dashboardSubtitle.textContent = 'Team management and oversight';
        showManagerDashboard();
    } else {
        if (dashboardTitle) dashboardTitle.textContent = 'Employee Dashboard';
        if (dashboardSubtitle) dashboardSubtitle.textContent = 'Your personal workspace';
        showEmployeeDashboard();
    }
}

// Setup navigation based on role
function setupNavigation() {
    const navLinks = document.getElementById('navLinks');
    if (!navLinks) return;
    
    let navHtml = '<a href="#" class="nav-link active" onclick="showDashboard()">Dashboard</a>';
    
    if (currentRole === 'admin') {
        navHtml += '<a href="#" class="nav-link" onclick="showUsers()">Users</a>';
        navHtml += '<a href="#" class="nav-link" onclick="showSystemLogs()">System Logs</a>';
        navHtml += '<a href="#" class="nav-link" onclick="showLeaveRequests()">Leave Requests</a>';
        navHtml += '<a href="#" class="nav-link" onclick="showReports()">Reports</a>';
    } else if (currentRole === 'manager') {
        navHtml += '<a href="#" class="nav-link" onclick="showTeam()">Team</a>';
        navHtml += '<a href="#" class="nav-link" onclick="showLeaveRequests()">Leave Requests</a>';
        navHtml += '<a href="#" class="nav-link" onclick="showReports()">Reports</a>';
    } else {
        navHtml += '<a href="#" class="nav-link" onclick="showProfile()">Profile</a>';
        navHtml += '<a href="#" class="nav-link" onclick="showMyLeaveRequests()">My Leaves</a>';
    }
    
    navLinks.innerHTML = navHtml;
}

// Dashboard content functions
function showDashboard() {
    setActiveNavLink(0);
    setupDashboard();
}

function showAdminDashboard() {
    const dashboardContent = document.getElementById('dashboardContent');
    if (!dashboardContent) return;
    
    const adminHtml = `
        <div class="stat-grid">
            <div class="stat-card">
                <div class="stat-value">${mockData.users.length}</div>
                <div class="stat-label">Total Users</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${mockData.users.filter(u => u.status === 'active').length}</div>
                <div class="stat-label">Active Users</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${mockData.leaveRequests.filter(r => r.status === 'pending').length}</div>
                <div class="stat-label">Pending Requests</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${mockData.systemLogs.length}</div>
                <div class="stat-label">System Events</div>
            </div>
        </div>
        
        <div class="dashboard-grid">
            <div class="dashboard-card">
                <div class="card-header">
                    <i class="fas fa-users" style="color: var(--primary-color);"></i>
                    <h3>Recent Users</h3>
                </div>
                <div class="card-content">
                    <div class="user-list">
                        ${mockData.users.slice(0, 3).map(user => `
                            <div class="user-item" style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                                <div class="user-avatar" style="width: 32px; height: 32px; font-size: 14px;">
                                    <i class="fas fa-user"></i>
                                </div>
                                <div>
                                    <div style="font-weight: 500; color: var(--text-primary);">${user.name}</div>
                                    <div style="font-size: 12px; color: var(--text-secondary);">${user.role}</div>
                                </div>
                                <div class="status-badge status-${user.status}" style="margin-left: auto;">
                                    ${user.status}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <button class="btn btn-primary btn-sm" onclick="showUsers()">View All Users</button>
                </div>
            </div>
            
            <div class="dashboard-card">
                <div class="card-header">
                    <i class="fas fa-history" style="color: var(--success-color);"></i>
                    <h3>System Activity</h3>
                </div>
                <div class="card-content">
                    <div class="activity-list">
                        ${mockData.systemLogs.slice(0, 3).map(log => `
                            <div class="activity-item" style="margin-bottom: 12px; padding: 8px; background: var(--bg-secondary); border-radius: 6px;">
                                <div style="font-weight: 500; font-size: 14px; color: var(--text-primary);">${log.action}</div>
                                <div style="font-size: 12px; color: var(--text-secondary);">${log.user} - ${log.timestamp}</div>
                            </div>
                        `).join('')}
                    </div>
                    <button class="btn btn-primary btn-sm" onclick="showSystemLogs()">View All Logs</button>
                </div>
            </div>
        </div>
    `;
    
    dashboardContent.innerHTML = adminHtml;
}

function showManagerDashboard() {
    const dashboardContent = document.getElementById('dashboardContent');
    if (!dashboardContent) return;
    
    const managerHtml = `
        <div class="stat-grid">
            <div class="stat-card">
                <div class="stat-value">${mockData.users.filter(u => u.role === 'employee').length}</div>
                <div class="stat-label">Team Members</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${mockData.leaveRequests.filter(r => r.status === 'pending').length}</div>
                <div class="stat-label">Pending Requests</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${mockData.leaveRequests.filter(r => r.status === 'approved').length}</div>
                <div class="stat-label">Approved Requests</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">85%</div>
                <div class="stat-label">Team Performance</div>
            </div>
        </div>
        
        <div class="dashboard-grid">
            <div class="dashboard-card">
                <div class="card-header">
                    <i class="fas fa-users" style="color: var(--primary-color);"></i>
                    <h3>Team Members</h3>
                </div>
                <div class="card-content">
                    <div class="team-list">
                        ${mockData.users.filter(u => u.role === 'employee').map(user => `
                            <div class="team-item" style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                                <div class="user-avatar" style="width: 32px; height: 32px; font-size: 14px;">
                                    <i class="fas fa-user"></i>
                                </div>
                                <div>
                                    <div style="font-weight: 500; color: var(--text-primary);">${user.name}</div>
                                    <div style="font-size: 12px; color: var(--text-secondary);">${user.role}</div>
                                </div>
                                <div class="status-badge status-${user.status}" style="margin-left: auto;">
                                    ${user.status}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <button class="btn btn-primary btn-sm" onclick="showTeam()">Manage Team</button>
                </div>
            </div>
            
            <div class="dashboard-card">
                <div class="card-header">
                    <i class="fas fa-calendar-check" style="color: var(--warning-color);"></i>
                    <h3>Leave Requests</h3>
                </div>
                <div class="card-content">
                    <div class="leave-list">
                        ${mockData.leaveRequests.slice(0, 3).map(request => `
                            <div class="leave-item" style="margin-bottom: 12px; padding: 8px; background: var(--bg-secondary); border-radius: 6px;">
                                <div style="font-weight: 500; font-size: 14px; color: var(--text-primary);">${request.employeeName}</div>
                                <div style="font-size: 12px; color: var(--text-secondary);">${request.type} - ${request.startDate} to ${request.endDate}</div>
                                <div class="status-badge status-${request.status}" style="font-size: 11px; margin-top: 4px;">
                                    ${request.status}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <button class="btn btn-primary btn-sm" onclick="showLeaveRequests()">View All Requests</button>
                </div>
            </div>
        </div>
    `;
    
    dashboardContent.innerHTML = managerHtml;
}

function showEmployeeDashboard() {
    const dashboardContent = document.getElementById('dashboardContent');
    if (!dashboardContent) return;
    
    const userLeaves = mockData.leaveRequests.filter(r => r.userId === 3); // Bob Employee's ID
    
    const employeeHtml = `
        <div class="stat-grid">
            <div class="stat-card">
                <div class="stat-value">${userLeaves.length}</div>
                <div class="stat-label">Total Requests</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${userLeaves.filter(r => r.status === 'approved').length}</div>
                <div class="stat-label">Approved</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${userLeaves.filter(r => r.status === 'pending').length}</div>
                <div class="stat-label">Pending</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">20</div>
                <div class="stat-label">Days Remaining</div>
            </div>
        </div>
        
        <div class="dashboard-grid">
            <div class="dashboard-card">
                <div class="card-header">
                    <i class="fas fa-calendar-alt" style="color: var(--primary-color);"></i>
                    <h3>My Leave Requests</h3>
                </div>
                <div class="card-content">
                    <div class="leave-list">
                        ${userLeaves.map(request => `
                            <div class="leave-item" style="margin-bottom: 12px; padding: 8px; background: var(--bg-secondary); border-radius: 6px;">
                                <div style="font-weight: 500; font-size: 14px; color: var(--text-primary);">${request.type.charAt(0).toUpperCase() + request.type.slice(1)} Leave</div>
                                <div style="font-size: 12px; color: var(--text-secondary);">${request.startDate} to ${request.endDate} (${request.days} days)</div>
                                <div class="status-badge status-${request.status}" style="font-size: 11px; margin-top: 4px;">
                                    ${request.status}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <button class="btn btn-primary btn-sm" onclick="showMyLeaveRequests()">Request New Leave</button>
                </div>
            </div>
            
            <div class="dashboard-card">
                <div class="card-header">
                    <i class="fas fa-user-circle" style="color: var(--success-color);"></i>
                    <h3>Profile Information</h3>
                </div>
                <div class="card-content">
                    <div class="profile-info">
                        <div style="margin-bottom: 12px;">
                            <div style="font-weight: 500; color: var(--text-primary);">Name</div>
                            <div style="color: var(--text-secondary);">${currentUser.name}</div>
                        </div>
                        <div style="margin-bottom: 12px;">
                            <div style="font-weight: 500; color: var(--text-primary);">Email</div>
                            <div style="color: var(--text-secondary);">${currentUser.email}</div>
                        </div>
                        <div style="margin-bottom: 12px;">
                            <div style="font-weight: 500; color: var(--text-primary);">Department</div>
                            <div style="color: var(--text-secondary);">${currentUser.department}</div>
                        </div>
                        <div style="margin-bottom: 12px;">
                            <div style="font-weight: 500; color: var(--text-primary);">Role</div>
                            <div style="color: var(--text-secondary);">${currentUser.role}</div>
                        </div>
                    </div>
                    <button class="btn btn-primary btn-sm" onclick="showProfile()">Edit Profile</button>
                </div>
            </div>
        </div>
    `;
    
    dashboardContent.innerHTML = employeeHtml;
}

// Navigation functions
function showUsers() {
    if (!hasPermission('admin')) {
        showAccessDenied();
        return;
    }
    
    setActiveNavLink(1);
    const dashboardContent = document.getElementById('dashboardContent');
    
    const usersHtml = `
        <div class="table-container">
            <div class="table-header">
                <h3>All Users</h3>
                <button class="btn btn-primary btn-sm" onclick="showAddUser()">
                    <i class="fas fa-plus"></i>
                    Add User
                </button>
            </div>
            <table class="table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${mockData.users.map(user => `
                        <tr>
                            <td>${user.name}</td>
                            <td>${user.email}</td>
                            <td style="text-transform: capitalize;">${user.role}</td>
                            <td>
                                <span class="status-badge status-${user.status}">
                                    ${user.status}
                                </span>
                            </td>
                            <td>
                                <button class="btn btn-secondary btn-sm" onclick="editUser(${user.id})">
                                    <i class="fas fa-edit"></i>
                                    Edit
                                </button>
                                <button class="btn btn-danger btn-sm" onclick="deleteUser(${user.id})">
                                    <i class="fas fa-trash"></i>
                                    Delete
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    dashboardContent.innerHTML = usersHtml;
}

function showSystemLogs() {
    if (!hasPermission('admin')) {
        showAccessDenied();
        return;
    }
    
    setActiveNavLink(2);
    const dashboardContent = document.getElementById('dashboardContent');
    
    const logsHtml = `
        <div class="table-container">
            <div class="table-header">
                <h3>System Logs</h3>
                <button class="btn btn-primary btn-sm" onclick="exportLogs()">
                    <i class="fas fa-download"></i>
                    Export
                </button>
            </div>
            <table class="table">
                <thead>
                    <tr>
                        <th>Timestamp</th>
                        <th>Action</th>
                        <th>User</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${mockData.systemLogs.map(log => `
                        <tr>
                            <td>${log.timestamp}</td>
                            <td>${log.action}</td>
                            <td>${log.user}</td>
                            <td>
                                <span class="status-badge status-${log.status}">
                                    ${log.status}
                                </span>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    dashboardContent.innerHTML = logsHtml;
}

function showLeaveRequests() {
    if (!hasPermission('admin') && !hasPermission('manager')) {
        showAccessDenied();
        return;
    }
    
    setActiveNavLink(3);
    const dashboardContent = document.getElementById('dashboardContent');
    
    const leaveHtml = `
        <div class="table-container">
            <div class="table-header">
                <h3>Leave Requests</h3>
                <button class="btn btn-primary btn-sm" onclick="generateReport()">
                    <i class="fas fa-chart-bar"></i>
                    Generate Report
                </button>
            </div>
            <table class="table">
                <thead>
                    <tr>
                        <th>Employee</th>
                        <th>Type</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                        <th>Days</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${mockData.leaveRequests.map(request => `
                        <tr>
                            <td>${request.employeeName}</td>
                            <td style="text-transform: capitalize;">${request.type}</td>
                            <td>${request.startDate}</td>
                            <td>${request.endDate}</td>
                            <td>${request.days}</td>
                            <td>
                                <span class="status-badge status-${request.status}">
                                    ${request.status}
                                </span>
                            </td>
                            <td>
                                ${request.status === 'pending' ? `
                                    <button class="btn btn-success btn-sm" onclick="approveLeave(${request.id})">
                                        <i class="fas fa-check"></i>
                                        Approve
                                    </button>
                                    <button class="btn btn-danger btn-sm" onclick="rejectLeave(${request.id})">
                                        <i class="fas fa-times"></i>
                                        Reject
                                    </button>
                                ` : `
                                    <button class="btn btn-secondary btn-sm" onclick="viewLeave(${request.id})">
                                        <i class="fas fa-eye"></i>
                                        View
                                    </button>
                                `}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    dashboardContent.innerHTML = leaveHtml;
}

// Placeholder functions for other navigation items
function showTeam() {
    showToast('Team management feature coming soon!', 'info');
}

function showReports() {
    showToast('Reports feature coming soon!', 'info');
}

function showProfile() {
    showToast('Profile management feature coming soon!', 'info');
}

function showMyLeaveRequests() {
    showToast('Leave request feature coming soon!', 'info');
}

// Permission checking
function hasPermission(requiredRole) {
    if (requiredRole === 'admin') {
        return currentRole === 'admin';
    } else if (requiredRole === 'manager') {
        return currentRole === 'admin' || currentRole === 'manager';
    }
    return true;
}

// Set active navigation link
function setActiveNavLink(index) {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach((link, i) => {
        if (i === index) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Access denied modal
function showAccessDenied() {
    const modal = document.getElementById('accessDeniedModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

function closeAccessDeniedModal() {
    const modal = document.getElementById('accessDeniedModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Toast notification system
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' ? 'fa-check-circle' : 
                 type === 'error' ? 'fa-exclamation-circle' :
                 type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle';
    
    toast.innerHTML = `
        <i class="fas ${icon}"></i>
        <span>${message}</span>
    `;
    
    container.appendChild(toast);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 3000);
}

// Logout function
function logout() {
    currentUser = null;
    currentRole = null;
    localStorage.removeItem('currentUser');
    localStorage.removeItem('currentRole');
    
    showToast('Logged out successfully!', 'success');
    
    setTimeout(() => {
        showHomePage();
    }, 1000);
}

// User Management Functions
async function refreshUsersFromAPI() {
    try {
        const response = await apiCall('/users', 'GET');
        if (response.users) {
            // Update mock data with API data
            mockData.users = response.users.map(user => ({
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status
            }));
        }
    } catch (error) {
        console.error('Failed to refresh users from API:', error);
        // Continue with existing mock data
    }
}

function showAddUser() {
    if (!hasPermission('admin')) {
        showAccessDenied();
        return;
    }
    
    const dashboardContent = document.getElementById('dashboardContent');
    
    const addUserHtml = `
        <div class="form-container" style="max-width: 600px; margin: 0 auto;">
            <div class="form-header">
                <h3>Add New User</h3>
                <p>Create a new user account with role assignment</p>
            </div>
            <form id="addUserForm" style="background: var(--bg-primary); padding: 24px; border-radius: 8px; box-shadow: var(--shadow-light); border: 1px solid var(--border-color);">
                <div class="form-group" style="margin-bottom: 16px;">
                    <label for="addUserName" style="display: block; margin-bottom: 6px; font-weight: 500;">Full Name</label>
                    <input type="text" id="addUserName" name="name" required 
                           style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 4px; font-size: 14px;">
                </div>
                <div class="form-group" style="margin-bottom: 16px;">
                    <label for="addUserEmail" style="display: block; margin-bottom: 6px; font-weight: 500;">Email</label>
                    <input type="email" id="addUserEmail" name="email" required 
                           style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 4px; font-size: 14px;">
                </div>
                <div class="form-group" style="margin-bottom: 16px;">
                    <label for="addUserRole" style="display: block; margin-bottom: 6px; font-weight: 500;">Role</label>
                    <select id="addUserRole" name="role" required 
                            style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 4px; font-size: 14px;">
                        <option value="">Select Role</option>
                        <option value="admin">Administrator</option>
                        <option value="manager">Manager</option>
                        <option value="employee">Employee</option>
                    </select>
                </div>
                <div class="form-group" style="margin-bottom: 16px;">
                    <label for="addUserStatus" style="display: block; margin-bottom: 6px; font-weight: 500;">Status</label>
                    <select id="addUserStatus" name="status" required 
                            style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 4px; font-size: 14px;">
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
                <div class="form-actions" style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px;">
                    <button type="button" class="btn btn-secondary" onclick="showUsers()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Add User</button>
                </div>
            </form>
        </div>
    `;
    
    dashboardContent.innerHTML = addUserHtml;
    
    // Add form submit listener
    document.getElementById('addUserForm').addEventListener('submit', handleAddUser);
}

async function handleAddUser(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const userData = {
        name: formData.get('name'),
        email: formData.get('email'),
        role: formData.get('role'),
        status: formData.get('status')
    };
    
    try {
        // Try API call first (if backend is available)
        // const response = await apiCall('/users', 'POST', userData);
        // showToast(`User added successfully! Default password: ${response.default_password}`, 'success');
        
        // For now, use mock data
        const newUser = {
            id: Math.max(...mockData.users.map(u => u.id)) + 1,
            name: userData.name,
            email: userData.email,
            role: userData.role,
            status: userData.status
        };
        
        // Check if email already exists
        if (mockData.users.some(user => user.email === newUser.email)) {
            showToast('User with this email already exists!', 'error');
            return;
        }
        
        // Add user to mock data
        mockData.users.push(newUser);
        
        // Add to system logs
        mockData.systemLogs.unshift({
            id: mockData.systemLogs.length + 1,
            action: 'User Created',
            user: currentUser.email,
            timestamp: new Date().toLocaleString(),
            status: 'success'
        });
        
        showToast('User added successfully!', 'success');
        showUsers();
    } catch (error) {
        console.error('Error adding user:', error);
        showToast('Error adding user', 'error');
    }
}

function editUser(userId) {
    if (!hasPermission('admin')) {
        showAccessDenied();
        return;
    }
    
    const user = mockData.users.find(u => u.id === userId);
    if (!user) {
        showToast('User not found!', 'error');
        return;
    }
    
    const dashboardContent = document.getElementById('dashboardContent');
    
    const editUserHtml = `
        <div class="form-container" style="max-width: 600px; margin: 0 auto;">
            <div class="form-header">
                <h3>Edit User</h3>
                <p>Update user information and role assignment</p>
            </div>
            <form id="editUserForm" style="background: var(--bg-primary); padding: 24px; border-radius: 8px; box-shadow: var(--shadow-light); border: 1px solid var(--border-color);">
                <input type="hidden" name="userId" value="${user.id}">
                <div class="form-group" style="margin-bottom: 16px;">
                    <label for="editUserName" style="display: block; margin-bottom: 6px; font-weight: 500;">Full Name</label>
                    <input type="text" id="editUserName" name="name" value="${user.name}" required 
                           style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 4px; font-size: 14px;">
                </div>
                <div class="form-group" style="margin-bottom: 16px;">
                    <label for="editUserEmail" style="display: block; margin-bottom: 6px; font-weight: 500;">Email</label>
                    <input type="email" id="editUserEmail" name="email" value="${user.email}" required 
                           style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 4px; font-size: 14px;">
                </div>
                <div class="form-group" style="margin-bottom: 16px;">
                    <label for="editUserRole" style="display: block; margin-bottom: 6px; font-weight: 500;">Role</label>
                    <select id="editUserRole" name="role" required 
                            style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 4px; font-size: 14px;">
                        <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Administrator</option>
                        <option value="manager" ${user.role === 'manager' ? 'selected' : ''}>Manager</option>
                        <option value="employee" ${user.role === 'employee' ? 'selected' : ''}>Employee</option>
                    </select>
                </div>
                <div class="form-group" style="margin-bottom: 16px;">
                    <label for="editUserStatus" style="display: block; margin-bottom: 6px; font-weight: 500;">Status</label>
                    <select id="editUserStatus" name="status" required 
                            style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 4px; font-size: 14px;">
                        <option value="active" ${user.status === 'active' ? 'selected' : ''}>Active</option>
                        <option value="inactive" ${user.status === 'inactive' ? 'selected' : ''}>Inactive</option>
                    </select>
                </div>
                <div class="form-actions" style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px;">
                    <button type="button" class="btn btn-secondary" onclick="showUsers()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Update User</button>
                </div>
            </form>
        </div>
    `;
    
    dashboardContent.innerHTML = editUserHtml;
    
    // Add form submit listener
    document.getElementById('editUserForm').addEventListener('submit', handleEditUser);
}

async function handleEditUser(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const userId = parseInt(formData.get('userId'));
    const updatedData = {
        name: formData.get('name'),
        email: formData.get('email'),
        role: formData.get('role'),
        status: formData.get('status')
    };
    
    try {
        // For now, use mock data
        const userIndex = mockData.users.findIndex(u => u.id === userId);
        
        if (userIndex === -1) {
            showToast('User not found!', 'error');
            return;
        }
        
        // Check if email already exists for another user
        if (mockData.users.some(user => user.email === updatedData.email && user.id !== userId)) {
            showToast('User with this email already exists!', 'error');
            return;
        }
        
        // Update user data
        mockData.users[userIndex] = { ...mockData.users[userIndex], ...updatedData };
        
        // Add to system logs
        mockData.systemLogs.unshift({
            id: mockData.systemLogs.length + 1,
            action: 'User Updated',
            user: currentUser.email,
            timestamp: new Date().toLocaleString(),
            status: 'success'
        });
        
        showToast('User updated successfully!', 'success');
        showUsers();
    } catch (error) {
        console.error('Error updating user:', error);
        showToast('Error updating user', 'error');
    }
}

async function deleteUser(userId) {
    if (!hasPermission('admin')) {
        showAccessDenied();
        return;
    }
    
    const user = mockData.users.find(u => u.id === userId);
    if (!user) {
        showToast('User not found!', 'error');
        return;
    }
    
    // Prevent deleting the current user
    if (user.email === currentUser.email) {
        showToast('You cannot delete your own account!', 'error');
        return;
    }
    
    // Confirm deletion
    if (confirm(`Are you sure you want to delete user "${user.name}"? This action cannot be undone.`)) {
        try {
            // For now, use mock data
            const userIndex = mockData.users.findIndex(u => u.id === userId);
            mockData.users.splice(userIndex, 1);
            
            // Add to system logs
            mockData.systemLogs.unshift({
                id: mockData.systemLogs.length + 1,
                action: 'User Deleted',
                user: currentUser.email,
                timestamp: new Date().toLocaleString(),
                status: 'success'
            });
            
            showToast('User deleted successfully!', 'success');
            showUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
            showToast('Error deleting user', 'error');
        }
    }
}

// Placeholder functions for leave management
function approveLeave(requestId) {
    const request = mockData.leaveRequests.find(r => r.id === requestId);
    if (request) {
        request.status = 'approved';
        showToast('Leave request approved!', 'success');
        showLeaveRequests();
    }
}

function rejectLeave(requestId) {
    const request = mockData.leaveRequests.find(r => r.id === requestId);
    if (request) {
        request.status = 'rejected';
        showToast('Leave request rejected!', 'success');
        showLeaveRequests();
    }
}

function viewLeave(requestId) {
    showToast('Leave details view coming soon!', 'info');
}

function generateReport() {
    showToast('Report generation feature coming soon!', 'info');
}

function exportLogs() {
    showToast('Log export feature coming soon!', 'info');
}

// API Helper Function (for future backend integration)
async function apiCall(endpoint, method = 'GET', data = null) {
    try {
        const config = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        };
        
        if (data) {
            config.body = JSON.stringify(data);
        }
        
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || 'API request failed');
        }
        
        return result;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}
