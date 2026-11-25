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

def test_history_driven_adaptive_suggestion():
    print("\nTesting History-Driven Adaptive Engine Suggestions...")
    import uuid
    # Case 1: High performance user (fast solve time, high accuracy, 0 timeouts)
    expert_user = f"expert_user_{uuid.uuid4().hex[:8]}"
    for _ in range(4):
        ai_rl_system.record_session(expert_user, {
            "user_id": expert_user,
            "completion_time": 8.0,
            "solve_time": 8.0,
            "challenge_accuracy": 98.0,
            "timeout_count": 0,
            "alarm_success": True,
            "snooze_count": 0,
            "challenge_difficulty": "hard",
            "challenge_type": "math"
        })
    rec_expert = ai_rl_system.get_recommendation(expert_user)
    print(f"Expert History User Recommendation: {rec_expert['difficulty']} (Reason: {rec_expert['reason']})")
    assert rec_expert["difficulty"] == "expert", f"Expected 'expert' difficulty, got {rec_expert['difficulty']}"
    assert "Elite wake speed" in rec_expert["reason"]

    # Case 2: Struggling user (slow solve time, timeouts)
    struggling_user = f"struggle_user_{uuid.uuid4().hex[:8]}"
    for _ in range(3):
        ai_rl_system.record_session(struggling_user, {
            "user_id": struggling_user,
            "completion_time": 32.0,
            "solve_time": 32.0,
            "challenge_accuracy": 60.0,
            "timeout_count": 3,
            "alarm_success": False,
            "snooze_count": 2,
            "challenge_difficulty": "medium",
            "challenge_type": "pattern"
        })
    rec_struggle = ai_rl_system.get_recommendation(struggling_user)
    print(f"Struggling History User Recommendation: {rec_struggle['difficulty']} (Reason: {rec_struggle['reason']})")
    assert rec_struggle["difficulty"] == "beginner", f"Expected 'beginner' difficulty, got {rec_struggle['difficulty']}"
    assert "Beginner" in rec_struggle["reason"]
    print("History-Driven Adaptive Engine Suggestions test passed!")

if __name__ == "__main__":
    test_metrics_extraction()
    test_behavioral_state_and_xgb()
    test_rl_loop()
    test_history_driven_adaptive_suggestion()
    print("\n==========================================")
    print("ALL VERIFICATION TESTS PASSED SUCCESSFULLY!")
    print("==========================================")
