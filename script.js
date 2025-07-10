// RBAC System - Main JavaScript File
// Role-Based Access Control Demo Application

// Global Variables
let currentUser = null;
let isDarkMode = false;
const API_BASE_URL = 'http://localhost:5000/api';

// Mock Data for demonstration (will be replaced by API calls)
const mockData = {
    users: [
        { id: 1, name: 'John Admin', email: 'admin@company.com', role: 'admin', status: 'active' },
        { id: 2, name: 'Jane Manager', email: 'manager@company.com', role: 'manager', status: 'active' },
        { id: 3, name: 'Bob Employee', email: 'employee@company.com', role: 'employee', status: 'active' },
        { id: 4, name: 'Alice Smith', email: 'alice@company.com', role: 'employee', status: 'active' },
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
                <button class="btn btn-primary btn-sm" onclick="generateReport('leave')">
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
    if (!hasPermission('manager')) {
        showAccessDenied();
        return;
    }
    setActiveNavLink(1);
    const dashboardContent = document.getElementById('dashboardContent');
    const teamMembers = mockData.users.filter(u => u.role === 'employee');

    const teamHtml = `
        <div class="table-container">
            <div class="table-header">
                <h3>My Team Members</h3>
                <input type="text" id="teamSearch" placeholder="Search team members..." class="form-control" style="width: 250px;">
            </div>
            <table class="table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Department</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="teamTableBody">
                    ${teamMembers.map(user => `
                        <tr>
                            <td>${user.name}</td>
                            <td>${user.email}</td>
                            <td>${demoUsers[user.email]?.department || 'N/A'}</td>
                            <td><span class="status-badge status-${user.status}">${user.status}</span></td>
                            <td>
                                <button class="btn btn-secondary btn-sm" onclick="viewTeamMember(${user.id})"><i class="fas fa-eye"></i> View</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    dashboardContent.innerHTML = teamHtml;

    document.getElementById('teamSearch').addEventListener('keyup', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const tableBody = document.getElementById('teamTableBody');
        const rows = tableBody.getElementsByTagName('tr');
        Array.from(rows).forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm) ? '' : 'none';
        });
    });
}

function showReports() {
    if (!hasPermission('manager')) {
        showAccessDenied();
        return;
    }
    setActiveNavLink(currentRole === 'admin' ? 4 : 3);
    const dashboardContent = document.getElementById('dashboardContent');

    const reportsHtml = `
        <div class="reports-container">
            <div class="dashboard-card">
                <div class="card-header"><h3>Leave Analysis</h3></div>
                <div class="card-content">
                    <p>Total leave requests: ${mockData.leaveRequests.length}</p>
                    <p>Pending requests: ${mockData.leaveRequests.filter(r => r.status === 'pending').length}</p>
                    <p>Approved requests: ${mockData.leaveRequests.filter(r => r.status === 'approved').length}</p>
                    <p>Rejected requests: ${mockData.leaveRequests.filter(r => r.status === 'rejected').length}</p>
                    <button class="btn btn-primary" onclick="generateReport('leave')">Generate Leave Report (CSV)</button>
                </div>
            </div>
            <div class="dashboard-card">
                <div class="card-header"><h3>Team Performance</h3></div>
                <div class="card-content">
                    <p>This section will provide insights into team productivity and performance metrics.</p>
                    <p><strong>Feature coming soon.</strong></p>
                    <button class="btn btn-primary" disabled>Generate Performance Report</button>
                </div>
            </div>
        </div>
    `;
    dashboardContent.innerHTML = reportsHtml;
}

