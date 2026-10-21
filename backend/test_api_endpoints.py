import requests
import json
import time

BASE_URL = "http://127.0.0.1:8000"

def test_api():
    print("Testing FastAPI AI/RL Endpoints with Auth Token...")
    
    # 0. Auth - Signup or Login to get Token
    email = f"test_ai_{int(time.time())}@example.com"
    signup_payload = {
        "name": "Test AI User",
        "email": email,
        "password": "Password123!"
    }
    
    auth_res = requests.post(f"{BASE_URL}/api/auth/signup", json=signup_payload)
    if auth_res.status_code != 201:
        # Try login if user exists
        login_res = requests.post(f"{BASE_URL}/api/auth/login", json={"email": email, "password": "Password123!"})
        token = login_res.json()["token"]
    else:
        token = auth_res.json()["token"]
        
    headers = {"Authorization": f"Bearer {token}"}
    print(f"Obtained Auth Token: {token[:20]}...")
    
    # 1. Recommendation
    print("\n1. GET /api/ai/recommendation")
    res = requests.get(f"{BASE_URL}/api/ai/recommendation", headers=headers)
    print(f"Status: {res.status_code}")
    print(f"Response: {json.dumps(res.json(), indent=2)}")
    assert res.status_code == 200
    rec_data = res.json()
    assert "recommended_time" in rec_data
    
    # 2. Session Complete
    print("\n2. POST /api/ai/session-complete")
    payload = {
        "time": rec_data["recommended_time"],
        "puzzleType": rec_data["challenge"],
        "difficulty": rec_data["difficulty"],
        "status": "Success",
        "solve_time": 12.5,
        "accuracy": 100.0,
        "snoozes": 0,
        "wake_up_consistency": 95.0,
        "habit_score": 90.0
    }
    res = requests.post(f"{BASE_URL}/api/ai/session-complete", json=payload, headers=headers)
    print(f"Status: {res.status_code}")
    print(f"Response: {json.dumps(res.json(), indent=2)}")
    assert res.status_code == 200
    
    # 3. User State
    print("\n3. GET /api/ai/user-state")
    res = requests.get(f"{BASE_URL}/api/ai/user-state", headers=headers)
    print(f"Status: {res.status_code}")
    print(f"Response: {json.dumps(res.json(), indent=2)}")
    assert res.status_code == 200
    
    # 4. Analytics
    print("\n4. GET /api/ai/analytics")
    res = requests.get(f"{BASE_URL}/api/ai/analytics", headers=headers)
    print(f"Status: {res.status_code}")
    print(f"Response: {json.dumps(res.json(), indent=2)}")
    assert res.status_code == 200
    
    # 5. History
    print("\n5. GET /api/ai/recommendation-history")
    res = requests.get(f"{BASE_URL}/api/ai/recommendation-history", headers=headers)
    print(f"Status: {res.status_code}")
    print(f"Response: {json.dumps(res.json(), indent=2)}")
    assert res.status_code == 200
    
    print("\n=============================================")
    print("ALL FASTAPI REST API ENDPOINTS PASSED CLEANLY!")
    print("=============================================")

if __name__ == "__main__":
    test_api()
