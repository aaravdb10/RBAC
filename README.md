# RBAC System - Role-Based Access Control Demo

A comprehensive web application demonstrating Role-Based Access Control (RBAC) with a modern frontend and Python Flask backend.

## 🚀 Features

### Frontend Features
- **Modern Homepage**: Professional landing page with feature showcase
- **Role-Based Dashboards**: Different interfaces for Admin, Manager, and Employee roles
- **Dark Mode Support**: Complete toggle between light and dark themes with persistence
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **User Registration & Login**: Complete authentication flow with demo accounts
- **Admin User Management**: Full CRUD operations for user management
- **Real-time Notifications**: Toast notifications for user feedback

### Backend Features
- **SQLite Database**: Persistent data storage with user management
- **RESTful API**: Complete API for user management and authentication
- **Session Management**: Secure session-based authentication
- **Role-Based Permissions**: API endpoints protected by role requirements
- **User CRUD Operations**: Complete Create, Read, Update, Delete for users
- **Demo Data**: Pre-configured demo accounts for testing

### Security Features
- **Password Hashing**: SHA-256 password encryption
- **Session-based Auth**: Secure session management
- **Role Validation**: Server-side role checking
- **Access Control**: API endpoints protected by permissions
- **Self-Protection**: Users cannot delete themselves or modify their own roles

## 📁 Project Structure

```
RBAC/
├── index.html              # Main HTML file with all pages
├── style.css              # Complete CSS with dark mode support
├── script.js              # JavaScript with full functionality
├── app.py                 # Flask backend server
├── requirements.txt       # Python dependencies
├── start_backend.bat      # Windows startup script
├── rbac_system.db        # SQLite database (created automatically)
├── README.md             # This documentation
├── FINAL_STATUS_REPORT.md # Complete project status
├── STEP1_IMPLEMENTATION.md # Implementation details
└── TESTING_CHECKLIST.md  # Comprehensive testing checklist
```

## 🛠️ Setup Instructions

### Prerequisites
- Python 3.7 or higher
- Modern web browser

### Installation

1. **Clone or download the project files**
   ```bash
   cd RBAC
   ```

2. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Start the backend server**
   
   **Option A: Using the batch file (Windows)**
   ```bash
   start_backend.bat
   ```
   
   **Option B: Manual start**
   ```bash
   python app.py
   ```

4. **Access the application**
   - Open your browser and go to: `http://localhost:5000`
   - The frontend and API are served from the same URL

## 👥 Demo Accounts

The system comes with pre-configured demo accounts for testing:

| Role | Email | Password | Capabilities |
|------|-------|----------|--------------|
| **Admin** | admin@company.com | admin123 | Full system access, user management, all features |
| **Manager** | manager@company.com | manager123 | Team management, reports (role-specific content) |
| **Employee** | employee@company.com | employee123 | Profile management, basic dashboard access |

## 🎯 Role Capabilities

### Administrator
- ✅ View and manage all users (Add, Edit, Delete)
- ✅ Access admin dashboard with user management interface
- ✅ Full system access and configuration
- ✅ Role-specific navigation and content

### Manager
- ✅ Access manager dashboard with team features
- ✅ View manager-specific navigation and content
- ✅ Role-appropriate interface elements
- ❌ Cannot access admin features or user management

### Employee
- ✅ View and access employee dashboard
- ✅ View employee-specific content and navigation
- ✅ Basic profile access
- ❌ Cannot access admin or manager features

## 🔌 API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `GET /api/profile` - Get current user profile

### User Management (Admin only)
- `GET /api/users` - Get all users
- `POST /api/users` - Create new user
- `PUT /api/users/<id>` - Update existing user
- `DELETE /api/users/<id>` - Delete user

## 🎨 Design Features

### Modern UI Components
- **Card-based Layout**: Clean, modern card designs
- **Gradient Backgrounds**: Beautiful gradient color schemes
- **Hover Effects**: Interactive hover animations
- **Icons**: Font Awesome icons throughout
- **Typography**: Inter font family for readability

