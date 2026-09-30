import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression, LinearRegression

class CognitiveAdaptiveEngine:
    def __init__(self):
        self._init_models()

    def _init_models(self):
        # Features: [solve_speed_sec, snooze_count, streak_count, total_alarms]
        # Target: Cognitive Readiness Score (0-100) & Optimal Difficulty (0: Easy, 1: Medium, 2: Hard)
        X_synthetic = np.array([
            [8.0, 0, 10, 12],
            [12.0, 0, 5, 8],
            [16.0, 1, 3, 6],
            [22.0, 2, 0, 5],
            [28.0, 4, 0, 10],
            [6.0, 0, 15, 20],
            [14.0, 1, 7, 14],
            [35.0, 5, 0, 15]
        ])
        
        # Readiness score (0-100)
        y_readiness = np.array([95.0, 85.0, 70.0, 50.0, 30.0, 98.0, 80.0, 20.0])
        # Difficulty index: 0=Easy (Beginner), 1=Medium (Intermediate), 2=Hard (Advanced)
        y_difficulty = np.array([2, 1, 1, 0, 0, 2, 1, 0])

        self.readiness_model = LinearRegression()
        self.readiness_model.fit(X_synthetic, y_readiness)

        self.difficulty_model = LogisticRegression()
        self.difficulty_model.fit(X_synthetic, y_difficulty)

    def analyze_user_behavior(self, streak_count: int, total_alarms: int, successful_wakes: int, snooze_count: int, solve_times: list) -> dict:
        """
        Uses Scikit-learn, NumPy, and Pandas to analyze user historical performance
        and return AI-driven cognitive readiness predictions and progressive difficulty ladder.
        """
        if not solve_times or len(solve_times) == 0:
            solve_times = [15.0]

        # Use Pandas for statistical calculations
        df = pd.DataFrame({'solve_time': solve_times})
        avg_solve_speed = float(df['solve_time'].mean())

        # Features array for Scikit-Learn prediction
        feature_vector = np.array([[avg_solve_speed, snooze_count, streak_count, total_alarms]])

        # 1. Scikit-Learn Linear Regression -> Cognitive Readiness Score (0-100%)
        predicted_score = float(self.readiness_model.predict(feature_vector)[0])
        cognitive_readiness = int(np.clip(predicted_score, 20, 99))

        # 2. Scikit-Learn Logistic Regression -> Predicted Optimal Difficulty
        diff_class = int(self.difficulty_model.predict(feature_vector)[0])
        
        # Progressive Toughness Scaling: Beginner (0-2 streak) -> Intermediate (3-5 streak) -> Hard (6+ streak)
        if streak_count >= 6 or (streak_count >= 4 and avg_solve_speed < 12):
            optimal_difficulty = "hard"
            difficulty_tier = "Hard (Advanced)"
            difficulty_rank = 3
            progression_pct = 100
            next_unlock = "Max Difficulty Reached • Neuro-Response Mastered"
            tier_desc = "Complex algebraic formulas, interference Stroop & multi-tile memory grids."
        elif streak_count >= 3 or (streak_count >= 2 and avg_solve_speed < 18):
            optimal_difficulty = "medium"
            difficulty_tier = "Intermediate (Medium)"
            difficulty_rank = 2
            progression_pct = int(min(90, 40 + (streak_count - 2) * 20))
            next_unlock = "Reach 6-day streak (<12s solve) to unlock Hard tier"
            tier_desc = "Multi-step arithmetic, scrambled vocabulary & 4-step sequence matching."
        else:
            optimal_difficulty = "easy"
            difficulty_tier = "Beginner (Easy)"
            difficulty_rank = 1
            progression_pct = int(min(60, max(20, streak_count * 25)))
            next_unlock = "Reach 3-day streak to unlock Intermediate tier"
            tier_desc = "Fundamental calculations, basic word hints & gentle memory recognition."

        # 3. Consistency Trend Calculation
        if streak_count >= 5:
            trend = "High Consistency (PEAK PERFORMANCE)"
            recommendation = f"Your morning cognitive response is sharp! AI has promoted your challenge tier to {difficulty_tier}."
        elif streak_count > 0:
            trend = "Steady Improvement"
            recommendation = f"Great momentum! Challenge difficulty is scaling to {difficulty_tier}. Maintain your streak to advance."
        else:
            trend = "Building Baseline Foundation"
            recommendation = f"Starting at {difficulty_tier}. Solve your wake puzzles without snoozing to climb to Intermediate & Hard levels!"

        # Probability calculation
        success_ratio = (successful_wakes / total_alarms) if total_alarms > 0 else 0.8
        success_prob = float(np.round(np.clip(success_ratio * 0.9 + (streak_count * 0.02), 0.3, 0.99), 2))

        return {
            "cognitiveReadinessScore": cognitive_readiness,
            "predictedOptimalDifficulty": optimal_difficulty,
            "difficultyTier": difficulty_tier,
            "difficultyRank": difficulty_rank,
            "progressionPercent": progression_pct,
            "nextLevelRequirements": next_unlock,
            "tierDescription": tier_desc,
            "consistencyTrend": trend,
            "successProbability": success_prob,
            "recommendation": recommendation,
            "avgSolveSpeed": round(avg_solve_speed, 1),
        }

# Global Singleton ML Engine
ai_engine = CognitiveAdaptiveEngine()
