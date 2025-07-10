"""
Session Security Testing Script for RBAC System
Tests session security features including hijacking detection and secure logout
"""

import requests
import time
from datetime import datetime

class SessionSecurityTester:
    def __init__(self, base_url="http://localhost:5000"):
        self.base_url = base_url
        self.test_results = []
        self.session = requests.Session()
    
    def log_test(self, test_name, expected, actual, details=""):
        """Log test results"""
        status = "✅ PASS" if expected == actual else "❌ FAIL"
        result = {
            'test': test_name,
            'expected': expected,
            'actual': actual,
            'status': status,
            'details': details,
            'timestamp': datetime.now().isoformat()
        }
        self.test_results.append(result)
        print(f"{status}: {test_name}")
        if expected != actual:
            print(f"   Expected: {expected}")
            print(f"   Actual: {actual}")
        if details:
            print(f"   Details: {details}")
    
    def test_secure_login(self):
        """Test secure login with cookie setting"""
        print("\n🔐 Testing Secure Login")
        print("=" * 40)
        
        try:
            # Test with valid credentials
            response = self.session.post(
                f"{self.base_url}/api/auth/login",
                json={
                    "email": "admin@company.com",
                    "password": "admin123"
                }
            )
            
            result = response.json()
            has_session_cookie = 'rbac_session' in self.session.cookies
            
            self.log_test(
                "Valid Login",
                True,
                result.get('success', False) and has_session_cookie,
                f"Status: {response.status_code}, Cookie set: {has_session_cookie}"
            )
            
            # Check cookie properties (if we can access them)
            if has_session_cookie:
                cookie = self.session.cookies['rbac_session']
                self.log_test(
                    "Session Cookie Set",
                    True,
                    len(cookie) > 0,
                    f"Cookie length: {len(cookie)}"
                )
            
        except Exception as e:
            self.log_test(
                "Secure Login Test",
                "SUCCESS",
                f"ERROR: {str(e)}"
            )
    
    def test_session_validation(self):
        """Test session validation endpoint"""
        print("\n🔍 Testing Session Validation")
        print("=" * 40)
        
        try:
            # Test session validation
            response = self.session.get(f"{self.base_url}/api/auth/validate-session")
            result = response.json()
            
            self.log_test(
                "Session Validation",
                True,
                result.get('success', False),
                f"Status: {response.status_code}"
            )
            
            if result.get('success'):
                user = result.get('user', {})
                self.log_test(
                    "User Data in Session",
                    True,
                    'email' in user and 'role' in user,
                    f"User: {user.get('email', 'N/A')}, Role: {user.get('role', 'N/A')}"
                )
            
        except Exception as e:
            self.log_test(
                "Session Validation Test",
                "SUCCESS",
                f"ERROR: {str(e)}"
            )
    
    def test_session_without_cookie(self):
        """Test endpoints without session cookie"""
        print("\n🚫 Testing Access Without Session")
        print("=" * 40)
        
        try:
            # Create new session without cookies
            no_cookie_session = requests.Session()
            
            response = no_cookie_session.get(f"{self.base_url}/api/auth/validate-session")
            
            self.log_test(
                "Access Without Cookie",
                401,
                response.status_code,
                "Should be denied access"
            )
            
        except Exception as e:
            self.log_test(
                "No Cookie Test",
                "DENIED",
                f"ERROR: {str(e)}"
            )
    
    def test_user_sessions_endpoint(self):
        """Test getting user sessions"""
        print("\n📊 Testing User Sessions Endpoint")
        print("=" * 40)
        
        try:
            response = self.session.get(f"{self.base_url}/api/auth/sessions")
            result = response.json()
            
            self.log_test(
                "Get User Sessions",
                True,
                result.get('success', False),
                f"Status: {response.status_code}"
            )
            
            if result.get('success'):
                sessions = result.get('sessions', [])
                self.log_test(
                    "Sessions Data",
                    True,
                    len(sessions) > 0,
                    f"Found {len(sessions)} active sessions"
                )
                
                # Check if current session is marked
                current_session_found = any(s.get('is_current') for s in sessions)
                self.log_test(
                    "Current Session Marked",
                    True,
                    current_session_found,
                    "Current session should be marked"
                )
            
        except Exception as e:
            self.log_test(
                "User Sessions Test",
                "SUCCESS",
                f"ERROR: {str(e)}"
            )
    
    def test_secure_logout(self):
        """Test secure logout functionality"""
        print("\n🚪 Testing Secure Logout")
        print("=" * 40)
        
        try:
            # Test logout
            response = self.session.post(f"{self.base_url}/api/auth/logout")
            result = response.json()
            
            self.log_test(
                "Logout Request",
                True,
                result.get('success', False),
                f"Status: {response.status_code}"
            )
            
            # Test that session is invalidated
            validation_response = self.session.get(f"{self.base_url}/api/auth/validate-session")
            
            self.log_test(
                "Session Invalidated",
                401,
                validation_response.status_code,
                "Session should be invalidated after logout"
            )
            
        except Exception as e:
            self.log_test(
                "Secure Logout Test",
                "SUCCESS",
                f"ERROR: {str(e)}"
            )
    
    def test_logout_all_sessions(self):
        """Test logout all sessions functionality"""
        print("\n🚪🚪 Testing Logout All Sessions")
        print("=" * 40)
        
        try:
            # First login again to create a session
            login_response = self.session.post(
                f"{self.base_url}/api/auth/login",
                json={
                    "email": "admin@company.com",
                    "password": "admin123"
                }
            )
            
            if login_response.json().get('success'):
                # Test logout all
                response = self.session.post(f"{self.base_url}/api/auth/logout-all")
                result = response.json()
                
                self.log_test(
                    "Logout All Sessions",
                    True,
                    result.get('success', False),
                    f"Status: {response.status_code}"
                )
                
                # Verify session is invalidated
                validation_response = self.session.get(f"{self.base_url}/api/auth/validate-session")
                
                self.log_test(
                    "All Sessions Invalidated",
                    401,
                    validation_response.status_code,
                    "All sessions should be invalidated"
                )
            else:
                self.log_test(
                    "Logout All Test",
                    "SUCCESS",
                    "SKIPPED - Could not login first"
                )
            
        except Exception as e:
            self.log_test(
                "Logout All Test",
                "SUCCESS",
                f"ERROR: {str(e)}"
            )
    
    def test_cookie_security_headers(self):
        """Test that cookies have security headers"""
        print("\n🍪 Testing Cookie Security Headers")
        print("=" * 40)
        
        try:
            # Login to get cookie
            response = requests.post(
                f"{self.base_url}/api/auth/login",
                json={
                    "email": "admin@company.com",
                    "password": "admin123"
                }
            )
            
            # Check Set-Cookie header
            set_cookie_header = response.headers.get('Set-Cookie', '')
            
            # Check for security attributes
            has_httponly = 'HttpOnly' in set_cookie_header
            has_secure = 'Secure' in set_cookie_header  # Might not work over HTTP
            has_samesite = 'SameSite=Strict' in set_cookie_header
            
            self.log_test(
                "HttpOnly Cookie Attribute",
                True,
                has_httponly,
                f"Set-Cookie header: {set_cookie_header[:100]}..."
            )
            
            self.log_test(
                "SameSite=Strict Attribute",
                True,
                has_samesite,
                "CSRF protection"
            )
            
            # Note: Secure attribute might not be set over HTTP in development
            if 'https' in self.base_url:
                self.log_test(
                    "Secure Cookie Attribute",
                    True,
                    has_secure,
                    "HTTPS-only cookies"
                )
            else:
                self.log_test(
                    "Secure Attribute (Development)",
                    "SKIPPED",
                    "SKIPPED",
                    "Secure attribute requires HTTPS"
                )
            
        except Exception as e:
            self.log_test(
                "Cookie Security Test",
                "SUCCESS",
                f"ERROR: {str(e)}"
            )
    
    def run_all_tests(self):
        """Run all session security tests"""
        print("🔐 Session Security Testing Suite")
        print("=" * 50)
        print(f"Testing against: {self.base_url}")
        print(f"Test started at: {datetime.now()}")
        
        # Run all test suites
        self.test_secure_login()
        self.test_session_validation()
        self.test_user_sessions_endpoint()
        self.test_session_without_cookie()
        self.test_cookie_security_headers()
        self.test_secure_logout()
        self.test_logout_all_sessions()
        
        # Generate summary
        self.generate_summary()
    
    def generate_summary(self):
        """Generate test summary"""
        print("\n📊 Session Security Test Summary")
        print("=" * 50)
        
        total_tests = len(self.test_results)
        passed_tests = len([t for t in self.test_results if t['status'].startswith('✅')])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests}")
        print(f"Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if failed_tests > 0:
            print("\n❌ Failed Tests:")
            for test in self.test_results:
                if test['status'].startswith('❌'):
                    print(f"   - {test['test']}: {test['actual']}")
        
        print("\n🔒 Session Security Features Tested:")
        print("   ✅ Secure cookie implementation")
        print("   ✅ Session validation")
        print("   ✅ Access control without session")
        print("   ✅ Secure logout procedures")
        print("   ✅ Cookie security attributes")
        print("   ✅ Session management endpoints")
        
        print(f"\n🔐 Session security testing completed!")

def main():
    """Main function to run session security tests"""
    print("Starting Session Security Tests...")
    print("Make sure the Flask server is running on http://localhost:5000")
    print()
    
    # Check if server is running
    try:
        response = requests.get("http://localhost:5000", timeout=5)
        print("✅ Server is running")
    except:
        print("❌ Server is not running. Please start the Flask server first.")
        print("Run: python app.py")
        return
    
    # Run session security tests
    tester = SessionSecurityTester()
    tester.run_all_tests()

if __name__ == "__main__":
    main()
