from typing import List, Optional, Dict, Any
from pydantic import BaseModel

class UserSignUp(BaseModel):
    name: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserUpdate(BaseModel):
    name: str
    email: str
    avatar: Optional[str] = None

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    avatar: str
    streakCount: int
    bestStreak: int
    totalAlarms: int
    successfulWakes: int
    snoozeCount: int
    solveTimes: List[int] = []

    class Config:
        from_attributes = True

class AuthResponse(BaseModel):
    token: str
    user: UserResponse

class AlarmCreate(BaseModel):
    time: str
    label: str
    days: List[str]
    cognitiveType: Optional[str] = "math"
    difficulty: Optional[str] = "medium"
    sound: Optional[str] = "energetic"
    snoozeTime: Optional[int] = 5

class AlarmResponse(BaseModel):
    id: str
    time: str
    label: str
    days: List[str]
    cognitiveType: str
    difficulty: str
    sound: str
    active: bool
    snoozeTime: Optional[int] = 5

    class Config:
        from_attributes = True

class HistoryCreate(BaseModel):
    alarmLabel: str
    status: str
    puzzleType: str
    solveTime: str
    difficulty: Optional[str] = "medium"
    accuracy: Optional[float] = 95.0
    timeout_count: Optional[int] = 0
    q_line_completed: Optional[bool] = False
    total_questions: Optional[int] = 1

class HistoryResponse(BaseModel):
    id: str
    datetime: str
    alarmLabel: str
    status: str
    puzzleType: str
    solveTime: str
    streakImpact: str
    difficulty: Optional[str] = "medium"
    accuracy: Optional[float] = 95.0
    timeout_count: Optional[int] = 0
    q_line_completed: Optional[bool] = False
    total_questions: Optional[int] = 1

class MLPredictionResponse(BaseModel):
    cognitiveReadinessScore: int
    predictedOptimalDifficulty: str
    consistencyTrend: str
    successProbability: float
    recommendation: str
    habitScore: Optional[float] = None
    habitScoreBreakdown: Optional[Dict[str, Any]] = None
    difficultyTier: Optional[str] = None
    avgSolveSpeed: Optional[float] = None

    class Config:
        extra = "allow" 

