from flask import Flask, render_template, request, jsonify, send_from_directory
from flask_cors import CORS
import sqlite3
import hashlib
import os
from datetime import datetime

app = Flask(__name__)
app.secret_key = 'rbac-demo-secret-key-2024'
CORS(app)

# Database configuration
DATABASE = 'rbac_system.db'

def get_db_connection():
    """Get database connection"""
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_database():
    """Initialize database with tables and demo data"""
    conn = get_db_connection()
    
    # Create users table
    conn.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'employee',
            department TEXT,
            status TEXT DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create audit log table
    conn.execute('''
        CREATE TABLE IF NOT EXISTS audit_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            action TEXT NOT NULL,
            details TEXT,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # Insert demo users if they don't exist
    demo_users = [
        ('Admin', 'User', 'admin@company.com', 'admin123', 'admin', 'IT'),
        ('Manager', 'User', 'manager@company.com', 'manager123', 'manager', 'HR'),
        ('Employee', 'User', 'employee@company.com', 'employee123', 'employee', 'Finance'),
        ('John', 'Doe', 'john.doe@company.com', 'password123', 'employee', 'IT'),
        ('Jane', 'Smith', 'jane.smith@company.com', 'password123', 'manager', 'Marketing'),
        ('Bob', 'Johnson', 'bob.johnson@company.com', 'password123', 'employee', 'Operations')
    ]
    
    for user in demo_users:
        existing = conn.execute('SELECT id FROM users WHERE email = ?', (user[2],)).fetchone()
        if not existing:
            hashed_password = hashlib.sha256(user[3].encode()).hexdigest()
            conn.execute('''
                INSERT INTO users (first_name, last_name, email, password, role, department)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (user[0], user[1], user[2], hashed_password, user[4], user[5]))
    
    conn.commit()
    conn.close()

def hash_password(password):
    """Hash password using SHA256"""
    return hashlib.sha256(password.encode()).hexdigest()

def log_action(user_id, action, details=None):
    """Log user action to audit log"""
    conn = get_db_connection()
    conn.execute('''
        INSERT INTO audit_log (user_id, action, details)
        VALUES (?, ?, ?)
    ''', (user_id, action, details))
    conn.commit()
    conn.close()

@app.route('/')
def index():
    """Serve the main HTML page"""
    return send_from_directory('.', 'index.html')

@app.route('/<path:filename>')
def serve_static(filename):
    """Serve static files"""
    return send_from_directory('.', filename)

@app.route('/api/auth/login', methods=['POST'])
def login():
    """Handle user login"""
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({'success': False, 'message': 'Email and password required'}), 400
        
        conn = get_db_connection()
        hashed_password = hash_password(password)
        
        user = conn.execute('''
            SELECT id, first_name, last_name, email, role, department, status
            FROM users 
            WHERE email = ? AND password = ? AND status = 'active'
        ''', (email, hashed_password)).fetchone()
        
        conn.close()
        
        if user:
            user_data = {
                'id': user['id'],
                'firstName': user['first_name'],
                'lastName': user['last_name'],
                'email': user['email'],
                'role': user['role'],
                'department': user['department'],
                'status': user['status']
            }
            
            log_action(user['id'], 'login', f'User logged in from {request.remote_addr}')
            
            return jsonify({
                'success': True,
                'message': 'Login successful',
                'user': user_data
            })
        else:
            return jsonify({'success': False, 'message': 'Invalid credentials'}), 401
            
    except Exception as e:
        return jsonify({'success': False, 'message': 'Login failed'}), 500

