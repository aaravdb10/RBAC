# IDOR Protection Implementation

## Overview

This document describes the Insecure Direct Object Reference (IDOR) protection implementation in the RBAC Flask application. IDOR is a security vulnerability that occurs when an application provides direct access to objects based on user-supplied input without proper authorization checks.

## Features Implemented

### 1. Authorization Framework

**File**: `idor_protection.py`

- **IDORProtectionManager**: Comprehensive protection manager
- **Role-based access control**: Different permissions for admin, manager, employee
- **Resource ownership validation**: Users can only access their own resources
- **Security audit logging**: All access attempts are logged
- **Risk assessment**: Categorizes access attempts by risk level

### 2. Protection Decorators

**Decorator**: `@require_authorization(resource_type='user', action='update')`

- Applied to vulnerable endpoints
- Validates session authentication
- Checks resource-specific permissions
- Logs all access attempts
- Returns detailed error messages for denied access

### 3. Protected Endpoints

#### User Update Endpoint
- **Endpoint**: `PUT /api/users/<int:user_id>`
- **Protection**: Session validation + IDOR authorization
- **Rules**: 
  - Users can update their own profile
  - Admins can update any user
  - Managers and employees cannot update others

#### User Delete Endpoint
- **Endpoint**: `DELETE /api/users/<int:user_id>`
- **Protection**: Session validation + IDOR authorization
- **Rules**:
  - Only admins can delete users
  - Admins cannot delete their own account (self-deletion prevention)
  - All attempts are logged with high security priority

### 4. Access Control Rules

#### Admin Role
```python
'admin': {
    'can_access_others': True,
    'can_modify_others': True,
    'can_delete_others': True,
    'can_create_users': True,
    'can_access_audit': True
}
```

#### Manager Role
```python
'manager': {
    'can_access_others': True,    # Can view other users
    'can_modify_others': False,   # Cannot modify others
    'can_delete_others': False,   # Cannot delete others
    'can_create_users': False,
    'can_access_audit': False
}
```

#### Employee Role
```python
'employee': {
    'can_access_others': False,   # Can only access own data
    'can_modify_others': False,
    'can_delete_others': False,
    'can_create_users': False,
    'can_access_audit': False
}
```

## Security Features

### 1. Session-Based Authorization

- All protected endpoints require valid session cookies
- Session data includes user ID and role information
- Session validation includes IP and user-agent fingerprinting
- Expired or invalid sessions are rejected

### 2. Resource Ownership Validation

```python
def validate_user_access(self, current_user, target_user_id, action):
    # Check if target user exists
    # Validate ownership (users can access their own data)
    # Apply role-based permissions
    # Log access attempt
    return access_result
```

### 3. Audit Logging

All access attempts are logged to the `idor_access_log` table:

```sql
CREATE TABLE idor_access_log (
    id INTEGER PRIMARY KEY,
    user_id INTEGER,
    target_resource_type TEXT,
    target_resource_id TEXT,
    action TEXT,
    access_granted BOOLEAN,
    denial_reason TEXT,
    ip_address TEXT,
    user_agent TEXT,
    timestamp TIMESTAMP,
    risk_level TEXT
);
```

### 4. Risk Assessment

Access attempts are categorized by risk level:

- **Low Risk**: Normal successful access
- **Medium Risk**: Permission denied, invalid session
- **High Risk**: Malicious access patterns, resource validation errors

## Implementation Details

### 1. Decorator Integration

The IDOR protection is implemented using Python decorators:

```python
@app.route('/api/users/<int:user_id>', methods=['PUT'])
@require_valid_session()
@require_authorization(resource_type='user', action='update')
def update_user(user_id):
    # Endpoint logic here
```

### 2. Authorization Flow

1. **Session Validation**: Check if user has valid session
2. **Resource Extraction**: Extract resource ID from URL parameters
3. **Permission Check**: Validate user permissions for the action
4. **Ownership Validation**: Check if user owns the resource
5. **Audit Logging**: Log the access attempt
6. **Response**: Grant or deny access

### 3. Error Handling

