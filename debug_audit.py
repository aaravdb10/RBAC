#!/usr/bin/env python3
"""
Debug script to test audit trail endpoints
"""

import requests
import json

def test_login_and_audit():
    base_url = "http://localhost:5000"
    
    print("🔐 Testing Login and Audit Access")
    print("=" * 50)
    
    # Test admin login
    login_data = {
        "email": "admin@company.com",
        "password": "admin123"
    }
    
    session = requests.Session()
    
    print("\n1. Attempting admin login...")
    login_response = session.post(f"{base_url}/api/auth/login", json=login_data)
    print(f"   Status: {login_response.status_code}")
    
    if login_response.status_code == 200:
        login_result = login_response.json()
        print(f"   Login success: {login_result.get('success')}")
        print(f"   User role: {login_result.get('user', {}).get('role')}")
        
        # Test audit dashboard access
        print("\n2. Testing audit dashboard access...")
        dashboard_response = session.get(f"{base_url}/api/audit/dashboard")
        print(f"   Status: {dashboard_response.status_code}")
        
        if dashboard_response.status_code != 200:
            print(f"   Error: {dashboard_response.text}")
        else:
            dashboard_data = dashboard_response.json()
            print(f"   Success: {dashboard_data.get('success')}")
        
        # Test audit logs access
        print("\n3. Testing audit logs access...")
        logs_response = session.get(f"{base_url}/api/audit/logs?limit=5")
        print(f"   Status: {logs_response.status_code}")
        
        if logs_response.status_code != 200:
            print(f"   Error: {logs_response.text}")
        else:
            logs_data = logs_response.json()
            print(f"   Success: {logs_data.get('success')}")
            print(f"   Logs count: {len(logs_data.get('audit_logs', []))}")
        
        # Test security events access
        print("\n4. Testing security events access...")
        events_response = session.get(f"{base_url}/api/audit/security-events?limit=5")
        print(f"   Status: {events_response.status_code}")
        
        if events_response.status_code != 200:
            print(f"   Error: {events_response.text}")
        else:
            events_data = events_response.json()
            print(f"   Success: {events_data.get('success')}")
            print(f"   Events count: {len(events_data.get('security_events', []))}")
    
    else:
        print(f"   Login failed: {login_response.text}")

if __name__ == "__main__":
    test_login_and_audit()
