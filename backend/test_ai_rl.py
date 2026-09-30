import sys
import os

# Ensure backend directory is in path
sys.path.append(os.path.dirname(__file__))

from ai_rl_engine import ai_rl_system

def test_metrics_extraction():
    print("Testing 11-metric extraction...")
    session = {
        "wake_up_time": "07:00",
        "snooze_count": 1,
        "alarm_success": True,
        "challenge_type": "math",
        "challenge_difficulty": "medium",
        "challenge_accuracy": 95.0,
        "response_time": 3.2,
        "completion_time": 20.0,
        "sleep_duration": 7.5,
        "wake_up_consistency": 85.0,
        "habit_score": 80.0
    }
    extracted = ai_rl_system.extract_user_metrics(session)
    print(f"Extracted Metrics ({len(extracted)} total): {extracted}")
    assert len(extracted) == 11
    assert extracted["wake_up_time"] == "07:00"
    assert extracted["snooze_count"] == 1
    assert extracted["alarm_success"] is True
    print("11-Metric extraction test passed!")

def test_behavioral_state_and_xgb():
    print("\nTesting Behavioral State & XGBoost Predictions...")
    import uuid
    user_id = f"test_user_{uuid.uuid4().hex[:8]}"
    state = ai_rl_system.get_behavioral_state(user_id)
    print(f"Behavioral State for new user: {state}")
    assert state == "COLD_START"
    
    preds = ai_rl_system.predict_user_behavior(user_id)
    print(f"XGBoost Multi-Target Predictions: {preds}")
    assert "wake_up_success_probability" in preds
    assert "expected_snooze_behavior" in preds
    assert "cognitive_challenge_performance" in preds
    assert "expected_response_performance" in preds
    print("Behavioral State & XGBoost test passed!")

def test_rl_loop():
    print("\nTesting Complete RL Decision & Reward Loop...")
    import uuid
    user_id = f"test_user_{uuid.uuid4().hex[:8]}"
    
    # Step 1: Recommendation (Cold Start)
    rec = ai_rl_system.get_recommendation(user_id)
    print(f"RL Recommendation: {rec}")
    assert "recommended_time" in rec
    assert "challenge" in rec
    assert "difficulty" in rec
    assert "snooze_limit" in rec
    
    # Step 2: Simulate Session Completion & Update Policy
    action_dict = {
        "challenge": rec["challenge"],
        "difficulty": rec["difficulty"],
        "snooze_limit": rec["snooze_limit"]
    }
    session = {
        "wake_up_time": rec["recommended_time"],
        "snooze_count": 0,
        "alarm_success": True,
        "challenge_type": rec["challenge"],
        "challenge_difficulty": rec["difficulty"],
        "challenge_accuracy": 100.0,
        "response_time": 2.0,
        "completion_time": 15.0,
        "sleep_duration": 8.0,
        "wake_up_consistency": 90.0,
        "habit_score": 85.0
    }
    
    policy_res = ai_rl_system.update_policy(user_id, action_dict, session)
    print(f"Session Completion & Reward Result: {policy_res}")
    assert "reward" in policy_res
    assert policy_res["reward"] > 0, "Fast, no-snooze wake up should receive a positive reward"
    assert "state" in policy_res
    assert "next_state" in policy_res
    print(f"Logged RL Experience Transition: {policy_res['state']} -> Action {policy_res['action']} -> Reward {policy_res['reward']} -> {policy_res['next_state']}")
    print("Complete RL Decision & Reward Loop test passed!")

if __name__ == "__main__":
    test_metrics_extraction()
    test_behavioral_state_and_xgb()
    test_rl_loop()
    print("\n==========================================")
    print("ALL VERIFICATION TESTS PASSED SUCCESSFULLY!")
    print("==========================================")
