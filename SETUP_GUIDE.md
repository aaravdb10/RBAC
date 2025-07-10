# RBAC Web Application - Setup Guide

## 📋 Prerequisites

Before setting up the RBAC application, ensure you have:

- **Python 3.7+** installed on your system
- **Git** installed for version control
- A modern web browser (Chrome, Firefox, Safari, Edge)
- Basic knowledge of command line operations

## 🛠️ Installation Steps

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/RBAC-Web-Application.git
cd RBAC-Web-Application
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Run the Application
```bash
python app.py
```

### 4. Access the Application
Open your browser and navigate to: `http://localhost:5000`

## 🧪 Testing the Application

### Demo Accounts
Use these pre-configured accounts to test different role functionalities:

| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| **Admin** | admin@company.com | admin123 | Full system access, user management |
| **Manager** | manager@company.com | manager123 | Manager dashboard, team features |
| **Employee** | employee@company.com | employee123 | Employee dashboard, basic access |

### Testing Checklist
- [ ] Homepage loads correctly
- [ ] Dark mode toggle works
- [ ] Demo login buttons function
- [ ] Registration form works
- [ ] Login form works
- [ ] Role-based dashboards display
- [ ] Admin user management (Add/Edit/Delete)
- [ ] Responsive design on mobile
- [ ] All navigation works correctly

## 🔧 Configuration

### Environment Variables (Optional)
You can configure the following environment variables:

```bash
FLASK_ENV=development          # Set to 'production' for production
SECRET_KEY=your-secret-key    # Custom secret key
DATABASE_PATH=custom.db       # Custom database file path
```

### Database Configuration
The application uses SQLite by default. The database file (`rbac_system.db`) is created automatically on first run with demo data.

## 🐛 Troubleshooting

### Common Issues

**1. Port 5000 already in use**
```bash
# Find and kill the process using port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Or use a different port
python app.py --port 5001
```

**2. Module not found errors**
```bash
# Reinstall dependencies
pip uninstall -r requirements.txt -y
pip install -r requirements.txt
```

**3. Database issues**
```bash
# Delete and recreate database
del rbac_system.db
python app.py
```

**4. Permission errors**
- Run command prompt as Administrator
- Ensure you have write permissions in the project directory

### Browser Issues
- Clear browser cache and cookies
- Try incognito/private browsing mode
- Check browser console for JavaScript errors

## 📁 Project Structure Explained

```
RBAC-Web-Application/
├── app.py                 # Flask backend server
├── index.html            # Main frontend application
├── style.css             # Complete styling with dark mode
├── script.js             # Frontend JavaScript functionality
├── requirements.txt      # Python dependencies
├── start_backend.bat     # Windows quick-start script
├── .gitignore           # Git ignore rules
├── LICENSE              # MIT license
├── README.md            # Main documentation
├── SETUP_GUIDE.md       # This setup guide
├── FINAL_STATUS_REPORT.md # Project completion report
├── STEP1_IMPLEMENTATION.md # Implementation details
└── TESTING_CHECKLIST.md   # Testing documentation
```

## 🚀 Deployment Options

### Local Development
The application runs on `localhost:5000` by default.

### Production Deployment
For production deployment, consider:

1. **Use a production WSGI server** (Gunicorn, uWSGI)
2. **Set environment variables** for security
3. **Use a proper database** (PostgreSQL, MySQL)
4. **Enable HTTPS** with SSL certificates
5. **Set up monitoring** and logging

### Docker Deployment (Optional)
```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 5000
CMD ["python", "app.py"]
```

## 📞 Support

If you encounter issues:

1. Check this setup guide
2. Review the troubleshooting section
3. Check the project's README.md
4. Create an issue on GitHub with:
   - Your operating system
   - Python version
   - Error messages
   - Steps to reproduce

## 🎓 Learning Resources

This project demonstrates:
- **Flask Web Development**
- **Role-Based Access Control (RBAC)**
- **Database Integration with SQLite**
- **Frontend JavaScript/HTML/CSS**
- **Responsive Web Design**
- **Security Best Practices**

Great for learning:
- Web application security
- User authentication and authorization
- Modern UI/UX development
- Backend API development
- Database management

---

**Happy Coding! 🚀**