Protected endpoints return appropriate HTTP status codes:

- **401 Unauthorized**: No valid session
- **403 Forbidden**: Valid session but insufficient permissions
- **404 Not Found**: Resource doesn't exist
- **400 Bad Request**: Invalid request parameters

## Security Benefits

### 1. Prevents IDOR Attacks

- **Direct Object Reference Protection**: Users cannot access resources by guessing IDs
- **Authorization Validation**: All access is checked against user permissions
- **Session Binding**: Access is tied to authenticated sessions

### 2. Comprehensive Logging

- **Attack Detection**: Failed access attempts are logged for security monitoring
- **Audit Trail**: Complete record of who accessed what and when
- **Risk Assessment**: High-risk activities are flagged for investigation

### 3. Role-Based Security

- **Principle of Least Privilege**: Users only get minimum necessary permissions
- **Hierarchical Access**: Admins have elevated permissions
- **Separation of Duties**: Different roles have different capabilities

## Testing

### Automated Test Suite

**File**: `idor_protection_test.py`

The test suite validates:

- **Unauthorized Access Prevention**: Unauthenticated users cannot access protected resources
- **Role-Based Access Control**: Different roles have appropriate permissions
- **Self-Access Validation**: Users can access their own resources
- **Cross-User Access Prevention**: Users cannot access other users' resources
- **Admin Privilege Validation**: Admins have elevated permissions
- **Self-Deletion Prevention**: Admins cannot delete their own accounts

### Test Scenarios

1. **Employee Update Tests**:
   - ✅ Employee updating own data (should succeed)
   - ❌ Employee updating other user data (should fail)

2. **Manager Access Tests**:
   - ✅ Manager viewing other users (should succeed)
   - ❌ Manager deleting users (should fail)

3. **Admin Permission Tests**:
   - ✅ Admin updating any user (should succeed)
   - ❌ Admin deleting own account (should fail)

4. **Unauthenticated Access Tests**:
   - ❌ No session access to protected endpoints (should fail)

## Configuration

### Database Initialization

The IDOR protection manager automatically creates required tables:

```python
idor_manager = IDORProtectionManager(DATABASE)
# Automatically creates idor_access_log table
```

### Integration with Flask App

```python
# Import IDOR protection
from idor_protection import IDORProtectionManager, require_authorization

# Initialize IDOR manager
idor_manager = IDORProtectionManager(DATABASE)

# Apply to protected endpoints
@require_authorization(resource_type='user', action='update')
def update_user(user_id):
    # Protected endpoint logic
```

## Monitoring and Maintenance

### 1. Access Statistics

```python
stats = idor_manager.get_access_statistics()
# Returns: total_attempts, denied_attempts, high_risk_attempts, success_rate
```

### 2. Security Violations

```python
violations = idor_manager.get_access_violations(risk_level='high', limit=100)
# Returns: List of high-risk access attempts
```

### 3. Regular Monitoring

- Review access logs regularly for suspicious patterns
- Monitor denied access attempts for potential attacks
- Track success rates to identify system issues
- Investigate high-risk access attempts immediately

## Best Practices

### 1. Always Use Authorization

- Apply `@require_authorization` to all resource-modifying endpoints
- Never trust URL parameters or user input for access control
- Validate session data before processing requests

### 2. Implement Least Privilege

- Give users minimum necessary permissions
- Regularly review and update role permissions
- Implement separation of duties where appropriate

### 3. Monitor and Audit

- Log all access attempts, successful and failed
- Regularly review security logs
- Set up alerts for high-risk activities
- Maintain audit trails for compliance

### 4. Test Regularly

- Run automated IDOR protection tests
- Test with different user roles and scenarios
- Validate that protection works across all endpoints
- Update tests when adding new features

## Conclusion

The IDOR protection implementation provides comprehensive security against insecure direct object reference vulnerabilities. It combines session-based authentication, role-based authorization, resource ownership validation, and security audit logging to create a robust defense against unauthorized access attempts.

The implementation follows security best practices and provides detailed logging and monitoring capabilities to help maintain a secure system over time.
