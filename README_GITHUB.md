# 🛡️ RBAC Web Application

A comprehensive Role-Based Access Control (RBAC) web application demonstrating enterprise-level security concepts with a modern, responsive interface.

![RBAC Demo](https://img.shields.io/badge/Demo-Live-brightgreen)
![Python](https://img.shields.io/badge/Python-3.7+-blue)
![Flask](https://img.shields.io/badge/Flask-2.3.3-lightgrey)
![License](https://img.shields.io/badge/License-MIT-yellow)

## 🎯 Features

### 🔐 Authentication & Security
- **Secure Authentication**: SHA256 password hashing with session management
- **Role-Based Access Control**: Three distinct user roles (Admin, Manager, Employee)
- **Session Management**: Secure user sessions with logout functionality
- **Audit Logging**: Complete audit trail of user actions

### 👥 User Management
- **Admin Dashboard**: Full CRUD operations for user management
- **User Roles**: Dynamic role assignment and permission control
- **Status Management**: Active/inactive user status control
- **Self-Protection**: Users cannot delete themselves or modify critical data

### 🎨 Modern UI/UX
- **Responsive Design**: Mobile-first approach, works on all devices
- **Dark Mode**: Complete theme system with localStorage persistence
- **Professional Interface**: Modern card-based layout with smooth animations
- **Toast Notifications**: Real-time user feedback for all operations

### 🖥️ Dashboard Features
- **Role-Specific Dashboards**: Customized interfaces for each user role
- **Navigation System**: Clean, intuitive navigation with breadcrumbs
- **Demo Accounts**: Pre-configured accounts for testing all features
- **Real-time Updates**: Dynamic content updates without page refresh

## 🚀 Quick Start

### Prerequisites
- Python 3.7 or higher
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/RBAC-Web-Application.git
   cd RBAC-Web-Application
   ```

2. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the application**
   ```bash
   python app.py
   ```
   
   **Or use the Windows batch file:**
   ```bash
   start_backend.bat
   ```

4. **Access the application**
   - Open your browser and navigate to `http://localhost:5000`
   - The application will automatically initialize the database with demo accounts

## 👥 Demo Accounts

Test the application with these pre-configured accounts:

| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| **🔴 Admin** | admin@company.com | admin123 | Full system access, user management |
| **🟡 Manager** | manager@company.com | manager123 | Team management, reports |
| **🟢 Employee** | employee@company.com | employee123 | Personal profile, basic access |

### Quick Demo Links
Click the role demonstration cards on the homepage to instantly login with demo accounts!

## 📂 Project Structure

```
RBAC-Web-Application/
├── 📄 index.html              # Main application interface
├── 🎨 style.css              # Complete styling with dark mode
├── ⚡ script.js              # Frontend JavaScript functionality
├── 🐍 app.py                 # Flask backend with API endpoints
├── 📋 requirements.txt       # Python dependencies
├── 🚀 start_backend.bat      # Windows startup script
├── 📖 README.md             # This documentation
├── 📊 STEP1_IMPLEMENTATION.md # Implementation details
├── ✅ FINAL_STATUS_REPORT.md # Project completion report
├── 🧪 TESTING_CHECKLIST.md  # Testing documentation
└── 🚫 .gitignore            # Git ignore configuration
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - New user registration

### User Management (Admin Only)
- `GET /api/users` - Retrieve all users
- `POST /api/users` - Create new user
- `PUT /api/users/<id>` - Update user information
- `DELETE /api/users/<id>` - Delete user

### Static Files
- `GET /` - Serve main application
- `GET /<filename>` - Serve static assets (CSS, JS, images)

## 🎨 User Interface Features

### 🌙 Dark Mode
- **Toggle Control**: Available on all pages
- **Persistent State**: Theme preference saved to localStorage
- **Smooth Transitions**: Animated theme switching
- **Complete Coverage**: All UI components properly themed

### 📱 Responsive Design
- **Mobile-First**: Optimized for mobile devices
- **Flexible Layouts**: CSS Grid and Flexbox
- **Touch-Friendly**: Large tap targets for mobile
- **Cross-Browser**: Compatible with all modern browsers

### 🔄 Interactive Elements
- **Form Validation**: Real-time input validation
- **Loading States**: Visual feedback during operations
- **Error Handling**: Graceful error display and recovery
- **Success Feedback**: Toast notifications for completed actions

## 🛠️ Technology Stack

### Frontend
- **HTML5**: Semantic markup with accessibility features
- **CSS3**: Modern styling with CSS Grid, Flexbox, and Variables
- **JavaScript (ES6+)**: Vanilla JavaScript for all functionality
- **Font Awesome**: Professional icons throughout
- **Google Fonts**: Inter font family for optimal readability

### Backend
- **Python Flask**: Lightweight web framework
- **SQLite**: File-based database for simplicity
- **Flask-CORS**: Cross-origin resource sharing
- **SHA256**: Password hashing for security

### Architecture
- **Single Page Application**: All functionality in one HTML file
- **RESTful API**: Standard REST endpoints for all operations
- **Session-Based Auth**: Secure session management
- **Responsive Design**: Mobile-first approach

## 🔒 Security Features

### Password Security
- **SHA256 Hashing**: All passwords securely hashed
- **No Plain Text**: Passwords never stored in plain text
- **Session Management**: Secure session handling

### Access Control
- **Role-Based Permissions**: Different access levels per role
- **API Protection**: All endpoints validate user permissions
- **Self-Protection**: Users cannot perform destructive actions on themselves
- **Input Validation**: All user inputs validated and sanitized

### Audit Trail
- **Action Logging**: All user actions logged to database
- **Timestamp Tracking**: Complete audit trail with timestamps
- **User Attribution**: All actions linked to specific users

## 🧪 Testing & Quality

### Comprehensive Testing
- **Manual Testing**: Complete testing checklist included
- **Cross-Browser**: Tested on Chrome, Firefox, Safari, Edge
- **Mobile Testing**: Verified on various mobile devices
- **Role Testing**: All roles thoroughly tested

### Code Quality
- **Clean Architecture**: Well-organized, maintainable code
- **Error Handling**: Comprehensive error handling throughout
- **Documentation**: Complete inline documentation
- **Best Practices**: Following security and development best practices

## 📱 Browser Compatibility

| Browser | Support | Notes |
|---------|---------|-------|
| 🌐 Chrome | ✅ Full | Recommended browser |
| 🦊 Firefox | ✅ Full | Complete compatibility |
| 🧭 Safari | ✅ Full | All features working |
| 🌊 Edge | ✅ Full | Modern Edge versions |

## 🎓 Educational Value

This project demonstrates:

### Web Development Concepts
- **Full-Stack Development**: Complete frontend and backend integration
- **RESTful API Design**: Standard API patterns and practices
- **Responsive Web Design**: Mobile-first development approach
- **Modern JavaScript**: ES6+ features and best practices

### Security Concepts
- **Authentication**: Secure user authentication implementation
- **Authorization**: Role-based access control patterns
- **Session Management**: Secure session handling
- **Input Validation**: Preventing common security vulnerabilities

### Database Design
- **Relational Design**: Proper database schema with relationships
- **Data Integrity**: Foreign keys and constraints
- **Audit Logging**: Complete audit trail implementation

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit your changes** (`git commit -m 'Add some AmazingFeature'`)
4. **Push to the branch** (`git push origin feature/AmazingFeature`)
5. **Open a Pull Request**

### Contribution Guidelines
- Follow existing code style and patterns
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

## 📋 Future Enhancements

Potential improvements and features:

- [ ] Email verification for registration
- [ ] Password reset functionality
- [ ] Two-factor authentication
- [ ] Advanced user search and filtering
- [ ] Bulk user operations
- [ ] Export user data functionality
- [ ] Advanced audit reporting
- [ ] API rate limiting
- [ ] JWT token authentication
- [ ] Docker containerization

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Aarav Gandhi**
- 🐙 GitHub: [@aaravgandhi](https://github.com/aaravgandhi)
- 📧 Email: aarav.gandhi@example.com
- 💼 LinkedIn: [Aarav Gandhi](https://linkedin.com/in/aaravgandhi)

## 🎯 Project Goals

This RBAC application was created to demonstrate:

### Technical Skills
- Full-stack web development proficiency
- Security-first development approach
- Modern UI/UX design principles
- Database design and management

### Cybersecurity Knowledge
- Role-based access control implementation
- Secure authentication patterns
- Audit logging and compliance
- Security best practices

## 🙏 Acknowledgments

- **Flask Community**: For the excellent web framework
- **MDN Web Docs**: For comprehensive web development resources
- **Font Awesome**: For professional icons
- **Google Fonts**: For beautiful typography

---

⭐ **Star this repository if you found it helpful!**

📢 **Share it with others who might benefit from this RBAC implementation!**

🐛 **Found a bug? Please create an issue!**

---

*Built with ❤️ for cybersecurity education and modern web development demonstration*
