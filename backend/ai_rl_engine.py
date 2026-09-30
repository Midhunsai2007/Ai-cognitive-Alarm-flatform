import os
import json
import numpy as np
import pandas as pd
import xgboost as xgb
from datetime import datetime
from typing import Dict, Any, List

class AIRLSystem:
    """
    Intelligent Cognitive Alarm Platform — AI RL Decision Engine.
    
    Demonstrates the complete closed-loop architecture:
    USER HISTORY 
    → XGBoost PREDICTION 
    → USER STATE 
    → REINFORCEMENT LEARNING 
    → PERSONALIZED ALARM 
    → USER PERFORMANCE 
    → REWARD 
    → POLICY UPDATE 
    → BETTER FUTURE ALARM
    """

    def __init__(self, data_path="ai_data"):
        self.data_path = data_path
        if not os.path.exists(self.data_path):
            os.makedirs(self.data_path)
            
        self.xgb_model_path = os.path.join(self.data_path, "xgb_model.json")
        self.q_table_path = os.path.join(self.data_path, "q_table.json")
        self.history_path = os.path.join(self.data_path, "user_history.json")
        self.experiences_path = os.path.join(self.data_path, "rl_experiences.json")
        
        self.q_table = self._load_q_table()
        self.user_history = self._load_history()
        self.experiences = self._load_experiences()
        
        # XGBoost models for predictions (4 outputs)
        self.xgb_success = xgb.XGBClassifier(eval_metric='logloss', max_depth=3, n_estimators=50)
        self.xgb_snooze = xgb.XGBRegressor(max_depth=3, n_estimators=50)
        self.xgb_accuracy = xgb.XGBRegressor(max_depth=3, n_estimators=50)
        self.xgb_response = xgb.XGBRegressor(max_depth=3, n_estimators=50)
        
        self.is_xgb_trained = False
        self._try_load_xgb()

        # Predefined Action Space
        # (Recommended Time, Challenge Type, Difficulty, Snooze Limit, Verification Method)
        self.action_space = []
        times = ["06:00", "06:30", "07:00", "07:30", "08:00"]
        challenges = ["math", "pattern", "memory", "stroop", "word"]
        difficulties = ["easy", "medium", "hard"]
        snooze_limits = [0, 2, 5]
        verification_methods = ["standard_single", "multi_step", "consecutive_correct"]

        # Build clean discrete action tuples
        for t in times:
            for c in challenges:
                for d in difficulties:
                    for s in snooze_limits:
                        v = "consecutive_correct" if d == "hard" else ("multi_step" if d == "medium" else "standard_single")
                        self.action_space.append({
                            "recommended_time": t,
                            "challenge": c,
                            "difficulty": d,
                            "snooze_limit": s,
                            "verification_method": v
                        })
                    
        self.alpha = 0.1  # Learning rate
        self.gamma = 0.9  # Discount factor
        self.epsilon = 0.15  # Exploration rate

    def _load_q_table(self) -> Dict[str, List[float]]:
        if os.path.exists(self.q_table_path):
            try:
                with open(self.q_table_path, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception:
                pass
        return {}
        
    def _save_q_table(self):
        try:
            with open(self.q_table_path, "w", encoding="utf-8") as f:
                json.dump(self.q_table, f, indent=2)
        except Exception:
            pass

    def _load_history(self) -> Dict[str, List[Dict[str, Any]]]:
        if os.path.exists(self.history_path):
            try:
                with open(self.history_path, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception:
                pass
        return {}
        
    def _save_history(self):
        try:
            with open(self.history_path, "w", encoding="utf-8") as f:
                json.dump(self.user_history, f, indent=2)
        except Exception:
            pass

    def _load_experiences(self) -> List[Dict[str, Any]]:
        if os.path.exists(self.experiences_path):
            try:
                with open(self.experiences_path, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception:
                pass
        return []

    def _save_experiences(self):
        try:
            with open(self.experiences_path, "w", encoding="utf-8") as f:
                json.dump(self.experiences[-200:], f, indent=2)
        except Exception:
            pass

    def _try_load_xgb(self):
        try:
            p_succ = self.xgb_model_path.replace(".json", "_succ.json")
            p_snooze = self.xgb_model_path.replace(".json", "_snooze.json")
            p_acc = self.xgb_model_path.replace(".json", "_acc.json")
            p_resp = self.xgb_model_path.replace(".json", "_resp.json")

            if os.path.exists(p_succ) and os.path.exists(p_snooze):
                self.xgb_success.load_model(p_succ)
                self.xgb_snooze.load_model(p_snooze)
                if os.path.exists(p_acc): self.xgb_accuracy.load_model(p_acc)
                if os.path.exists(p_resp): self.xgb_response.load_model(p_resp)
                self.is_xgb_trained = True
                return
        except Exception as e:
            print("XGBoost load note:", e)
        
        # Bootstrap with realistic cognitive wake telemetry dataset
        self._bootstrap_xgb()

    def _bootstrap_xgb(self):
        """Bootstraps XGBoost models with initial cognitive & circadian behavior telemetry."""
        try:
            np.random.seed(42)
            n_samples = 120
            # diff: 1=easy, 2=med, 3=hard; type: 1=math, 2=pattern, 3=memory, 4=stroop, 5=word
            diffs = np.random.choice([1, 2, 3], size=n_samples, p=[0.3, 0.5, 0.2])
            types = np.random.choice([1, 2, 3, 4, 5], size=n_samples)
            sleep_dur = np.random.uniform(5.5, 9.0, size=n_samples)
            snoozes = np.array([0 if s > 7.0 and np.random.rand() > 0.3 else np.random.choice([1, 2, 3, 4]) for s in sleep_dur])
            
            # Response & completion speed influenced by difficulty and sleep
            comp_time = np.clip(10.0 + diffs * 4.0 - (sleep_dur - 7.0) * 1.5 + snoozes * 2.0 + np.random.normal(0, 2, n_samples), 6.0, 35.0)
            consistency = np.clip(95.0 - snoozes * 15.0 + (sleep_dur - 6.0) * 4.0 + np.random.normal(0, 3, n_samples), 40.0, 99.0)
            habit_score = np.clip(consistency * 0.85 + (sleep_dur / 8.0) * 15.0 - snoozes * 5.0, 45.0, 98.0)
            
            # Targets:
            # 1. Success prob (1 if wake on time / solved)
            y_succ = np.array([1 if snoozes[i] <= 1 and comp_time[i] < 25.0 else (0 if snoozes[i] > 2 else int(np.random.rand() > 0.35)) for i in range(n_samples)])
            y_snooze = snoozes.astype(float)
            y_acc = np.clip(96.0 - diffs * 5.0 - snoozes * 6.0 + (sleep_dur - 6.0) * 3.0 + np.random.normal(0, 3, n_samples), 45.0, 99.0)
            y_resp = np.clip(comp_time * 0.45 + np.random.normal(0, 0.8, n_samples), 2.0, 15.0)

            X = pd.DataFrame({
                "diff_val": diffs,
                "type_val": types,
                "snooze_count": snoozes,
                "completion_time": comp_time,
                "sleep_duration": sleep_dur,
                "wake_up_consistency": consistency,
                "habit_score": habit_score
            })

            self.xgb_success.fit(X, y_succ)
            self.xgb_snooze.fit(X, y_snooze)
            self.xgb_accuracy.fit(X, y_acc)
            self.xgb_response.fit(X, y_resp)

            self.xgb_success.save_model(self.xgb_model_path.replace(".json", "_succ.json"))
            self.xgb_snooze.save_model(self.xgb_model_path.replace(".json", "_snooze.json"))
            self.xgb_accuracy.save_model(self.xgb_model_path.replace(".json", "_acc.json"))
            self.xgb_response.save_model(self.xgb_model_path.replace(".json", "_resp.json"))

            self.is_xgb_trained = True
        except Exception as e:
            print("XGBoost bootstrap note:", e)

    def extract_user_metrics(self, session: Dict[str, Any]) -> Dict[str, Any]:
        """
        Extracts the 11 key behavioral metrics from a user session:
        1. wake_up_time
        2. snooze_count
        3. alarm_success
        4. challenge_type
        5. challenge_difficulty
        6. challenge_accuracy
        7. response_time
        8. completion_time
        9. sleep_duration
        10. wake_up_consistency
        11. habit_score
        """
        wake_up_time = session.get("wake_up_time", "06:30")
        snooze_count = int(session.get("snooze_count", session.get("snoozes", 0)))
        alarm_success = bool(session.get("alarm_success", session.get("success", session.get("status") == "Success")))
        challenge_type = str(session.get("challenge", session.get("puzzleType", "math"))).lower()
        challenge_difficulty = str(session.get("difficulty", "medium")).lower()
        challenge_accuracy = float(session.get("challenge_accuracy", session.get("accuracy", 90.0 if alarm_success else 40.0)))
        
        solve_t = float(session.get("completion_time", session.get("solve_time", session.get("solveTime", 15))))
        if isinstance(solve_t, str):
            try:
                solve_t = float(solve_t.replace("s", "").strip())
            except Exception:
                solve_t = 15.0
                
        response_time = float(session.get("response_time", max(2.0, solve_t * 0.4)))
        completion_time = solve_t
        sleep_duration = float(session.get("sleep_duration", 7.5))
        wake_up_consistency = float(session.get("wake_up_consistency", 90.0 if alarm_success else 50.0))
        habit_score = float(session.get("habit_score", 86.0 if alarm_success else 60.0))

        return {
            "wake_up_time": wake_up_time,
            "snooze_count": snooze_count,
            "alarm_success": alarm_success,
            "challenge_type": challenge_type,
            "challenge_difficulty": challenge_difficulty,
            "challenge_accuracy": challenge_accuracy,
            "response_time": response_time,
            "completion_time": completion_time,
            "sleep_duration": sleep_duration,
            "wake_up_consistency": wake_up_consistency,
            "habit_score": habit_score
        }

    def get_behavioral_state(self, user_id: str) -> str:
        """
        Constructs a behavioral state from user historical telemetry.
        Returns a discretized State Vector representation:
        {snooze_level}_{consistency_level}_{accuracy_level}_{speed_level}
        """
        history = self.user_history.get(user_id, [])
        if not history or len(history) < 2:
            return "COLD_START"

        recent = history[-5:]  # Analyze last 5 alarm sessions
        metrics_list = [self.extract_user_metrics(h) for h in recent]

        avg_snoozes = np.mean([m["snooze_count"] for m in metrics_list])
        avg_consistency = np.mean([m["wake_up_consistency"] for m in metrics_list])
        avg_accuracy = np.mean([m["challenge_accuracy"] for m in metrics_list])
        avg_speed = np.mean([m["completion_time"] for m in metrics_list])

        # Discretize metrics into State Representation
        snooze_level = "LOW_SNOOZE" if avg_snoozes <= 1 else ("MED_SNOOZE" if avg_snoozes <= 3 else "HIGH_SNOOZE")
        consistency_level = "HIGH_CONSISTENCY" if avg_consistency >= 80 else ("MED_CONSISTENCY" if avg_consistency >= 60 else "LOW_CONSISTENCY")
        accuracy_level = "HIGH_ACC" if avg_accuracy >= 85 else ("MED_ACC" if avg_accuracy >= 70 else "LOW_ACC")
        speed_level = "FAST_SPEED" if avg_speed < 12 else ("MED_SPEED" if avg_speed <= 22 else "SLOW_SPEED")

        return f"{snooze_level}_{consistency_level}_{accuracy_level}_{speed_level}"

    def extract_features_df(self, history_list: List[Dict[str, Any]]) -> pd.DataFrame:
        """Helper to transform session history into tabular features for XGBoost."""
        if not history_list:
            return pd.DataFrame()

        diff_map = {"easy": 1, "medium": 2, "hard": 3}
        type_map = {"math": 1, "pattern": 2, "memory": 3, "stroop": 4, "word": 5}

        records = []
        for session in history_list:
            m = self.extract_user_metrics(session)
            records.append({
                "diff_val": diff_map.get(m["challenge_difficulty"], 2),
                "type_val": type_map.get(m["challenge_type"], 1),
                "snooze_count": m["snooze_count"],
                "completion_time": m["completion_time"],
                "sleep_duration": m["sleep_duration"],
                "wake_up_consistency": m["wake_up_consistency"],
                "habit_score": m["habit_score"]
            })
        return pd.DataFrame(records)

    def predict_user_behavior(self, user_id: str) -> Dict[str, float]:
        """
        XGBoost Prediction Layer:
        Predicts:
        - wake_up_success_probability
        - expected_snooze_behavior
        - cognitive_challenge_performance
        - expected_response_performance
        """
        history = self.user_history.get(user_id, [])
        
        # Cold start heuristic fallback
        if not history or len(history) < 2 or not self.is_xgb_trained:
            streak = len(history)
            return {
                "wake_up_success_probability": round(min(0.95, 0.75 + streak * 0.05), 2),
                "expected_snooze_behavior": round(max(0.0, 1.5 - streak * 0.2), 1),
                "cognitive_challenge_performance": round(min(98.0, 82.0 + streak * 3.0), 1),
                "expected_response_performance": round(max(8.0, 16.0 - streak * 1.5), 1)
            }

        try:
            recent_df = self.extract_features_df([history[-1]])
            if len(recent_df) > 0:
                p_success = float(self.xgb_success.predict_proba(recent_df)[0][1]) if hasattr(self.xgb_success, "classes_") else 0.88
                p_snooze = float(self.xgb_snooze.predict(recent_df)[0])
                p_accuracy = float(self.xgb_accuracy.predict(recent_df)[0]) if hasattr(self.xgb_accuracy, "feature_importances_") else 88.0
                p_response = float(self.xgb_response.predict(recent_df)[0]) if hasattr(self.xgb_response, "feature_importances_") else 14.0

                return {
                    "wake_up_success_probability": round(float(np.clip(p_success, 0.40, 0.99)), 2),
                    "expected_snooze_behavior": round(float(np.clip(p_snooze, 0.0, 5.0)), 1),
                    "cognitive_challenge_performance": round(float(np.clip(p_accuracy, 50.0, 99.0)), 1),
                    "expected_response_performance": round(float(np.clip(p_response, 5.0, 45.0)), 1)
                }
        except Exception as e:
            print("XGBoost prediction fallback:", e)

        return {
            "wake_up_success_probability": 0.86,
            "expected_snooze_behavior": 0.5,
            "cognitive_challenge_performance": 88.0,
            "expected_response_performance": 13.5
        }

    def get_recommendation(self, user_id: str) -> Dict[str, Any]:
        """
        Passes user behavioral state + XGBoost predictions to RL Decision Engine.
        Selects personalized alarm configuration from predefined actions.
        Handles cold start for new users.
        """
        state = self.get_behavioral_state(user_id)
        xgb_preds = self.predict_user_behavior(user_id)

        # 1. Cold-Start Handling
        if state == "COLD_START":
            return {
                "recommended_time": "07:00",
                "challenge": "math",
                "difficulty": "easy",
                "snooze_limit": 3,
                "verification_method": "standard_single",
                "predicted_success": 0.85,
                "expected_snoozes": 1.0,
                "expected_accuracy": 85.0,
                "expected_response_time": 15.0,
                "reason": "Cold Start: Baseline alarm configuration initialized to learn your wake-up preferences.",
                "state": state,
                "is_cold_start": True
            }

        # 2. Reinforcement Learning Action Selection (Epsilon-Greedy)
        if state not in self.q_table or len(self.q_table[state]) != len(self.action_space):
            self.q_table[state] = [0.0] * len(self.action_space)

        if np.random.rand() < self.epsilon:
            action_idx = int(np.random.randint(len(self.action_space)))
            reason = "RL Exploration: Trying a tailored challenge combination to optimize your morning wakefulness."
        else:
            action_idx = int(np.argmax(self.q_table[state]))
            reason = "RL Exploitation: Policy selected optimal challenge & snooze configuration based on peak historical rewards."

        action = self.action_space[action_idx]

        return {
            "recommended_time": action["recommended_time"],
            "challenge": action["challenge"],
            "difficulty": action["difficulty"],
            "snooze_limit": action["snooze_limit"],
            "verification_method": action["verification_method"],
            "predicted_success": xgb_preds["wake_up_success_probability"],
            "expected_snoozes": xgb_preds["expected_snooze_behavior"],
            "expected_accuracy": xgb_preds["cognitive_challenge_performance"],
            "expected_response_time": xgb_preds["expected_response_performance"],
            "reason": reason,
            "state": state,
            "is_cold_start": False
        }

    def calculate_reward(self, session_data: Dict[str, Any]) -> float:
        """
        Calculates RL reward after every alarm session based on:
        - successful wake-up (+15) / failure (-10)
        - snooze count penalty (-3 per snooze)
        - challenge accuracy bonus (+10 max)
        - completion speed bonus (+5 for <12s, -3 for >25s)
        - wake-up consistency bonus (+5)
        """
        metrics = self.extract_user_metrics(session_data)
        reward = 0.0

        if metrics["alarm_success"]:
            reward += 15.0
        else:
            reward -= 10.0

        # Snooze reduction reward/penalty
        reward -= (metrics["snooze_count"] * 3.0)

        # Challenge accuracy bonus
        reward += (metrics["challenge_accuracy"] / 10.0)

        # Speed bonus
        if metrics["completion_time"] < 12.0:
            reward += 5.0
        elif metrics["completion_time"] > 25.0:
            reward -= 3.0

        # Consistency bonus
        if metrics["wake_up_consistency"] >= 85.0:
            reward += 5.0

        return round(reward, 2)

    def update_policy(self, user_id: str, action_dict: Dict[str, Any], session_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Updates the RL Q-policy after each completed alarm session.
        Stores experience as: STATE → ACTION → REWARD → NEXT STATE
        """
        state = self.get_behavioral_state(user_id)

        # Calculate Reward
        reward = self.calculate_reward(session_data)
        session_data["calculated_reward"] = reward
        session_data["user_id"] = user_id
        session_data["timestamp"] = datetime.utcnow().isoformat()

        # Log to User History
        if user_id not in self.user_history:
            self.user_history[user_id] = []
        self.user_history[user_id].append(session_data)
        self._save_history()

        # Extract Next State
        next_state = self.get_behavioral_state(user_id)

        # Match Action to Index
        action_idx = 0
        req_c = action_dict.get("challenge", "math").lower()
        req_d = action_dict.get("difficulty", "medium").lower()
        req_s = int(action_dict.get("snooze_limit", 3))

        for idx, act in enumerate(self.action_space):
            if act["challenge"] == req_c and act["difficulty"] == req_d and act["snooze_limit"] == req_s:
                action_idx = idx
                break

        # Q-Learning Update
        if state not in self.q_table or len(self.q_table[state]) != len(self.action_space):
            self.q_table[state] = [0.0] * len(self.action_space)
        if next_state not in self.q_table or len(self.q_table[next_state]) != len(self.action_space):
            self.q_table[next_state] = [0.0] * len(self.action_space)

        current_q = self.q_table[state][action_idx]
        max_next_q = float(np.max(self.q_table[next_state]))

        # Q(S,A) = Q(S,A) + alpha * (R + gamma * max Q(S',A') - Q(S,A))
        new_q = current_q + self.alpha * (reward + self.gamma * max_next_q - current_q)
        self.q_table[state][action_idx] = round(new_q, 4)
        self._save_q_table()

        # Store RL Experience tuple: STATE -> ACTION -> REWARD -> NEXT STATE
        experience = {
            "id": f"exp-{int(datetime.utcnow().timestamp())}",
            "user_id": user_id,
            "state": state,
            "action": action_dict,
            "reward": reward,
            "next_state": next_state,
            "timestamp": session_data["timestamp"]
        }
        self.experiences.append(experience)
        self._save_experiences()

        # Retrain XGBoost Models
        self._retrain_xgboost()

        return {
            "state": state,
            "action": action_dict,
            "reward": reward,
            "next_state": next_state,
            "new_q_value": round(new_q, 4),
            "is_xgboost_trained": self.is_xgb_trained
        }

    def _retrain_xgboost(self):
        """Retrains XGBoost predictors combining real user telemetry with domain baseline."""
        all_sessions = []
        for uid, hist in self.user_history.items():
            for h in hist:
                all_sessions.append(h)

        try:
            user_df = self.extract_features_df(all_sessions) if all_sessions else pd.DataFrame()
            
            # If user has sessions, generate corresponding targets
            if len(user_df) > 0:
                y_succ = np.array([1 if h.get("success", h.get("status") == "Success") else 0 for h in all_sessions])
                y_snooze = np.array([float(h.get("snooze_count", h.get("snoozes", 0))) for h in all_sessions])
                y_acc = np.array([float(h.get("challenge_accuracy", 90.0 if y_succ[i] else 40.0)) for i, h in enumerate(all_sessions)])
                y_resp = np.array([float(h.get("completion_time", 15.0)) for h in all_sessions])

                # For small user histories, augment with base data to prevent single-class collapse in XGBoost
                if len(all_sessions) < 20 or len(np.unique(y_succ)) < 2:
                    np.random.seed(42)
                    n_synth = max(30, 60 - len(all_sessions))
                    diffs = np.random.choice([1, 2, 3], size=n_synth, p=[0.3, 0.5, 0.2])
                    types = np.random.choice([1, 2, 3, 4, 5], size=n_synth)
                    sleep_dur = np.random.uniform(5.5, 9.0, size=n_synth)
                    snoozes = np.array([0 if s > 7.0 and np.random.rand() > 0.3 else np.random.choice([1, 2, 3, 4]) for s in sleep_dur])
                    comp_time = np.clip(10.0 + diffs * 4.0 - (sleep_dur - 7.0) * 1.5 + snoozes * 2.0 + np.random.normal(0, 2, n_synth), 6.0, 35.0)
                    consistency = np.clip(95.0 - snoozes * 15.0 + (sleep_dur - 6.0) * 4.0 + np.random.normal(0, 3, n_synth), 40.0, 99.0)
                    habit_score = np.clip(consistency * 0.85 + (sleep_dur / 8.0) * 15.0 - snoozes * 5.0, 45.0, 98.0)

                    s_succ = np.array([1 if snoozes[i] <= 1 and comp_time[i] < 25.0 else (0 if snoozes[i] > 2 else int(np.random.rand() > 0.35)) for i in range(n_synth)])
                    s_snooze = snoozes.astype(float)
                    s_acc = np.clip(96.0 - diffs * 5.0 - snoozes * 6.0 + (sleep_dur - 6.0) * 3.0 + np.random.normal(0, 3, n_synth), 45.0, 99.0)
                    s_resp = np.clip(comp_time * 0.45 + np.random.normal(0, 0.8, n_synth), 2.0, 15.0)

                    synth_df = pd.DataFrame({
                        "diff_val": diffs,
                        "type_val": types,
                        "snooze_count": snoozes,
                        "completion_time": comp_time,
                        "sleep_duration": sleep_dur,
                        "wake_up_consistency": consistency,
                        "habit_score": habit_score
                    })

                    X = pd.concat([user_df, synth_df], ignore_index=True)
                    y_succ = np.concatenate([y_succ, s_succ])
                    y_snooze = np.concatenate([y_snooze, s_snooze])
                    y_acc = np.concatenate([y_acc, s_acc])
                    y_resp = np.concatenate([y_resp, s_resp])
                else:
                    X = user_df[['diff_val', 'type_val', 'snooze_count', 'completion_time', 'sleep_duration', 'wake_up_consistency', 'habit_score']]

                self.xgb_success.fit(X, y_succ)
                self.xgb_snooze.fit(X, y_snooze)
                self.xgb_accuracy.fit(X, y_acc)
                self.xgb_response.fit(X, y_resp)

                self.xgb_success.save_model(self.xgb_model_path.replace(".json", "_succ.json"))
                self.xgb_snooze.save_model(self.xgb_model_path.replace(".json", "_snooze.json"))
                self.xgb_accuracy.save_model(self.xgb_model_path.replace(".json", "_acc.json"))
                self.xgb_response.save_model(self.xgb_model_path.replace(".json", "_resp.json"))

                self.is_xgb_trained = True
        except Exception as e:
            print("XGBoost retraining note:", e)

# Global Singleton Instance
ai_rl_system = AIRLSystem()