function viewTeamMember(userId) {
    const user = mockData.users.find(u => u.id === userId);
    if (!user) {
        showToast('User not found', 'error');
        return;
    }
    const userLeaves = mockData.leaveRequests.filter(r => r.employeeName === user.name);
    const content = `
        <h4>${user.name}</h4>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Role:</strong> ${user.role}</p>
        <p><strong>Status:</strong> ${user.status}</p>
        <h5>Leave History</h5>
        ${userLeaves.length > 0 ? `
            <ul>
                ${userLeaves.map(l => `<li>${l.type}: ${l.startDate} to ${l.endDate} - <strong>${l.status}</strong></li>`).join('')}
            </ul>
        ` : '<p>No leave requests found.</p>'}
    `;
    showModal('Team Member Details', content);
}

function approveLeave(leaveId) {
    const request = mockData.leaveRequests.find(r => r.id === leaveId);
    if (request) {
        request.status = 'approved';
        showToast('Leave request approved.', 'success');
        showLeaveRequests();
    }
}

function rejectLeave(leaveId) {
    const request = mockData.leaveRequests.find(r => r.id === leaveId);
    if (request) {
        request.status = 'rejected';
        showToast('Leave request rejected.', 'error');
        showLeaveRequests();
    }
}

function viewLeave(leaveId) {
    const request = mockData.leaveRequests.find(r => r.id === leaveId);
    if (!request) {
        showToast('Leave request not found.', 'error');
        return;
    }
    const content = `
        <p><strong>Employee:</strong> ${request.employeeName}</p>
        <p><strong>Type:</strong> ${request.type}</p>
        <p><strong>Dates:</strong> ${request.startDate} to ${request.endDate}</p>
        <p><strong>Days:</strong> ${request.days}</p>
        <p><strong>Reason:</strong> ${request.reason || 'N/A'}</p>
        <p><strong>Status:</strong> <span class="status-badge status-${request.status}">${request.status}</span></p>
    `;
    showModal('Leave Request Details', content);
}

function generateReport(type) {
    if (type === 'leave') {
        const reportData = mockData.leaveRequests.map(r => ({
            Employee: r.employeeName,
            Type: r.type,
            StartDate: r.startDate,
            EndDate: r.endDate,
            Status: r.status
        }));
        const csvContent = "data:text/csv;charset=utf-8," + 
            Object.keys(reportData[0]).join(",") + "\n" +
            reportData.map(e => Object.values(e).join(",")).join("\n");
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "leave_report.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('Leave report generated.', 'success');
    } else {
        showToast('This report type is not available yet.', 'info');
    }
}

function showModal(title, content) {
    // A simple modal implementation
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    modalOverlay.style.display = 'flex';
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    
    modal.innerHTML = `
        <div class="modal-header"><h3>${title}</h3></div>
        <div class="modal-body">${content}</div>
        <div class="modal-footer">
            <button class="btn btn-primary" id="closeModalBtn">Close</button>
        </div>
    `;
    
    modalOverlay.appendChild(modal);
    document.body.appendChild(modalOverlay);
    
    document.getElementById('closeModalBtn').addEventListener('click', () => {
        document.body.removeChild(modalOverlay);
    });
}


// Permission checking
function hasPermission(requiredRole) {
    if (requiredRole === 'admin') {
        return currentRole === 'admin';
    } else if (requiredRole === 'manager') {
        return currentRole === 'admin' || currentRole === 'manager';
    } else if (requiredRole === 'employee') {
        return currentRole === 'employee' || currentRole === 'manager' || currentRole === 'admin';
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
        if (response && response.data) {
            mockData.users = response.data;
        }
    } catch (error) {
        console.error('Error refreshing users:', error);
    }
}

async function refreshLeaveRequestsFromAPI() {
    try {
        const response = await apiCall('/leave-requests', 'GET');
        if (response && response.data) {
            mockData.leaveRequests = response.data;
        }
    } catch (error) {
        console.error('Error refreshing leave requests:', error);
    }
}

async function refreshSystemLogsFromAPI() {
    try {
        const response = await apiCall('/system-logs', 'GET');
        if (response && response.data) {
            mockData.systemLogs = response.data;
        }
    } catch (error) {
        console.error('Error refreshing system logs:', error);
    }
}

