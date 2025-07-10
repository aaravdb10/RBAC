"""
Security Testing Script for RBAC System
Tests SQL injection prevention and security features
"""

import requests
import json
import time
from datetime import datetime

class SecurityTester:
    def __init__(self, base_url="http://localhost:5000"):
        self.base_url = base_url
        self.test_results = []
    
    def log_test(self, test_name, payload, expected_result, actual_result):
        """Log test results"""
        status = "✅ PASS" if expected_result == actual_result else "❌ FAIL"
        result = {
            'test': test_name,
            'payload': payload,
            'expected': expected_result,
            'actual': actual_result,
            'status': status,
            'timestamp': datetime.now().isoformat()
        }
        self.test_results.append(result)
        print(f"{status}: {test_name}")
        if expected_result != actual_result:
            print(f"   Expected: {expected_result}")
            print(f"   Actual: {actual_result}")
    
    def test_sql_injection_login(self):
        """Test SQL injection attempts on login endpoint"""
        print("\n🔍 Testing SQL Injection on Login Endpoint")
        print("=" * 50)
        
        # Test cases with SQL injection payloads
        injection_payloads = [
            {
                "name": "Classic SQL Injection",
                "email": "admin'; DROP TABLE users; --",
                "password": "anything"
            },
            {
                "name": "Union-based Injection",
                "email": "admin' UNION SELECT * FROM users --",
                "password": "password"
            },
            {
                "name": "Comment-based Injection", 
                "email": "admin'/**/OR/**/1=1/**/--",
                "password": "password"
            },
            {
                "name": "Boolean-based Injection",
                "email": "admin' OR '1'='1",
                "password": "password"
            },
            {
                "name": "Time-based Injection",
                "email": "admin'; WAITFOR DELAY '00:00:05' --",
                "password": "password"
            }
        ]
        
        for payload in injection_payloads:
            try:
                response = requests.post(
                    f"{self.base_url}/api/auth/login",
                    json={
                        "email": payload["email"],
                        "password": payload["password"]
                    },
                    timeout=10
                )
                
                # All injection attempts should be blocked (return 400 or 401)
                expected_blocked = response.status_code in [400, 401]
                actual_blocked = response.status_code in [400, 401]
                
                self.log_test(
                    payload["name"],
                    payload["email"],
                    "BLOCKED",
                    "BLOCKED" if actual_blocked else "ALLOWED"
                )
                
            except requests.exceptions.Timeout:
                # Timeout might indicate successful time-based injection
                self.log_test(
                    payload["name"],
                    payload["email"],
                    "BLOCKED",
                    "TIMEOUT (Potential vulnerability)"
                )
            except Exception as e:
                self.log_test(
                    payload["name"],
                    payload["email"],
                    "BLOCKED",
                    f"ERROR: {str(e)}"
                )
    
    def test_sql_injection_registration(self):
        """Test SQL injection attempts on registration endpoint"""
        print("\n🔍 Testing SQL Injection on Registration Endpoint")
        print("=" * 50)
        
        injection_payloads = [
            {
                "name": "SQL Injection in First Name",
                "data": {
                    "firstName": "John'; DROP TABLE users; --",
                    "lastName": "Doe",
                    "email": "test@example.com",
                    "password": "password123"
                }
            },
            {
                "name": "SQL Injection in Email",
                "data": {
                    "firstName": "John",
                    "lastName": "Doe", 
                    "email": "test@example.com'; INSERT INTO users (email) VALUES ('hacker@evil.com'); --",
                    "password": "password123"
                }
            },
            {
                "name": "XSS in Registration",
                "data": {
                    "firstName": "<script>alert('xss')</script>",
                    "lastName": "Doe",
                    "email": "xss@example.com",
                    "password": "password123"
                }
            }
        ]
        
        for payload in injection_payloads:
            try:
                response = requests.post(
                    f"{self.base_url}/api/auth/register",
                    json=payload["data"],
                    timeout=10
                )
                
                # Injection attempts should be blocked (return 400)
                expected_blocked = response.status_code == 400
                actual_blocked = response.status_code == 400
                
                self.log_test(
                    payload["name"],
                    str(payload["data"]),
                    "BLOCKED",
                    "BLOCKED" if actual_blocked else "ALLOWED"
                )
                
            except Exception as e:
                self.log_test(
                    payload["name"],
                    str(payload["data"]),
                    "BLOCKED", 
                    f"ERROR: {str(e)}"
                )
    
    def test_valid_operations(self):
        """Test that valid operations still work"""
        print("\n✅ Testing Valid Operations")
        print("=" * 50)
        
        # Test valid registration
        try:
            response = requests.post(
                f"{self.base_url}/api/auth/register",
                json={
                    "firstName": "Test",
                    "lastName": "User",
                    "email": f"testuser_{int(time.time())}@example.com",
                    "password": "validpassword123"
                },
                timeout=10
            )
            
            self.log_test(
                "Valid Registration",
                "Normal user data",
                "SUCCESS",
                "SUCCESS" if response.status_code == 200 else "FAILED"
            )
            
        except Exception as e:
            self.log_test(
                "Valid Registration",
                "Normal user data",
                "SUCCESS",
                f"ERROR: {str(e)}"
            )
        
        # Test valid login (using demo account)
        try:
            response = requests.post(
                f"{self.base_url}/api/auth/login",
                json={
                    "email": "admin@company.com",
                    "password": "admin123"
                },
                timeout=10
            )
            
            self.log_test(
                "Valid Login",
                "Demo admin account",
                "SUCCESS",
                "SUCCESS" if response.status_code == 200 else "FAILED"
            )
            
        except Exception as e:
            self.log_test(
                "Valid Login",
                "Demo admin account", 
                "SUCCESS",
                f"ERROR: {str(e)}"
            )
    
    def test_input_validation(self):
        """Test input validation rules"""
        print("\n🔍 Testing Input Validation")
        print("=" * 50)
        
        validation_tests = [
            {
                "name": "Empty Email",
                "data": {"email": "", "password": "password"},
                "expected": "REJECTED"
            },
            {
                "name": "Invalid Email Format",
                "data": {"email": "not-an-email", "password": "password"},
                "expected": "REJECTED"
            },
            {
                "name": "SQL Keywords in Input",
                "data": {"email": "SELECT * FROM users", "password": "password"},
                "expected": "REJECTED"
            },
            {
                "name": "Script Tags in Input", 
                "data": {"email": "<script>alert(1)</script>", "password": "password"},
                "expected": "REJECTED"
            }
        ]
        
        for test in validation_tests:
            try:
                response = requests.post(
                    f"{self.base_url}/api/auth/login",
                    json=test["data"],
                    timeout=10
                )
                
                actual = "REJECTED" if response.status_code in [400, 401] else "ACCEPTED"
                
                self.log_test(
                    test["name"],
                    str(test["data"]),
                    test["expected"],
                    actual
                )
                
            except Exception as e:
                self.log_test(
                    test["name"],
                    str(test["data"]),
                    test["expected"],
                    f"ERROR: {str(e)}"
                )
    
    def run_all_tests(self):
        """Run all security tests"""
        print("🛡️  RBAC Security Testing Suite")
        print("=" * 60)
        print(f"Testing against: {self.base_url}")
        print(f"Test started at: {datetime.now()}")
        
        # Run all test suites
        self.test_sql_injection_login()
        self.test_sql_injection_registration()
        self.test_input_validation()
        self.test_valid_operations()
        
        # Generate summary
        self.generate_summary()
    
    def generate_summary(self):
        """Generate test summary"""
        print("\n📊 Test Summary")
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
        
        # Save detailed results
        with open('security_test_results.json', 'w') as f:
            json.dump(self.test_results, f, indent=2)
        
        print(f"\nDetailed results saved to: security_test_results.json")
        print("\n🔒 Security testing completed!")

def main():
    """Main function to run security tests"""
    print("Starting RBAC Security Tests...")
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
    
    # Run security tests
    tester = SecurityTester()
    tester.run_all_tests()

if __name__ == "__main__":
    main()
