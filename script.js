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
} // close initializeDarkMode

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
    
    // Initialize CAPTCHA after page is shown
    setTimeout(() => {
        initializeCaptcha();
    }, 100);
}

function showLoginPage() {
    console.log('Showing login page');
    hideAllPages();
    document.getElementById('loginPage').style.display = 'block';
    
    // Initialize CAPTCHA after page is shown
    setTimeout(() => {
        initializeCaptcha();
    }, 100);
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
    // Initialize CAPTCHA system
    initializeCaptcha();
    
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

    // Validate CAPTCHA first
    if (!validateCaptcha(true)) {
        return;
    }

    // --- Login Cooldown Logic ---
    const COOLDOWN_ATTEMPTS = 3;
    const COOLDOWN_MINUTES = 5;
    const COOLDOWN_KEY = 'loginCooldownUntil';
    const ATTEMPTS_KEY = 'loginFailedAttempts';
    const now = Date.now();
    const cooldownUntil = parseInt(localStorage.getItem(COOLDOWN_KEY) || '0', 10);
    if (cooldownUntil && now < cooldownUntil) {
        const secondsLeft = Math.ceil((cooldownUntil - now) / 1000);
        const min = Math.floor(secondsLeft / 60);
        const sec = secondsLeft % 60;
        showToast(`Too many failed attempts. Please try again after ${min}m ${sec < 10 ? '0' : ''}${sec}s.`, 'error');
        return;
    }

    const formData = new FormData(event.target);
    const email = formData.get('email');
    const password = formData.get('password');

    console.log('Login attempt:', email);

    // Check demo users
    const user = demoUsers[email];
    if (user && user.password === password) {
        // Reset failed attempts and cooldown
        localStorage.removeItem(ATTEMPTS_KEY);
        localStorage.removeItem(COOLDOWN_KEY);
        currentUser = user;
        currentRole = user.role;
        // Save to localStorage
        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem('currentRole', user.role);
        showToast(`Welcome back, ${user.name}!`, 'success');
        showDashboardPage();
    } else {
        // Failed login attempt
        let attempts = parseInt(localStorage.getItem(ATTEMPTS_KEY) || '0', 10) + 1;
        if (attempts >= COOLDOWN_ATTEMPTS) {
            const cooldownTime = now + COOLDOWN_MINUTES * 60 * 1000;
            localStorage.setItem(COOLDOWN_KEY, cooldownTime.toString());
            localStorage.setItem(ATTEMPTS_KEY, '0');
            showToast(`Too many failed attempts. Please try again after ${COOLDOWN_MINUTES}m 00s.`, 'error');
        } else {
            localStorage.setItem(ATTEMPTS_KEY, attempts.toString());
            showToast('Invalid email or password', 'error');
        }
    }
}

// Handle register form submission
function handleRegister(event) {
    event.preventDefault();
    
    // Validate CAPTCHA first
    if (!validateCaptcha(false)) {
        return;
    }
    
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

    // Registration successful
    showToast('Registration successful! Please login.', 'success');
    showLoginPage();
}

