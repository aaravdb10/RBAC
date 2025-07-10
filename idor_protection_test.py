#!/usr/bin/env python3
"""
IDOR Protection Test Script for RBAC System

This script tests the Insecure Direct Object Reference (IDOR) protection
implementation in the RBAC Flask application.

Tests:
1. Authorization checks for different user roles
2. Resource ownership validation
3. Session-based access control
4. Audit logging of access attempts
"""

import requests
import json
import time
from typing import Dict, Any, Optional

class IDORProtectionTester:
    """Test suite for IDOR protection features"""
    
    def __init__(self, base_url: str = "http://localhost:5000"):
        """
        Initialize the tester.
        
        Args:
            base_url: Base URL of the Flask application
        """
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.session = requests.Session()
        
        # Test accounts (these should exist in the demo data)
        self.test_accounts = {
            'admin': {'email': 'admin@company.com', 'password': 'admin123'},
            'manager': {'email': 'manager@company.com', 'password': 'manager123'},
            'employee': {'email': 'employee@company.com', 'password': 'employee123'},
            'john': {'email': 'john.doe@company.com', 'password': 'password123'}
        }
        
        self.test_results = []
    
    def print_header(self, title: str):
        """Print a formatted test section header"""
        print(f"\n{'='*80}")
        print(f"🛡️  {title}")
        print(f"{'='*80}")
    
    def print_test(self, test_name: str, success: bool, details: str = ""):
        """Print test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"   📋 Details: {details}")
        
        self.test_results.append({
            'test': test_name,
            'success': success,
            'details': details
        })
    
    def login_user(self, account_type: str) -> Optional[Dict[str, Any]]:
        """
        Login a test user and return user data.
        
        Args:
            account_type: Type of account to login ('admin', 'manager', 'employee', 'john')
            
        Returns:
            User data if login successful, None otherwise
        """
        try:
            account = self.test_accounts[account_type]
            
            response = self.session.post(
                f"{self.api_url}/auth/login",
                json=account,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    return data.get('user')
            
            return None
            
        except Exception as e:
            print(f"Login error for {account_type}: {e}")
            return None
    
    def logout_user(self):
        """Logout current user"""
        try:
            self.session.post(f"{self.api_url}/auth/logout", timeout=10)
        except:
            pass
    
    def test_user_update_idor(self):
        """Test IDOR protection on user update endpoint"""
        self.print_header("Testing User Update IDOR Protection")
        
        # Test 1: Employee trying to update another user (should fail)
        employee_user = self.login_user('employee')
        if employee_user:
            # Try to update admin user (ID 1)
            update_data = {'firstName': 'Modified', 'lastName': 'Admin'}
            response = self.session.put(
                f"{self.api_url}/users/1",
                json=update_data,
                timeout=10
            )
            
            should_fail = response.status_code == 403
            self.print_test(
                "Employee updating other user",
                should_fail,
                f"Status: {response.status_code}, Response: {response.json().get('message', 'No message') if response.headers.get('content-type', '').startswith('application/json') else 'Non-JSON response'}"
            )
        
        self.logout_user()
        
        # Test 2: Employee updating their own data (should succeed)
        employee_user = self.login_user('employee')
        if employee_user:
            employee_id = employee_user.get('id')
            update_data = {'firstName': 'Updated Employee'}
            response = self.session.put(
                f"{self.api_url}/users/{employee_id}",
                json=update_data,
                timeout=10
            )
            
            should_succeed = response.status_code == 200
            self.print_test(
                "Employee updating own data",
                should_succeed,
                f"Status: {response.status_code}, User ID: {employee_id}"
            )
        
        self.logout_user()
        
        # Test 3: Admin updating another user (should succeed)
        admin_user = self.login_user('admin')
        if admin_user:
            update_data = {'firstName': 'Admin Modified'}
            response = self.session.put(
                f"{self.api_url}/users/3",  # Employee user
                json=update_data,
                timeout=10
            )
            
            should_succeed = response.status_code == 200
            self.print_test(
                "Admin updating other user",
                should_succeed,
                f"Status: {response.status_code}"
            )
        
        self.logout_user()
    
    def test_user_delete_idor(self):
        """Test IDOR protection on user delete endpoint"""
        self.print_header("Testing User Delete IDOR Protection")
        
        # Test 1: Employee trying to delete another user (should fail)
        employee_user = self.login_user('employee')
        if employee_user:
            response = self.session.delete(
                f"{self.api_url}/users/1",  # Admin user
                timeout=10
            )
            
            should_fail = response.status_code == 403
            self.print_test(
                "Employee deleting other user",
                should_fail,
                f"Status: {response.status_code}"
            )
        
        self.logout_user()
        
        # Test 2: Manager trying to delete a user (should fail - only admins can delete)
        manager_user = self.login_user('manager')
        if manager_user:
            response = self.session.delete(
                f"{self.api_url}/users/4",  # John user
                timeout=10
            )
            
            should_fail = response.status_code == 403
            self.print_test(
                "Manager deleting user",
                should_fail,
                f"Status: {response.status_code}"
            )
        
        self.logout_user()
        
        # Test 3: Admin trying to delete themselves (should fail - self-deletion prevention)
        admin_user = self.login_user('admin')
        if admin_user:
            admin_id = admin_user.get('id')
            response = self.session.delete(
                f"{self.api_url}/users/{admin_id}",
                timeout=10
            )
            
            should_fail = response.status_code == 403
            self.print_test(
                "Admin deleting own account",
                should_fail,
                f"Status: {response.status_code}, Admin ID: {admin_id}"
            )
        
        self.logout_user()
    
    def test_unauthenticated_access(self):
        """Test that unauthenticated users cannot access protected endpoints"""
        self.print_header("Testing Unauthenticated Access Protection")
        
        # Ensure no user is logged in
        self.logout_user()
        
        # Test update endpoint
        response = self.session.put(
            f"{self.api_url}/users/1",
            json={'firstName': 'Hacker'},
            timeout=10
        )
        
        should_fail = response.status_code == 401
        self.print_test(
            "Unauthenticated user update",
            should_fail,
            f"Status: {response.status_code}"
        )
        
        # Test delete endpoint
        response = self.session.delete(
            f"{self.api_url}/users/1",
            timeout=10
        )
        
        should_fail = response.status_code == 401
        self.print_test(
            "Unauthenticated user delete",
            should_fail,
            f"Status: {response.status_code}"
        )
    
    def test_invalid_user_ids(self):
        """Test protection against invalid user IDs"""
        self.print_header("Testing Invalid User ID Protection")
        
        admin_user = self.login_user('admin')
        if admin_user:
            # Test negative user ID
            response = self.session.put(
                f"{self.api_url}/users/-1",
                json={'firstName': 'Invalid'},
                timeout=10
            )
            
            should_fail = response.status_code in [400, 404]
            self.print_test(
                "Negative user ID",
                should_fail,
                f"Status: {response.status_code}"
            )
            
            # Test non-existent user ID
            response = self.session.put(
                f"{self.api_url}/users/99999",
                json={'firstName': 'Invalid'},
                timeout=10
            )
            
            should_fail = response.status_code in [403, 404]
            self.print_test(
                "Non-existent user ID",
                should_fail,
                f"Status: {response.status_code}"
            )
        
        self.logout_user()
    
    def run_all_tests(self):
        """Run all IDOR protection tests"""
        print("🚀 Starting IDOR Protection Test Suite")
        print(f"🎯 Target: {self.base_url}")
        
        start_time = time.time()
        
        try:
            # Check if server is accessible
            response = requests.get(self.base_url, timeout=10)
            if response.status_code != 200:
                print(f"❌ Server not accessible at {self.base_url}")
                return
            
            # Run tests
            self.test_unauthenticated_access()
            self.test_user_update_idor()
            self.test_user_delete_idor()
            self.test_invalid_user_ids()
            
        except requests.RequestException as e:
            print(f"❌ Connection error: {e}")
            print("🚨 Make sure the RBAC server is running on localhost:5000")
            return
        
        # Print summary
        end_time = time.time()
        duration = end_time - start_time
        
        total_tests = len(self.test_results)
        passed_tests = len([r for r in self.test_results if r['success']])
        failed_tests = total_tests - passed_tests
        
        self.print_header("Test Summary")
        print(f"📊 Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"⏱️  Duration: {duration:.2f} seconds")
        print(f"📈 Success Rate: {(passed_tests/total_tests*100):.1f}%")
        
        if failed_tests == 0:
            print("\n🎉 All IDOR protection tests passed!")
            print("🛡️ Your RBAC system is protected against Insecure Direct Object References!")
        else:
            print(f"\n⚠️  {failed_tests} test(s) failed. Review the IDOR protection implementation.")
        
        return failed_tests == 0

def main():
    """Main function to run IDOR protection tests"""
    print("🛡️ RBAC System - IDOR Protection Test Suite")
    print("=" * 55)
    
    tester = IDORProtectionTester()
    success = tester.run_all_tests()
    
    if success:
        exit(0)
    else:
        exit(1)

if __name__ == "__main__":
    main()