### Dark Mode Implementation
- **CSS Variables**: Easy theme switching
- **Persistent State**: Theme preference saved to localStorage
- **Smooth Transitions**: Animated theme changes
- **Consistent Contrast**: Proper contrast ratios in both modes

### Responsive Design
- **Mobile-first**: Optimized for mobile devices
- **Flexible Grids**: CSS Grid and Flexbox layouts
- **Breakpoints**: Responsive design for all screen sizes
- **Touch-friendly**: Large tap targets for mobile

## 🔒 Security Implementation

### Frontend Security
- Form validation and sanitization
- Session state management
- Access control for UI components
- Secure logout and session clearing

### Backend Security
- Password hashing with SHA-256
- Session-based authentication
- Role-based authorization decorators
- Input validation and sanitization
- SQL injection prevention
- CORS configuration

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'employee',
    department TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);
```

## 🧪 Testing the Application

### Manual Testing Steps

1. **Homepage Testing**
   - Visit the homepage and test dark mode toggle
   - Click on different role demo buttons (Try Admin Demo, Try Manager Demo, etc.)
   - Test navigation between login and registration pages
   - Verify all buttons and links work correctly

2. **Registration Testing**
   - Create a new account with valid information
   - Test form validation (required fields, email format)
   - Verify successful registration and auto-login

3. **Login Testing**
   - Test with demo accounts (admin/manager/employee)
   - Test with invalid credentials to verify error handling
   - Test password visibility toggle
   - Verify successful login redirects to appropriate dashboard

4. **Role-based Dashboard Testing**
   - Login as different roles and verify appropriate dashboards
   - Test admin user management (Add, Edit, Delete users)
   - Verify role-specific navigation and content
   - Test logout functionality

5. **Dark Mode Testing**
   - Toggle dark mode on all pages
   - Verify theme persistence across page navigation
   - Check readability and contrast in both modes
   - Ensure all components are properly themed

6. **Responsive Design Testing**
   - Test on different screen sizes
   - Verify mobile-friendly layout
   - Check form usability on mobile devices

## 🚀 Deployment Considerations

### For Production Deployment
1. Replace SQLite with PostgreSQL or MySQL
2. Use environment variables for configuration
3. Implement proper password policies
4. Add HTTPS/SSL certificates
5. Use a production WSGI server (Gunicorn, uWSGI)
6. Implement proper logging
7. Add rate limiting and security headers

### Environment Variables
```bash
DATABASE_URL=postgresql://...
SECRET_KEY=your-secret-key
FLASK_ENV=production
```

## 📚 Educational Value

This project demonstrates:
- **Full-stack Development**: Frontend and backend integration
- **Security Best Practices**: Authentication, authorization, and data protection
- **Database Design**: Relational database with proper schema design
- **API Design**: RESTful API with proper HTTP methods and status codes
- **User Experience**: Modern UI/UX design with dark mode and responsive layout
- **Role-based Systems**: Implementation of different user privilege levels
- **CRUD Operations**: Complete Create, Read, Update, Delete functionality
- **Session Management**: Secure user session handling

## 🔧 Troubleshooting

### Common Issues

**1. Backend not starting**
- Check if Python is installed: `python --version`
- Install dependencies: `pip install -r requirements.txt`
- Check if port 5000 is available

**2. Frontend not loading**
- Ensure backend is running on localhost:5000
- Check browser console for errors
- Try opening in incognito/private mode

**3. Database issues**
- Delete `rbac_system.db` file and restart server
- Check file permissions in the project directory

**4. API connection issues**
- Verify CORS settings in Flask app
- Check browser network tab for failed requests
- Ensure API_BASE_URL is correct in script.js

## 🤝 Contributing

This is an educational project demonstrating RBAC implementation. Current features include:
- Complete authentication system
- Role-based dashboards
- Admin user management (CRUD operations)
- Dark mode with full theming
- Responsive design
- Session management

Potential enhancements for learning:
- Add email verification for registration
- Implement JWT authentication
- Add password reset functionality
- Create audit logging system
- Add file upload features
- Implement real-time notifications

## 📄 License

This project is for educational purposes. Feel free to use and modify as needed.

---

**Built with ❤️ for cybersecurity education**