// Setup dashboard based on user role
// Track the current nav index for active highlight
let currentNavIndex = 0;
function setupDashboard(activeIndex = 0) {
    if (!currentUser || !currentRole) {
        showHomePage();
        return;
    }
    currentNavIndex = activeIndex;
    // Update navigation
    setupNavigation();
    setActiveNavLink(currentNavIndex);
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
    setupDashboard(0);
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
    
    setupNavigation();
    setActiveNavLink(1);
    currentNavIndex = 1;
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
    
    setupNavigation();
    setActiveNavLink(2);
    currentNavIndex = 2;
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
    
    setupNavigation();
    // For admin: Dashboard(0), Users(1), System Logs(2), Leave Requests(3), Reports(4)
    // For manager: Dashboard(0), Team(1), Leave Requests(2), Reports(3)
    let idx = 3;
    if (currentRole === 'manager') idx = 2;
    setActiveNavLink(idx);
    currentNavIndex = idx;
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
                                    <button class="btn btn-success btn-sm" onclick="approveLeave(${request.id})"><i class="fas fa-check"></i> Approve</button>
                                    <button class="btn btn-danger btn-sm" onclick="rejectLeave(${request.id})"><i class="fas fa-times"></i> Reject</button>
                                ` : ''}
                                <button class="btn btn-secondary btn-sm" onclick="viewLeave(${request.id})"><i class="fas fa-eye"></i> View</button>
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
    setupNavigation();
    setActiveNavLink(1);
    currentNavIndex = 1;
    // Show a table of all employees (role: employee)
    const dashboardContent = document.getElementById('dashboardContent');
    if (!dashboardContent) return;
    const employees = mockData.users.filter(u => u.role === 'employee');
    dashboardContent.innerHTML = `
        <div class="table-container">
            <div class="table-header">
                <h3>Team Members</h3>
                <button class="btn btn-primary btn-sm" onclick="showAddUser()">
                    <i class="fas fa-plus"></i> Add Employee
                </button>
            </div>
            <table class="table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${employees.length === 0 ? `<tr><td colspan='4' style='text-align:center;'>No employees found.</td></tr>` : employees.map(user => `
                        <tr>
                            <td>${user.name}</td>
                            <td>${user.email}</td>
                            <td><span class="status-badge status-${user.status}">${user.status}</span></td>
                            <td>
                                <button class="btn btn-secondary btn-sm" onclick="editUser(${user.id})"><i class="fas fa-edit"></i> Edit</button>
                                <button class="btn btn-danger btn-sm" onclick="deleteUser(${user.id})"><i class="fas fa-trash"></i> Delete</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function showReports() {
    setupNavigation();
    // For admin: Dashboard(0), Users(1), System Logs(2), Leave Requests(3), Reports(4)
    // For manager: Dashboard(0), Team(1), Leave Requests(2), Reports(3)
    let idx = 4;
    if (currentRole === 'manager') idx = 3;
    setActiveNavLink(idx);
    currentNavIndex = idx;
    const dashboardContent = document.getElementById('dashboardContent');
    if (!dashboardContent) return;

    // For manager, show only team and leave stats, with enhanced visuals
    if (currentRole === 'manager') {
        // Manager-specific report: show team and leave stats with a unique UI and horizontal bar chart
        const teamMembers = mockData.users.filter(u => u.role === 'employee');
        const teamCount = teamMembers.length;
        const pendingLeaves = mockData.leaveRequests.filter(r => r.status === 'pending').length;
        const approvedLeaves = mockData.leaveRequests.filter(r => r.status === 'approved').length;
        const rejectedLeaves = mockData.leaveRequests.filter(r => r.status === 'rejected').length;
        const totalLeaves = mockData.leaveRequests.length;
        const leaveData = [
            { label: 'Pending', value: pendingLeaves, color: 'var(--warning-color)' },
            { label: 'Approved', value: approvedLeaves, color: 'var(--success-color)' },
            { label: 'Rejected', value: rejectedLeaves, color: 'var(--danger-color)' }
        ];
        const maxValue = Math.max(...leaveData.map(d => d.value), 1);
        function horizontalBar(val, max, color) {
            const percent = (val / max) * 100;
            return `<div style="background:var(--bg-secondary);border-radius:6px;height:28px;display:flex;align-items:center;margin-bottom:12px;">
                <div style="height:100%;width:${percent}%;background:${color};border-radius:6px 0 0 6px;transition:width .5s;"></div>
                <div style="position:absolute;margin-left:12px;font-weight:600;color:var(--text-primary);">${val}</div>
            </div>`;
        }
        dashboardContent.innerHTML = `
            <div class="manager-report" style="max-width:900px;margin:0 auto;">
                <h2 style="margin-bottom:18px;text-align:left;color:var(--primary-color);font-size:2rem;">Team Insights</h2>
                <div style="display:flex;gap:32px;flex-wrap:wrap;align-items:flex-start;">
                    <div style="flex:2;min-width:320px;background:var(--bg-primary);border-radius:12px;padding:28px 24px;box-shadow:0 2px 8px #0001;">
                        <h3 style="margin-bottom:18px;color:var(--primary-color);font-size:1.2rem;">Leave Status (All Employees)</h3>
                        <div style="position:relative;">
                            ${leaveData.map(d => `
                                <div style="display:flex;align-items:center;gap:16px;position:relative;">
                                    <span style="width:90px;display:inline-block;font-weight:500;">${d.label}</span>
                                    <div style="flex:1;position:relative;">${horizontalBar(d.value, maxValue, d.color)}</div>
                                </div>
                            `).join('')}
                        </div>
                        <div style="margin-top:18px;text-align:right;">
                            <button class="btn btn-primary btn-sm" onclick="generateReport()">
                                <i class="fas fa-download"></i> Download Leave Report (CSV)
                            </button>
                        </div>
                    </div>
                    <div style="flex:1;min-width:220px;background:var(--bg-secondary);border-radius:12px;padding:24px 18px;box-shadow:0 1px 4px #0001;">
                        <h3 style="margin-bottom:14px;color:var(--primary-color);font-size:1.1rem;">Team Members</h3>
                        <ul style="list-style:none;padding:0;margin:0;">
                            ${teamMembers.map(u => `
                                <li style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
                                    <div style="width:32px;height:32px;background:var(--bg-primary);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.1rem;color:var(--primary-color);">
                                        <i class="fas fa-user"></i>
                                    </div>
                                    <div style="flex:1;">
                                        <div style="font-weight:500;">${u.name}</div>
                                        <div style="font-size:12px;color:var(--text-secondary);">${u.email}</div>
                                    </div>
                                    <span class="status-badge status-${u.status}">${u.status}</span>
                                </li>
                            `).join('')}
                        </ul>
                        <div style="margin-top:18px;text-align:right;">
                            <span style="font-size:13px;color:var(--text-secondary);">Total: <b>${teamCount}</b></span>
                        </div>
                    </div>
                </div>
                <div style="background:var(--bg-secondary);border-radius:10px;padding:18px 16px;margin:32px 0 18px 0;box-shadow:0 1px 4px #0001;">
                    <h3 style="margin-bottom:12px;color:var(--primary-color);">Recent System Activity</h3>
                    <ul style="margin:8px 0 0 18px;">
                        ${mockData.systemLogs.slice(0,7).map(log => `<li>${log.timestamp}: <b>${log.action}</b> by <span style='color:var(--primary-color);'>${log.user}</span> <span class='status-badge status-${log.status}'>${log.status}</span></li>`).join('')}
                    </ul>
                </div>
                <div style="text-align:right;">
                    <button class="btn btn-primary btn-sm" onclick="exportLogs()">
                        <i class="fas fa-download"></i> Download System Logs (CSV)
                    </button>
                </div>
            </div>
        `;
    } else {
        // Enhanced Admin report
        const adminCount = mockData.users.filter(u => u.role === 'admin').length;
        const managerCount = mockData.users.filter(u => u.role === 'manager').length;
        const employeeCount = mockData.users.filter(u => u.role === 'employee').length;
        const totalLeaves = mockData.leaveRequests.length;
        const pendingLeaves = mockData.leaveRequests.filter(r => r.status === 'pending').length;
        const approvedLeaves = mockData.leaveRequests.filter(r => r.status === 'approved').length;
        const rejectedLeaves = mockData.leaveRequests.filter(r => r.status === 'rejected').length;
        const maxBar = Math.max(pendingLeaves, approvedLeaves, rejectedLeaves, 1);
        function bar(width, color) {
            return `<div style="height:18px;background:${color};width:${width}%;border-radius:4px;"></div>`;
        }
        dashboardContent.innerHTML = `
            <div class="report-summary" style="max-width:800px;margin:0 auto;">
                <h2 style="margin-bottom:24px;text-align:center;color:var(--primary-color);font-size:2rem;">System Reports & Analytics</h2>
                <div style="display:flex;gap:24px;flex-wrap:wrap;justify-content:space-between;margin-bottom:32px;">
                    <div style="flex:1;min-width:180px;background:var(--bg-secondary);border-radius:10px;padding:20px;box-shadow:0 2px 8px #0001;text-align:center;">
                        <div style="font-size:2.2rem;font-weight:700;color:var(--primary-color);">${adminCount}</div>
                        <div style="font-size:1rem;color:var(--text-secondary);">Admins</div>
                    </div>
                    <div style="flex:1;min-width:180px;background:var(--bg-secondary);border-radius:10px;padding:20px;box-shadow:0 2px 8px #0001;text-align:center;">
                        <div style="font-size:2.2rem;font-weight:700;color:var(--success-color);">${managerCount}</div>
                        <div style="font-size:1rem;color:var(--text-secondary);">Managers</div>
                    </div>
                    <div style="flex:1;min-width:180px;background:var(--bg-secondary);border-radius:10px;padding:20px;box-shadow:0 2px 8px #0001;text-align:center;">
                        <div style="font-size:2.2rem;font-weight:700;color:var(--warning-color);">${employeeCount}</div>
                        <div style="font-size:1rem;color:var(--text-secondary);">Employees</div>
                    </div>
                    <div style="flex:1;min-width:180px;background:var(--bg-secondary);border-radius:10px;padding:20px;box-shadow:0 2px 8px #0001;text-align:center;">
                        <div style="font-size:2.2rem;font-weight:700;color:var(--danger-color);">${totalLeaves}</div>
                        <div style="font-size:1rem;color:var(--text-secondary);">Total Leave Requests</div>
                    </div>
                </div>
                <div style="background:var(--bg-primary);border-radius:10px;padding:24px 18px;margin-bottom:32px;box-shadow:0 2px 8px #0001;">
                    <h3 style="margin-bottom:18px;color:var(--primary-color);">Leave Status Overview</h3>
                    <div style="margin-bottom:18px;display:flex;align-items:center;gap:18px;">
                        <div style="width:120px;">Pending</div>
                        <div style="flex:1;">${bar((pendingLeaves/maxBar)*100, 'var(--warning-color)')}</div>
                        <div style="width:40px;text-align:right;">${pendingLeaves}</div>
                    </div>
                    <div style="margin-bottom:18px;display:flex;align-items:center;gap:18px;">
                        <div style="width:120px;">Approved</div>
                        <div style="flex:1;">${bar((approvedLeaves/maxBar)*100, 'var(--success-color)')}</div>
                        <div style="width:40px;text-align:right;">${approvedLeaves}</div>
                    </div>
                    <div style="margin-bottom:18px;display:flex;align-items:center;gap:18px;">
                        <div style="width:120px;">Rejected</div>
                        <div style="flex:1;">${bar((rejectedLeaves/maxBar)*100, 'var(--danger-color)')}</div>
                        <div style="width:40px;text-align:right;">${rejectedLeaves}</div>
                    </div>
                    <button class="btn btn-primary btn-sm" onclick="generateReport()" style="margin-top:10px;">
                        <i class="fas fa-download"></i> Download Leave Report (CSV)
                    </button>
                </div>
                <div style="background:var(--bg-secondary);border-radius:10px;padding:18px 16px;margin-bottom:24px;box-shadow:0 1px 4px #0001;">
                    <h3 style="margin-bottom:12px;color:var(--primary-color);">Recent System Activity</h3>
                    <ul style="margin:8px 0 0 18px;">
                        ${mockData.systemLogs.slice(0,7).map(log => `<li>${log.timestamp}: <b>${log.action}</b> by <span style='color:var(--primary-color);'>${log.user}</span> <span class='status-badge status-${log.status}'>${log.status}</span></li>`).join('')}
                    </ul>
                </div>
                <div style="text-align:right;">
                    <button class="btn btn-primary btn-sm" onclick="exportLogs()">
                        <i class="fas fa-download"></i> Download System Logs (CSV)
                    </button>
                </div>
            </div>
        `;
    }
}

function showProfile() {
    setupNavigation();
    setActiveNavLink(1);
    currentNavIndex = 1;
    // Show profile management form for the current user
    const dashboardContent = document.getElementById('dashboardContent');
    if (!dashboardContent || !currentUser) return;
    dashboardContent.innerHTML = `
        <div class="form-container" style="max-width: 500px; margin: 0 auto;">
            <div class="form-header">
                <h3>Edit Profile</h3>
                <p>Update your personal information</p>
            </div>
            <form id="editProfileForm" style="background: var(--bg-primary); padding: 24px; border-radius: 8px; box-shadow: var(--shadow-light); border: 1px solid var(--border-color);">
                <div class="form-group" style="margin-bottom: 16px;">
                    <label for="profileName" style="display: block; margin-bottom: 6px; font-weight: 500;">Full Name</label>
                    <input type="text" id="profileName" name="name" value="${currentUser.name}" required style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 4px; font-size: 14px;">
                </div>
                <div class="form-group" style="margin-bottom: 16px;">
                    <label for="profileEmail" style="display: block; margin-bottom: 6px; font-weight: 500;">Email</label>
                    <input type="email" id="profileEmail" name="email" value="${currentUser.email}" required style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 4px; font-size: 14px;" disabled>
                </div>
                <div class="form-group" style="margin-bottom: 16px;">
                    <label for="profileDepartment" style="display: block; margin-bottom: 6px; font-weight: 500;">Department</label>
                    <input type="text" id="profileDepartment" name="department" value="${currentUser.department || ''}" required style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 4px; font-size: 14px;">
                </div>
                <div class="form-actions" style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px;">
                    <button type="button" class="btn btn-secondary" onclick="setupDashboard()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Save Changes</button>
                </div>
            </form>
        </div>
    `;
    document.getElementById('editProfileForm').addEventListener('submit', handleEditProfile);
}

function handleEditProfile(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const updatedName = formData.get('name');
    const updatedDepartment = formData.get('department');
    if (!updatedName || !updatedDepartment) {
        showToast('Please fill all fields', 'error');
        return;
    }
    currentUser.name = updatedName;
    currentUser.department = updatedDepartment;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    showToast('Profile updated successfully!', 'success');
    setupDashboard();
}

function showMyLeaveRequests() {
    setupNavigation();
    // For employee: Dashboard(0), Profile(1), My Leaves(2)
    let idx = 2;
    if (currentRole === 'manager') idx = 3; // Defensive, but manager shouldn't see this
    setActiveNavLink(idx);
    currentNavIndex = idx;
    // Show user's leave requests and allow new leave request
    const dashboardContent = document.getElementById('dashboardContent');
    if (!dashboardContent || !currentUser) return;
    const userId = mockData.users.find(u => u.email === currentUser.email)?.id;
    const userLeaves = mockData.leaveRequests.filter(r => r.userId === userId);
    dashboardContent.innerHTML = `
        <div class="table-container">
            <div class="table-header">
                <h3>My Leave Requests</h3>
                <button class="btn btn-primary btn-sm" onclick="showNewLeaveRequestForm()">
                    <i class='fas fa-plus'></i> New Leave Request
                </button>
            </div>
            <table class="table">
                <thead>
                    <tr>
                        <th>Type</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                        <th>Days</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${userLeaves.length === 0 ? `<tr><td colspan='5' style='text-align:center;'>No leave requests found.</td></tr>` : userLeaves.map(request => `
                        <tr>
                            <td style="text-transform: capitalize;">${request.type}</td>
                            <td>${request.startDate}</td>
                            <td>${request.endDate}</td>
                            <td>${request.days}</td>
                            <td><span class="status-badge status-${request.status}">${request.status}</span></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function showNewLeaveRequestForm() {
    const dashboardContent = document.getElementById('dashboardContent');
    if (!dashboardContent || !currentUser) return;
    dashboardContent.innerHTML = `
        <div class="form-container" style="max-width: 500px; margin: 0 auto;">
            <div class="form-header">
                <h3>Request New Leave</h3>
                <p>Submit a new leave request</p>
            </div>
            <form id="newLeaveRequestForm" style="background: var(--bg-primary); padding: 24px; border-radius: 8px; box-shadow: var(--shadow-light); border: 1px solid var(--border-color);">
                <div class="form-group" style="margin-bottom: 16px;">
                    <label for="leaveType" style="display: block; margin-bottom: 6px; font-weight: 500;">Leave Type</label>
                    <select id="leaveType" name="type" required style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 4px; font-size: 14px;">
                        <option value="">Select Type</option>
                        <option value="vacation">Vacation</option>
                        <option value="sick">Sick</option>
                        <option value="personal">Personal</option>
                    </select>
                </div>
                <div class="form-group" style="margin-bottom: 16px;">
                    <label for="startDate" style="display: block; margin-bottom: 6px; font-weight: 500;">Start Date</label>
                    <input type="date" id="startDate" name="startDate" required style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 4px; font-size: 14px;">
                </div>
                <div class="form-group" style="margin-bottom: 16px;">
                    <label for="endDate" style="display: block; margin-bottom: 6px; font-weight: 500;">End Date</label>
                    <input type="date" id="endDate" name="endDate" required style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 4px; font-size: 14px;">
                </div>
                <div class="form-group" style="margin-bottom: 16px;">
                    <label for="reason" style="display: block; margin-bottom: 6px; font-weight: 500;">Reason</label>
                    <textarea id="reason" name="reason" rows="2" required style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 4px; font-size: 14px;"></textarea>
                </div>
                <div class="form-actions" style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px;">
                    <button type="button" class="btn btn-secondary" onclick="showMyLeaveRequests()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Submit Request</button>
                </div>
            </form>
        </div>
    `;
    document.getElementById('newLeaveRequestForm').addEventListener('submit', handleNewLeaveRequest);
}

function handleNewLeaveRequest(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const type = formData.get('type');
    const startDate = formData.get('startDate');
    const endDate = formData.get('endDate');
    const reason = formData.get('reason');
    const userId = mockData.users.find(u => u.email === currentUser.email)?.id;
    if (!type || !startDate || !endDate || !reason || !userId) {
        showToast('Please fill all fields', 'error');
        return;
    }
    // Calculate days
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
    if (days <= 0) {
        showToast('End date must be after start date', 'error');
        return;
    }
    // Add to mockData
    mockData.leaveRequests.push({
        id: Math.max(0, ...mockData.leaveRequests.map(r => r.id)) + 1,
        userId,
        employeeName: currentUser.name,
        type,
        startDate,
        endDate,
        days,
        reason,
        status: 'pending'
    });
    showToast('Leave request submitted!', 'success');
    showMyLeaveRequests();
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
    // Remove any existing toast (so only one is ever visible)
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = type === 'success' ? 'fa-check-circle' : 
                 type === 'error' ? 'fa-exclamation-circle' :
                 type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle';
    toast.innerHTML = `
        <i class="fas ${icon}"></i>
        <span>${message}</span>
        <button class="toast-close" style="background:none;border:none;position:absolute;top:8px;right:12px;font-size:18px;color:inherit;cursor:pointer;">&times;</button>
    `;
    // Dismiss on click (anywhere on toast or close button)
    toast.addEventListener('click', () => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
    });
    toast.querySelector('.toast-close').addEventListener('click', (e) => {
        e.stopPropagation();
        if (toast.parentNode) toast.parentNode.removeChild(toast);
    });
    container.appendChild(toast);
    // No auto-remove: stays until user clicks
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
    // Show leave request details in a modal or inline
    const request = mockData.leaveRequests.find(r => r.id === requestId);
    if (!request) {
        showToast('Leave request not found!', 'error');
        return;
    }
    // Simple modal implementation
    let modal = document.getElementById('leaveDetailsModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'leaveDetailsModal';
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100vw';
        modal.style.height = '100vh';
        modal.style.background = 'rgba(0,0,0,0.35)';
        modal.style.display = 'flex';
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';
        modal.style.zIndex = '9999';
        document.body.appendChild(modal);
    }
    modal.innerHTML = `
        <div style="background: var(--bg-primary); color: var(--text-primary); border-radius:10px; box-shadow:0 8px 32px rgba(0,0,0,0.18); padding:32px 24px 24px 24px; min-width:320px; max-width:350px; margin:0 auto; position:relative;">
            <span style="position:absolute;top:12px;right:18px;color: var(--text-secondary);font-size:24px;cursor:pointer;z-index:2;" onclick="document.getElementById('leaveDetailsModal').remove()">&times;</span>
            <h3 style="margin-bottom:12px; color: var(--text-primary);">Leave Request Details</h3>
            <div><strong>Employee:</strong> <span style='color:var(--text-secondary);'>${request.employeeName}</span></div>
            <div><strong>Type:</strong> <span style='color:var(--text-secondary);'>${request.type}</span></div>
            <div><strong>Start Date:</strong> <span style='color:var(--text-secondary);'>${request.startDate}</span></div>
            <div><strong>End Date:</strong> <span style='color:var(--text-secondary);'>${request.endDate}</span></div>
            <div><strong>Days:</strong> <span style='color:var(--text-secondary);'>${request.days}</span></div>
            <div><strong>Status:</strong> <span class="status-badge status-${request.status}">${request.status}</span></div>
            <div><strong>Reason:</strong> <span style='color:var(--text-secondary);'>${request.reason}</span></div>
            <div style="margin-top:18px;text-align:right;">
                <button class="btn btn-secondary" onclick="document.getElementById('leaveDetailsModal').remove()">Close</button>
            </div>
        </div>
    `;
    modal.style.display = 'flex';
}

function generateReport() {
    // Export leave requests as CSV
    const headers = ['Employee', 'Type', 'Start Date', 'End Date', 'Days', 'Status', 'Reason'];
    const rows = mockData.leaveRequests.map(r => [r.employeeName, r.type, r.startDate, r.endDate, r.days, r.status, r.reason]);
    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
        csv += row.map(field => '"' + String(field).replace(/"/g, '""') + '"').join(',') + '\n';
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'leave_requests_report.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Leave requests exported as CSV!', 'success');
}

function exportLogs() {
    // Export system logs as CSV
    const headers = ['Timestamp', 'Action', 'User', 'Status'];
    const rows = mockData.systemLogs.map(log => [log.timestamp, log.action, log.user, log.status]);
    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
        csv += row.map(field => '"' + String(field).replace(/"/g, '""') + '"').join(',') + '\n';
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'system_logs.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('System logs exported as CSV!', 'success');
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

// Make navigation and event handler functions globally accessible for HTML onclick and DOMContentLoaded
window.showRegisterPage = showRegisterPage;
window.showLoginPage = showLoginPage;
window.demoLogin = demoLogin;
window.setupEventListeners = setupEventListeners;
// Expose additional navigation functions for inline handlers
window.showHomePage = showHomePage;
window.showDashboardPage = showDashboardPage;
window.setupDashboard = setupDashboard;

// CAPTCHA System Implementation
let currentTextCaptcha = '';
let currentLoginTextCaptcha = '';
let currentImageCaptcha = [];
let currentLoginImageCaptcha = [];
let selectedImages = [];
let selectedLoginImages = [];

// CAPTCHA Categories and Images
const captchaCategories = {
    cars: {
        name: 'cars',
        images: [
            'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=200&h=200&fit=crop',
            'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=200&h=200&fit=crop',
            'https://images.unsplash.com/photo-1580414159825-971b7ac6b96e?w=200&h=200&fit=crop',
            'https://images.unsplash.com/photo-1514316454349-750a7fd3da3a?w=200&h=200&fit=crop'
        ]
    },
    animals: {
        name: 'animals',
        images: [
            'https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?w=200&h=200&fit=crop',
            'https://images.unsplash.com/photo-1552053831-71594a27632d?w=200&h=200&fit=crop',
            'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=200&h=200&fit=crop',
            'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=200&h=200&fit=crop'
        ]
    },
    nature: {
        name: 'nature',
        images: [
            'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=200&fit=crop',
            'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=200&h=200&fit=crop',
            'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=200&h=200&fit=crop',
            'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=200&h=200&fit=crop'
        ]
    },
    buildings: {
        name: 'buildings',
        images: [
            'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=200&h=200&fit=crop',
            'https://images.unsplash.com/photo-1551806235-a05dd14d9fb9?w=200&h=200&fit=crop',
            'https://images.unsplash.com/photo-1595107616188-0c9908c8b9a7?w=200&h=200&fit=crop',
            'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?w=200&h=200&fit=crop'
        ]
    }
};

// Distractor images (non-category images)
const distractorImages = [
    'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=200&h=200&fit=crop',
    'https://images.unsplash.com/photo-1517816743773-6e0fd518b4a6?w=200&h=200&fit=crop'
];

// Generate random text CAPTCHA
function generateTextCaptcha() {
    const chars = 'ABCDEFGHIJKLMNPQRSTUVWXYZ123456789';
    let captcha = '';
    for (let i = 0; i < 6; i++) {
        captcha += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    currentTextCaptcha = captcha;
    
    const display = document.getElementById('textCaptchaDisplay');
    if (display) {
        display.textContent = captcha;
        // Add some visual noise
        display.style.transform = `rotate(${Math.random() * 6 - 3}deg)`;
        display.style.background = `linear-gradient(${Math.random() * 360}deg, #f0f0f0, #e0e0e0)`;
    }
    
    // Clear input
    const input = document.getElementById('textCaptchaInput');
    if (input) input.value = '';
}

// Generate random text CAPTCHA for login
function generateLoginTextCaptcha() {
    const chars = 'ABCDEFGHIJKLMNPQRSTUVWXYZ123456789';
    let captcha = '';
    for (let i = 0; i < 6; i++) {
        captcha += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    currentLoginTextCaptcha = captcha;
    
    const display = document.getElementById('loginTextCaptchaDisplay');
    if (display) {
        display.textContent = captcha;
        // Add some visual noise
        display.style.transform = `rotate(${Math.random() * 6 - 3}deg)`;
        display.style.background = `linear-gradient(${Math.random() * 360}deg, #f0f0f0, #e0e0e0)`;
    }
    
    // Clear input
    const input = document.getElementById('loginTextCaptchaInput');
    if (input) input.value = '';
}

// Generate image CAPTCHA
function generateImageCaptcha() {
    const categories = Object.keys(captchaCategories);
    const selectedCategory = categories[Math.floor(Math.random() * categories.length)];
    const categoryData = captchaCategories[selectedCategory];
    
    // Set target text
    const targetText = document.getElementById('imageTargetText');
    if (targetText) targetText.textContent = categoryData.name;
    
    // Select 2-4 correct images
    const correctCount = Math.floor(Math.random() * 3) + 2;
    const correctImages = categoryData.images.slice(0, correctCount);
    
    // Fill remaining slots with distractor images
    const totalImages = 9;
    const distractorCount = totalImages - correctCount;
    const selectedDistractors = [];
    
    for (let i = 0; i < distractorCount; i++) {
        const randomDistractor = distractorImages[Math.floor(Math.random() * distractorImages.length)];
        selectedDistractors.push(randomDistractor);
    }
    
    // Combine and shuffle
    const allImages = [...correctImages, ...selectedDistractors];
    const shuffledImages = allImages.sort(() => Math.random() - 0.5);
    
    // Store correct answers
    currentImageCaptcha = correctImages;
    selectedImages = [];
    
    // Display images
    const grid = document.getElementById('imageCaptchaGrid');
    if (grid) {
        grid.innerHTML = '';
        shuffledImages.forEach((imageSrc, index) => {
            const img = document.createElement('img');
            img.src = imageSrc;
            img.className = 'captcha-image';
            img.dataset.index = index;
            img.dataset.src = imageSrc;
            img.addEventListener('click', () => toggleImageSelection(img, false));
            grid.appendChild(img);
        });
    }
}

// Generate image CAPTCHA for login
function generateLoginImageCaptcha() {
    const categories = Object.keys(captchaCategories);
    const selectedCategory = categories[Math.floor(Math.random() * categories.length)];
    const categoryData = captchaCategories[selectedCategory];
    
    // Set target text
    const targetText = document.getElementById('loginImageTargetText');
    if (targetText) targetText.textContent = categoryData.name;
    
    // Select 2-4 correct images
    const correctCount = Math.floor(Math.random() * 3) + 2;
    const correctImages = categoryData.images.slice(0, correctCount);
    
    // Fill remaining slots with distractor images
    const totalImages = 9;
    const distractorCount = totalImages - correctCount;
    const selectedDistractors = [];
    
    for (let i = 0; i < distractorCount; i++) {
        const randomDistractor = distractorImages[Math.floor(Math.random() * distractorImages.length)];
        selectedDistractors.push(randomDistractor);
    }
    
    // Combine and shuffle
    const allImages = [...correctImages, ...selectedDistractors];
    const shuffledImages = allImages.sort(() => Math.random() - 0.5);
    
    // Store correct answers
    currentLoginImageCaptcha = correctImages;
    selectedLoginImages = [];
    
    // Display images
    const grid = document.getElementById('loginImageCaptchaGrid');
    if (grid) {
        grid.innerHTML = '';
        shuffledImages.forEach((imageSrc, index) => {
            const img = document.createElement('img');
            img.src = imageSrc;
            img.className = 'captcha-image';
            img.dataset.index = index;
            img.dataset.src = imageSrc;
            img.addEventListener('click', () => toggleImageSelection(img, true));
            grid.appendChild(img);
        });
    }
}

// Toggle image selection
function toggleImageSelection(img, isLogin) {
    const selectedArray = isLogin ? selectedLoginImages : selectedImages;
    const imgSrc = img.dataset.src;
    
    if (img.classList.contains('selected')) {
        img.classList.remove('selected');
        const index = selectedArray.indexOf(imgSrc);
        if (index > -1) {
            selectedArray.splice(index, 1);
        }
    } else {
        img.classList.add('selected');
        selectedArray.push(imgSrc);
    }
    
    // Update the array reference
    if (isLogin) {
        selectedLoginImages = selectedArray;
    } else {
        selectedImages = selectedArray;
    }
}

// Validate text CAPTCHA
function validateTextCaptcha(userInput, isLogin = false) {
    const correctCaptcha = isLogin ? currentLoginTextCaptcha : currentTextCaptcha;
    return userInput.toUpperCase() === correctCaptcha.toUpperCase();
}

// Validate image CAPTCHA
function validateImageCaptcha(isLogin = false) {
    const selectedArray = isLogin ? selectedLoginImages : selectedImages;
    const correctArray = isLogin ? currentLoginImageCaptcha : currentImageCaptcha;
    
    // Check if all correct images are selected and no incorrect ones
    if (selectedArray.length !== correctArray.length) {
        return false;
    }
    
    return correctArray.every(correctImg => selectedArray.includes(correctImg));
}

// Setup CAPTCHA tab switching
function setupCaptchaTabs() {
    document.querySelectorAll('.captcha-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const captchaType = this.dataset.captcha;
            const container = this.closest('.captcha-section');
            
            // Update tab active state
            container.querySelectorAll('.captcha-tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Show/hide captcha content
            const isLogin = container.closest('#loginPage') !== null;
            const textCaptchaId = isLogin ? 'loginTextCaptcha' : 'textCaptcha';
            const imageCaptchaId = isLogin ? 'loginImageCaptcha' : 'imageCaptcha';
            
            if (captchaType === 'text') {
                document.getElementById(textCaptchaId).style.display = 'block';
                document.getElementById(imageCaptchaId).style.display = 'none';
            } else {
                document.getElementById(textCaptchaId).style.display = 'none';
                document.getElementById(imageCaptchaId).style.display = 'block';
            }
        });
    });
}

// Validate CAPTCHA before form submission
function validateCaptcha(isLogin = false) {
    const container = document.querySelector(isLogin ? '#loginPage .captcha-section' : '#registerPage .captcha-section');
    const activeTab = container.querySelector('.captcha-tab.active');
    const captchaType = activeTab.dataset.captcha;
    
    if (captchaType === 'text') {
        const inputId = isLogin ? 'loginTextCaptchaInput' : 'textCaptchaInput';
        const userInput = document.getElementById(inputId).value;
        
        if (!userInput.trim()) {
            showToast('Please enter the CAPTCHA text', 'error');
            return false;
        }
        
        if (!validateTextCaptcha(userInput, isLogin)) {
            showToast('CAPTCHA verification failed. Please try again.', 'error');
            if (isLogin) {
                generateLoginTextCaptcha();
            } else {
                generateTextCaptcha();
            }
            return false;
        }
    } else {
        if (!validateImageCaptcha(isLogin)) {
            showToast('CAPTCHA verification failed. Please select the correct images.', 'error');
            if (isLogin) {
                generateLoginImageCaptcha();
            } else {
                generateImageCaptcha();
            }
            return false;
        }
    }
    
    return true;
}

// Initialize CAPTCHA system
function initializeCaptcha() {
    setupCaptchaTabs();
    
    // Generate initial CAPTCHAs
    if (document.getElementById('textCaptchaDisplay')) {
        generateTextCaptcha();
        generateImageCaptcha();
    }
    
    if (document.getElementById('loginTextCaptchaDisplay')) {
        generateLoginTextCaptcha();
        generateLoginImageCaptcha();
    }
}

// Make CAPTCHA functions globally accessible
window.generateTextCaptcha = generateTextCaptcha;
window.generateLoginTextCaptcha = generateLoginTextCaptcha;
window.generateImageCaptcha = generateImageCaptcha;
window.generateLoginImageCaptcha = generateLoginImageCaptcha;
window.validateCaptcha = validateCaptcha;
window.initializeCaptcha = initializeCaptcha;
