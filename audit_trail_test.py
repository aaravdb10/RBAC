#!/usr/bin/env python3
"""
Audit Trail Test Script for RBAC System

This script tests the comprehensive audit trail implementation including:
1. Audit log recording for various actions
2. Security event logging
3. Login attempt tracking
4. Admin dashboard data retrieval
5. Audit log filtering and search functionality
"""

import requests
import json
import time
from typing import Dict, Any, Optional

class AuditTrailTester:
    """Test suite for audit trail features"""
    
    def __init__(self, base_url: str = "http://localhost:5000"):
        """
        Initialize the tester.
        
        Args:
            base_url: Base URL of the Flask application
        """
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.session = requests.Session()
        
        # Test accounts
        self.test_accounts = {
            'admin': {'email': 'admin@company.com', 'password': 'admin123'},
            'manager': {'email': 'manager@company.com', 'password': 'manager123'},
            'employee': {'email': 'employee@company.com', 'password': 'employee123'}
        }
        
        self.test_results = []
    
    def print_header(self, title: str):
        """Print a formatted test section header"""
        print(f"\n{'='*80}")
        print(f"📋 {title}")
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
        """Login a test user and return user data"""
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
    
    def test_failed_login_logging(self):
        """Test that failed login attempts are logged"""
        self.print_header("Testing Failed Login Audit Logging")
        
        # Attempt login with wrong password
        failed_login_data = {
            'email': 'admin@company.com',
            'password': 'wrongpassword'
        }
        
        response = self.session.post(
            f"{self.api_url}/auth/login",
            json=failed_login_data,
            timeout=10
        )
        
        # Should fail with 401
        failed_as_expected = response.status_code == 401
        self.print_test(
            "Failed login returns 401",
            failed_as_expected,
            f"Status: {response.status_code}"
        )
        
        # Give server time to log the event
        time.sleep(1)
        
        # Login as admin to check logs
        admin_user = self.login_user('admin')
        if admin_user:
            # Check if audit logs capture the failed login
            audit_response = self.session.get(
                f"{self.api_url}/audit/logs?limit=10&action_category=authentication",
                timeout=10
            )
            
            if audit_response.status_code == 200:
                audit_data = audit_response.json()
                if audit_data.get('success'):
                    logs = audit_data.get('audit_logs', [])
                    failed_login_logged = any(
                        log.get('action_type') == 'login_failed' 
                        for log in logs
                    )
                    self.print_test(
                        "Failed login appears in audit logs",
                        failed_login_logged,
                        f"Found {len(logs)} authentication logs"
                    )
                else:
                    self.print_test(
                        "Failed login audit log check",
                        False,
                        "Failed to retrieve audit logs"
                    )
            else:
                self.print_test(
                    "Failed login audit log check",
                    False,
                    f"Audit API returned {audit_response.status_code}"
                )
        
        self.logout_user()
    
    def test_successful_login_logging(self):
        """Test that successful logins are logged"""
        self.print_header("Testing Successful Login Audit Logging")
        
        # Login successfully
        admin_user = self.login_user('admin')
        login_successful = admin_user is not None
        
        self.print_test(
            "Admin login successful",
            login_successful,
            f"User: {admin_user.get('email', 'N/A') if admin_user else 'None'}"
        )
        
        if admin_user:
            # Check audit logs for successful login
            audit_response = self.session.get(
                f"{self.api_url}/audit/logs?limit=10&action_category=authentication",
                timeout=10
            )
            
            if audit_response.status_code == 200:
                audit_data = audit_response.json()
                if audit_data.get('success'):
                    logs = audit_data.get('audit_logs', [])
                    success_login_logged = any(
                        log.get('action_type') == 'login_success'
                        for log in logs
                    )
                    self.print_test(
                        "Successful login appears in audit logs",
                        success_login_logged,
                        f"Found {len(logs)} authentication logs"
                    )
        
        self.logout_user()
    
    def test_audit_dashboard_access(self):
        """Test admin access to audit dashboard"""
        self.print_header("Testing Audit Dashboard Access")
        
        # Login as admin
        admin_user = self.login_user('admin')
        
        if admin_user:
            # Test audit dashboard endpoint
            dashboard_response = self.session.get(
                f"{self.api_url}/audit/dashboard?days=7",
                timeout=10
            )
            
            dashboard_accessible = dashboard_response.status_code == 200
            self.print_test(
                "Admin can access audit dashboard",
                dashboard_accessible,
                f"Status: {dashboard_response.status_code}"
            )
            
            if dashboard_accessible:
                dashboard_data = dashboard_response.json()
                has_required_data = (
                    dashboard_data.get('success') and
                    'dashboard_data' in dashboard_data
                )
                self.print_test(
                    "Dashboard returns required data structure",
                    has_required_data,
                    f"Success: {dashboard_data.get('success')}, Has data: {'dashboard_data' in dashboard_data}"
                )
            
            # Test security events endpoint
            events_response = self.session.get(
                f"{self.api_url}/audit/security-events?limit=10",
                timeout=10
            )
            
            events_accessible = events_response.status_code == 200
            self.print_test(
                "Admin can access security events",
                events_accessible,
                f"Status: {events_response.status_code}"
            )
        
        self.logout_user()
        
        # Test non-admin access (should be denied)
        employee_user = self.login_user('employee')
        
        if employee_user:
            dashboard_response = self.session.get(
                f"{self.api_url}/audit/dashboard",
                timeout=10
            )
            
            access_denied = dashboard_response.status_code == 403
            self.print_test(
                "Employee cannot access audit dashboard",
                access_denied,
                f"Status: {dashboard_response.status_code}"
            )
        
        self.logout_user()
    
    def test_audit_log_filtering(self):
        """Test audit log filtering functionality"""
        self.print_header("Testing Audit Log Filtering")
        
        admin_user = self.login_user('admin')
        
        if admin_user:
            # Test category filtering
            auth_logs_response = self.session.get(
                f"{self.api_url}/audit/logs?action_category=authentication&limit=5",
                timeout=10
            )
            
            category_filter_works = auth_logs_response.status_code == 200
            self.print_test(
                "Category filtering works",
                category_filter_works,
                f"Status: {auth_logs_response.status_code}"
            )
            
            if category_filter_works:
                auth_data = auth_logs_response.json()
                if auth_data.get('success'):
                    auth_logs = auth_data.get('audit_logs', [])
                    all_auth_category = all(
                        log.get('action_category') == 'authentication'
                        for log in auth_logs
                    ) if auth_logs else True
                    
                    self.print_test(
                        "Filtered logs contain only authentication category",
                        all_auth_category,
                        f"Found {len(auth_logs)} authentication logs"
                    )
            
            # Test risk level filtering
            high_risk_response = self.session.get(
                f"{self.api_url}/audit/logs?risk_level=medium&limit=5",
                timeout=10
            )
            
            risk_filter_works = high_risk_response.status_code == 200
            self.print_test(
                "Risk level filtering works",
                risk_filter_works,
                f"Status: {high_risk_response.status_code}"
            )
        
        self.logout_user()
    
    def test_user_action_logging(self):
        """Test that user actions are logged"""
        self.print_header("Testing User Action Audit Logging")
        
        admin_user = self.login_user('admin')
        
        if admin_user:
            # Perform a user management action (create user)
            new_user_data = {
                'firstName': 'Test',
                'lastName': 'User',
                'email': 'testaudit@company.com',
                'role': 'employee',
                'department': 'Testing'
            }
            
            create_response = self.session.post(
                f"{self.api_url}/users",
                json=new_user_data,
                timeout=10
            )
            
            user_created = create_response.status_code == 200
            self.print_test(
                "Test user created successfully",
                user_created,
                f"Status: {create_response.status_code}"
            )
            
            # Give server time to log the action
            time.sleep(1)
            
            # Check if the action was logged
            audit_response = self.session.get(
                f"{self.api_url}/audit/logs?limit=10&action_category=user_mgmt",
                timeout=10
            )
            
            if audit_response.status_code == 200:
                audit_data = audit_response.json()
                if audit_data.get('success'):
                    logs = audit_data.get('audit_logs', [])
                    user_creation_logged = any(
                        'testaudit@company.com' in (log.get('action_details', '') or '')
                        for log in logs
                    )
                    self.print_test(
                        "User creation appears in audit logs",
                        user_creation_logged,
                        f"Found {len(logs)} user management logs"
                    )
        
        self.logout_user()
    
    def test_pagination_and_limits(self):
        """Test audit log pagination and limits"""
        self.print_header("Testing Audit Log Pagination")
        
        admin_user = self.login_user('admin')
        
        if admin_user:
            # Test limit parameter
            limited_response = self.session.get(
                f"{self.api_url}/audit/logs?limit=3",
                timeout=10
            )
            
            if limited_response.status_code == 200:
                limited_data = limited_response.json()
                if limited_data.get('success'):
                    logs = limited_data.get('audit_logs', [])
                    limit_respected = len(logs) <= 3
                    self.print_test(
                        "Limit parameter works",
                        limit_respected,
                        f"Requested 3, got {len(logs)} logs"
                    )
                    
                    # Test that pagination info is included
                    has_pagination_info = (
                        'total_count' in limited_data and
                        'limit' in limited_data and
                        'offset' in limited_data
                    )
                    self.print_test(
                        "Response includes pagination metadata",
                        has_pagination_info,
                        f"Total: {limited_data.get('total_count')}, Limit: {limited_data.get('limit')}"
                    )
        
        self.logout_user()
    
    def run_all_tests(self):
        """Run all audit trail tests"""
        print("📋 Starting Audit Trail Test Suite")
        print(f"🎯 Target: {self.base_url}")
        
        start_time = time.time()
        
        try:
            # Check if server is accessible
            response = requests.get(self.base_url, timeout=10)
            if response.status_code != 200:
                print(f"❌ Server not accessible at {self.base_url}")
                return
            
            # Run tests
            self.test_failed_login_logging()
            self.test_successful_login_logging()
            self.test_audit_dashboard_access()
            self.test_audit_log_filtering()
            self.test_user_action_logging()
            self.test_pagination_and_limits()
            
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
            print("\n🎉 All audit trail tests passed!")
            print("📋 Your RBAC system has comprehensive audit logging!")
        else:
            print(f"\n⚠️  {failed_tests} test(s) failed. Review the audit trail implementation.")
        
        return failed_tests == 0

def main():
    """Main function to run audit trail tests"""
    print("📋 RBAC System - Audit Trail Test Suite")
    print("=" * 55)
    
    tester = AuditTrailTester()
    success = tester.run_all_tests()
    
    if success:
        exit(0)
    else:
        exit(1)

if __name__ == "__main__":
    main()
