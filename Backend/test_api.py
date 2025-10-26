"""
Test script for LexiFlow AI Backend API
Run this script to test the API endpoints after starting the server
"""
import requests
import json
from datetime import datetime

# API Configuration
BASE_URL = "http://localhost:8000"
TEST_USER = {
    "full_name": "Test User",
    "email": f"test_{datetime.now().timestamp()}@example.com",
    "password": "TestPass123"
}

def print_response(title, response):
    """Pretty print API response"""
    print(f"\n{'='*60}")
    print(f"📋 {title}")
    print(f"{'='*60}")
    print(f"Status Code: {response.status_code}")
    try:
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    except:
        print(f"Response: {response.text}")
    print(f"{'='*60}\n")


def test_root():
    """Test root endpoint"""
    response = requests.get(f"{BASE_URL}/")
    print_response("Root Endpoint", response)
    return response.status_code == 200


def test_health():
    """Test health check endpoint"""
    response = requests.get(f"{BASE_URL}/health")
    print_response("Health Check", response)
    return response.status_code == 200


def test_register():
    """Test user registration"""
    response = requests.post(
        f"{BASE_URL}/auth/register",
        json=TEST_USER
    )
    print_response("User Registration", response)
    return response.status_code == 201


def test_login():
    """Test user login and return token"""
    response = requests.post(
        f"{BASE_URL}/auth/login",
        json={
            "email": TEST_USER["email"],
            "password": TEST_USER["password"]
        }
    )
    print_response("User Login", response)
    
    if response.status_code == 200:
        return response.json().get("access_token")
    return None


def test_get_profile(token):
    """Test getting user profile"""
    response = requests.get(
        f"{BASE_URL}/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    print_response("Get User Profile", response)
    return response.status_code == 200


def test_verify_token(token):
    """Test token verification"""
    response = requests.get(
        f"{BASE_URL}/auth/verify",
        headers={"Authorization": f"Bearer {token}"}
    )
    print_response("Verify Token", response)
    return response.status_code == 200


def test_duplicate_registration():
    """Test duplicate email registration (should fail)"""
    response = requests.post(
        f"{BASE_URL}/auth/register",
        json=TEST_USER
    )
    print_response("Duplicate Registration (Should Fail)", response)
    return response.status_code == 400


def test_invalid_login():
    """Test login with invalid credentials (should fail)"""
    response = requests.post(
        f"{BASE_URL}/auth/login",
        json={
            "email": TEST_USER["email"],
            "password": "WrongPassword123"
        }
    )
    print_response("Invalid Login (Should Fail)", response)
    return response.status_code == 401


def test_unauthorized_access():
    """Test accessing protected endpoint without token (should fail)"""
    response = requests.get(f"{BASE_URL}/auth/me")
    print_response("Unauthorized Access (Should Fail)", response)
    return response.status_code == 403


def main():
    """Run all tests"""
    print("\n🚀 Starting LexiFlow AI Backend API Tests")
    print(f"🌐 Base URL: {BASE_URL}")
    print(f"👤 Test User: {TEST_USER['email']}\n")
    
    results = {}
    
    try:
        # Test public endpoints
        print("📝 Testing Public Endpoints...")
        results["Root"] = test_root()
        results["Health Check"] = test_health()
        
        # Test authentication flow
        print("\n🔐 Testing Authentication Flow...")
        results["Registration"] = test_register()
        
        token = test_login()
        if token:
            results["Login"] = True
            print(f"\n🎫 Token obtained: {token[:20]}...")
            
            # Test protected endpoints
            print("\n🛡️  Testing Protected Endpoints...")
            results["Get Profile"] = test_get_profile(token)
            results["Verify Token"] = test_verify_token(token)
        else:
            results["Login"] = False
            print("❌ Login failed, skipping protected endpoint tests")
        
        # Test error cases
        print("\n⚠️  Testing Error Cases...")
        results["Duplicate Registration"] = test_duplicate_registration()
        results["Invalid Login"] = test_invalid_login()
        results["Unauthorized Access"] = test_unauthorized_access()
        
        # Print summary
        print("\n" + "="*60)
        print("📊 TEST SUMMARY")
        print("="*60)
        
        passed = sum(1 for v in results.values() if v)
        total = len(results)
        
        for test_name, passed_test in results.items():
            status = "✅ PASS" if passed_test else "❌ FAIL"
            print(f"{status} - {test_name}")
        
        print("="*60)
        print(f"Results: {passed}/{total} tests passed")
        print("="*60 + "\n")
        
        if passed == total:
            print("🎉 All tests passed successfully!")
        else:
            print(f"⚠️  {total - passed} test(s) failed")
        
        return passed == total
        
    except requests.exceptions.ConnectionError:
        print("\n❌ ERROR: Could not connect to the API server.")
        print("Make sure the server is running on http://localhost:8000")
        print("Run: python main.py")
        return False
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        return False


if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)