@app.route('/api/auth/register', methods=['POST'])
def register():
    """Handle user registration"""
    try:
        data = request.get_json()
        first_name = data.get('firstName')
        last_name = data.get('lastName')
        email = data.get('email')
        password = data.get('password')
        department = data.get('department', 'General')
        
        if not all([first_name, last_name, email, password]):
            return jsonify({'success': False, 'message': 'All fields required'}), 400
        
        conn = get_db_connection()
        
        existing = conn.execute('SELECT id FROM users WHERE email = ?', (email,)).fetchone()
        if existing:
            conn.close()
            return jsonify({'success': False, 'message': 'Email already registered'}), 409
        
        hashed_password = hash_password(password)
        cursor = conn.execute('''
            INSERT INTO users (first_name, last_name, email, password, role, department)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (first_name, last_name, email, hashed_password, 'employee', department))
        
        user_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        log_action(user_id, 'register', f'New user registered: {email}')
        
        return jsonify({
            'success': True,
            'message': 'Registration successful',
            'user': {
                'id': user_id,
                'firstName': first_name,
                'lastName': last_name,
                'email': email,
                'role': 'employee',
                'department': department,
                'status': 'active'
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'message': 'Registration failed'}), 500

@app.route('/api/users', methods=['GET'])
def get_users():
    """Get all users"""
    try:
        conn = get_db_connection()
        users = conn.execute('''
            SELECT id, first_name, last_name, email, role, department, status, created_at
            FROM users 
            ORDER BY created_at DESC
        ''').fetchall()
        conn.close()
        
        users_list = []
        for user in users:
            users_list.append({
                'id': user['id'],
                'firstName': user['first_name'],
                'lastName': user['last_name'],
                'email': user['email'],
                'role': user['role'],
                'department': user['department'],
                'status': user['status'],
                'joinDate': user['created_at']
            })
        
        return jsonify({'success': True, 'users': users_list})
        
    except Exception as e:
        return jsonify({'success': False, 'message': 'Failed to fetch users'}), 500

@app.route('/api/users', methods=['POST'])
def create_user():
    """Create new user"""
    try:
        data = request.get_json()
        first_name = data.get('firstName')
        last_name = data.get('lastName')
        email = data.get('email')
        role = data.get('role', 'employee')
        department = data.get('department')
        
        if not all([first_name, last_name, email, role]):
            return jsonify({'success': False, 'message': 'All fields required'}), 400
        
        conn = get_db_connection()
        
        existing = conn.execute('SELECT id FROM users WHERE email = ?', (email,)).fetchone()
        if existing:
            conn.close()
            return jsonify({'success': False, 'message': 'Email already exists'}), 409
        
        temp_password = 'temp123'
        hashed_password = hash_password(temp_password)
        
        cursor = conn.execute('''
            INSERT INTO users (first_name, last_name, email, password, role, department)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (first_name, last_name, email, hashed_password, role, department))
        
        user_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        log_action(user_id, 'user_created', f'User created: {email}')
        
        return jsonify({
            'success': True,
            'message': 'User created successfully',
            'user': {
                'id': user_id,
                'firstName': first_name,
                'lastName': last_name,
                'email': email,
                'role': role,
                'department': department,
                'status': 'active'
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'message': 'Failed to create user'}), 500

@app.route('/api/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    """Update user information"""
    try:
        data = request.get_json()
        first_name = data.get('firstName')
        last_name = data.get('lastName')
        email = data.get('email')
        role = data.get('role')
        status = data.get('status')
        
        conn = get_db_connection()
        
        existing = conn.execute('SELECT id FROM users WHERE id = ?', (user_id,)).fetchone()
        if not existing:
            conn.close()
            return jsonify({'success': False, 'message': 'User not found'}), 404
        
        conn.execute('''
            UPDATE users 
            SET first_name = ?, last_name = ?, email = ?, role = ?, status = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        ''', (first_name, last_name, email, role, status, user_id))
        
        conn.commit()
        conn.close()
        
        log_action(user_id, 'user_updated', f'User updated: {email}')
        
        return jsonify({
            'success': True,
            'message': 'User updated successfully'
        })
        
    except Exception as e:
        return jsonify({'success': False, 'message': 'Failed to update user'}), 500

@app.route('/api/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    """Delete user"""
    try:
        conn = get_db_connection()
        
        user = conn.execute('SELECT email FROM users WHERE id = ?', (user_id,)).fetchone()
        if not user:
            conn.close()
            return jsonify({'success': False, 'message': 'User not found'}), 404
        
        conn.execute('DELETE FROM users WHERE id = ?', (user_id,))
        conn.commit()
        conn.close()
        
        log_action(user_id, 'user_deleted', f'User deleted: {user["email"]}')
        
        return jsonify({'success': True, 'message': 'User deleted successfully'})
        
    except Exception as e:
        return jsonify({'success': False, 'message': 'Failed to delete user'}), 500

if __name__ == '__main__':
    init_database()
    print("🚀 RBAC Backend Server Starting...")
    print("📊 Database initialized with demo accounts")
    print("🔗 Frontend: http://localhost:5000")
    print("🛡️  Backend API: http://localhost:5000/api")
    app.run(debug=True, host='0.0.0.0', port=5000)