function handleProfileUpdate(event) {
    event.preventDefault();
    const firstName = document.getElementById('profileFirstName').value;
    const lastName = document.getElementById('profileLastName').value;
    const newName = `${firstName} ${lastName}`;

    if (currentUser.name !== newName) {
        currentUser.name = newName;
        demoUsers[currentUser.email].name = newName;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        document.getElementById('userName').textContent = newName;
        showToast('Profile updated successfully!', 'success');
    } else {
        showToast('No changes to save.', 'info');
    }
}

function handleChangePassword(event) {
    event.preventDefault();
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;

    if (currentPassword !== demoUsers[currentUser.email].password) {
        showToast('Incorrect current password.', 'error');
        return;
    }
    if (newPassword !== confirmNewPassword) {
        showToast('New passwords do not match.', 'error');
        return;
    }
    if (newPassword.length < 6) {
        showToast('Password must be at least 6 characters long.', 'error');
        return;
    }

    demoUsers[currentUser.email].password = newPassword;
    showToast('Password changed successfully!', 'success');
    event.target.reset();
}

function handleNewLeaveRequest(event) {
    event.preventDefault();
    const leaveType = document.getElementById('leaveType').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const reason = document.getElementById('leaveReason').value;

    if (!startDate || !endDate || new Date(startDate) > new Date(endDate)) {
        showToast('Invalid date range.', 'error');
        return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const newRequest = {
        id: mockData.leaveRequests.length + 1,
        userId: 3, // Hardcoded for Bob Employee demo
        employeeName: currentUser.name,
        type: leaveType,
        startDate: startDate,
        endDate: endDate,
        days: diffDays,
        reason: reason,
        status: 'pending'
    };

    mockData.leaveRequests.push(newRequest);
    showToast('Leave request submitted successfully!', 'success');
    showMyLeaveRequests(); // Refresh the view
}

function showAddUser() {
    if (!hasPermission('admin')) {
        showAccessDenied();
        return;
    }
    const dashboardContent = document.getElementById('dashboardContent');
    const addUserHtml = `
        <div class="user-form-container">
            <div class="dashboard-card">
                <div class="card-header">
                    <i class="fas fa-plus"></i>
                    <h3>Add New User</h3>
                </div>
                <div class="card-content">
                    <form id="addUserForm">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="newUserName">Name</label>
                                <input type="text" id="newUserName" required>
                            </div>
                            <div class="form-group">
                                <label for="newUserEmail">Email</label>
                                <input type="email" id="newUserEmail" required>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="newUserPassword">Password</label>
                                <input type="password" id="newUserPassword" required>
                            </div>
                            <div class="form-group">
                                <label for="newUserRole">Role</label>
                                <select id="newUserRole" required>
                                    <option value="admin">Admin</option>
                                    <option value="manager">Manager</option>
                                    <option value="employee">Employee</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="newUserDepartment">Department</label>
                            <input type="text" id="newUserDepartment" required>
                        </div>
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-plus"></i>
                            Add User
                        </button>
                    </form>
                </div>
            </div>
        </div>
    `;
    dashboardContent.innerHTML = addUserHtml;

    document.getElementById('addUserForm').addEventListener('submit', function(event) {
        event.preventDefault();
        const name = document.getElementById('newUserName').value;
        const email = document.getElementById('newUserEmail').value;
        const password = document.getElementById('newUserPassword').value;
        const role = document.getElementById('newUserRole').value;
        const department = document.getElementById('newUserDepartment').value;

        // Basic validation
        if (demoUsers[email]) {
            showToast('User already exists', 'error');
            return;
        }

        const newUser = {
            email: email,
            password: password,
            role: role,
            name: name,
            department: department
        };

        demoUsers[email] = newUser;
        showToast('User added successfully!', 'success');
        showUsers(); // Refresh user list
    });
}

// API call simulation
function apiCall(endpoint, method, data) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve({ success: true, data: [] });
        }, 1000);
    });
}
