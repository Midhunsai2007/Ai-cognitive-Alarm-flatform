import os
import sys
from datetime import datetime as dt
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base

DEFAULT_AVATAR = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%2364748b"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>'

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    avatar = Column(Text, default=DEFAULT_AVATAR)
    streak_count = Column(Integer, default=0)
    best_streak = Column(Integer, default=0)
    total_alarms = Column(Integer, default=0)
    successful_wakes = Column(Integer, default=0)
    snooze_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=dt.utcnow)

    alarms = relationship("Alarm", back_populates="owner", cascade="all, delete-orphan")
    history_logs = relationship("HistoryLog", back_populates="owner", cascade="all, delete-orphan")
    solve_times = relationship("SolveTime", back_populates="owner", cascade="all, delete-orphan")

class Alarm(Base):
    __tablename__ = "alarms"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    time = Column(String, nullable=False)
    label = Column(String, nullable=False)
    days = Column(Text, nullable=False)  # JSON String array e.g. ["Mon","Tue"]
    cognitive_type = Column(String, default="math")
    difficulty = Column(String, default="medium")
    sound = Column(String, default="energetic")
    snooze_time = Column(Integer, default=5)
    active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=dt.utcnow)

    owner = relationship("User", back_populates="alarms")

class HistoryLog(Base):
    __tablename__ = "history_logs"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    datetime = Column(String, nullable=False)
    alarm_label = Column(String, nullable=False)
    status = Column(String, nullable=False)
    puzzle_type = Column(String, nullable=False)
    solve_time = Column(String, nullable=False)
    streak_impact = Column(String, nullable=False)
    created_at = Column(DateTime, default=dt.utcnow)

    owner = relationship("User", back_populates="history_logs")

class SolveTime(Base):
    __tablename__ = "solve_times"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    seconds = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=dt.utcnow)

    owner = relationship("User", back_populates="solve_times")
