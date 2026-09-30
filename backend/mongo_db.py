import os
import json
import datetime
from typing import List, Dict, Any, Optional
import pymongo
from dotenv import load_dotenv

# Load environment variables from .env file
dotenv_path = os.path.join(os.path.dirname(__file__), ".env")
if os.path.exists(dotenv_path):
    load_dotenv(dotenv_path)

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("MONGO_DB_NAME", "cognitive_alarm_db")

class MongoDBManager:
    def __init__(self):
        self.is_connected = False
        self.client = None
        self.db = None
        self.fallback_file = os.path.join(os.path.dirname(__file__), "mongodb_store.json")
        self.fallback_data = {"users": [], "alarms": [], "history_logs": [], "solve_times": []}
        
        self._init_fallback_data()
        self._try_connect()

    def _init_fallback_data(self):
        if os.path.exists(self.fallback_file):
            try:
                with open(self.fallback_file, "r") as f:
                    self.fallback_data = json.load(f)
                    for key in ["users", "alarms", "history_logs", "solve_times"]:
                        if key not in self.fallback_data:
                            self.fallback_data[key] = []
            except Exception:
                pass
        else:
            self._save_fallback()

    def _save_fallback(self):
        try:
            with open(self.fallback_file, "w") as f:
                json.dump(self.fallback_data, f, indent=2)
        except Exception:
            pass

    def _try_connect(self):
        try:
            self.client = pymongo.MongoClient(MONGO_URI, serverSelectionTimeoutMS=1500)
            # Trigger server check
            self.client.admin.command('ping')
            self.db = self.client[DB_NAME]
            self.is_connected = True
            print(f"[MongoDB] Connected successfully to {MONGO_URI} (Database: {DB_NAME})")
        except Exception as e:
            self.is_connected = False
            print(f"[MongoDB] Live MongoDB server unavailable ({e}). Using embedded persistent MongoDB document engine.")

    # --- USERS COLLECTION METHODS ---

    def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        email_clean = email.lower()
        if self.is_connected:
            try:
                user = self.db.users.find_one({"email": email_clean})
                if user:
                    user["_id"] = str(user["_id"])
                    return user
            except Exception as e:
                print(f"[MongoDB Error] {e}")

        # Fallback Engine
        for u in self.fallback_data.get("users", []):
            if u.get("email", "").lower() == email_clean:
                return u
        return None

    def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        if self.is_connected:
            try:
                user = self.db.users.find_one({"id": user_id})
                if user:
                    user["_id"] = str(user["_id"])
                    return user
            except Exception as e:
                print(f"[MongoDB Error] {e}")

        # Fallback Engine
        for u in self.fallback_data.get("users", []):
            if u.get("id") == user_id:
                return u
        return None

    def create_user(self, user_doc: Dict[str, Any]) -> Dict[str, Any]:
        user_doc["email"] = user_doc["email"].lower()
        user_doc["created_at"] = datetime.datetime.utcnow().isoformat()
        if self.is_connected:
            try:
                res = self.db.users.insert_one(user_doc.copy())
                user_doc["_id"] = str(res.inserted_id)
                return user_doc
            except Exception as e:
                print(f"[MongoDB Error] {e}")

        # Fallback Engine
        self.fallback_data.setdefault("users", []).append(user_doc)
        self._save_fallback()
        return user_doc

    def update_user(self, user_id: str, update_fields: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        if self.is_connected:
            try:
                self.db.users.update_one({"id": user_id}, {"$set": update_fields})
                return self.get_user_by_id(user_id)
            except Exception as e:
                print(f"[MongoDB Error] {e}")

        # Fallback Engine
        for u in self.fallback_data.get("users", []):
            if u.get("id") == user_id:
                u.update(update_fields)
                self._save_fallback()
                return u
        return None

    def reset_user_stats(self, user_id: str) -> bool:
        update_fields = {
            "streak_count": 0,
            "best_streak": 0,
            "total_alarms": 0,
            "successful_wakes": 0,
            "snooze_count": 0
        }
        self.update_user(user_id, update_fields)
        self.clear_user_history(user_id)
        self.clear_user_solve_times(user_id)
        return True

    # --- SOLVE TIMES COLLECTION METHODS ---

    def add_solve_time(self, user_id: str, seconds: int):
        doc = {
            "user_id": user_id,
            "seconds": seconds,
            "created_at": datetime.datetime.utcnow().isoformat()
        }
        if self.is_connected:
            try:
                self.db.solve_times.insert_one(doc)
                return
            except Exception as e:
                print(f"[MongoDB Error] {e}")

        self.fallback_data.setdefault("solve_times", []).append(doc)
        self._save_fallback()

    def get_user_solve_times(self, user_id: str, limit: int = 10) -> List[int]:
        if self.is_connected:
            try:
                cursor = self.db.solve_times.find({"user_id": user_id}).sort("created_at", -1).limit(limit)
                return [d.get("seconds", 12) for d in cursor]
            except Exception as e:
                print(f"[MongoDB Error] {e}")

        user_st = [st.get("seconds", 12) for st in self.fallback_data.get("solve_times", []) if st.get("user_id") == user_id]
        return list(reversed(user_st))[-limit:]

    def clear_user_solve_times(self, user_id: str):
        if self.is_connected:
            try:
                self.db.solve_times.delete_many({"user_id": user_id})
                return
            except Exception as e:
                print(f"[MongoDB Error] {e}")

        self.fallback_data["solve_times"] = [st for st in self.fallback_data.get("solve_times", []) if st.get("user_id") != user_id]
        self._save_fallback()

    # --- ALARMS COLLECTION METHODS ---

    def get_user_alarms(self, user_id: str) -> List[Dict[str, Any]]:
        if self.is_connected:
            try:
                cursor = self.db.alarms.find({"user_id": user_id}).sort("created_at", -1)
                alarms = []
                for doc in cursor:
                    doc["_id"] = str(doc["_id"])
                    alarms.append(doc)
                return alarms
            except Exception as e:
                print(f"[MongoDB Error] {e}")

        return [a for a in self.fallback_data.get("alarms", []) if a.get("user_id") == user_id]

    def insert_alarm(self, alarm_doc: Dict[str, Any]) -> Dict[str, Any]:
        alarm_doc["created_at"] = datetime.datetime.utcnow().isoformat()
        if self.is_connected:
            try:
                res = self.db.alarms.insert_one(alarm_doc.copy())
                alarm_doc["_id"] = str(res.inserted_id)
                return alarm_doc
            except Exception as e:
                print(f"[MongoDB Error] {e}")

        self.fallback_data.setdefault("alarms", []).append(alarm_doc)
        self._save_fallback()
        return alarm_doc

    def toggle_alarm(self, alarm_id: str, user_id: str) -> bool:
        if self.is_connected:
            try:
                alarm = self.db.alarms.find_one({"id": alarm_id, "user_id": user_id})
                if alarm:
                    new_active = not alarm.get("active", True)
                    self.db.alarms.update_one({"id": alarm_id, "user_id": user_id}, {"$set": {"active": new_active}})
                    return new_active
            except Exception as e:
                print(f"[MongoDB Error] {e}")

        for a in self.fallback_data.get("alarms", []):
            if a.get("id") == alarm_id and a.get("user_id") == user_id:
                a["active"] = not a.get("active", True)
                self._save_fallback()
                return a["active"]
        return False

    def delete_alarm(self, alarm_id: str, user_id: str) -> bool:
        if self.is_connected:
            try:
                res = self.db.alarms.delete_one({"id": alarm_id})
                if res.deleted_count > 0:
                    return True
            except Exception as e:
                print(f"[MongoDB Error] {e}")

        initial_len = len(self.fallback_data.get("alarms", []))
        self.fallback_data["alarms"] = [
            a for a in self.fallback_data.get("alarms", [])
            if not (str(a.get("id")) == str(alarm_id) or str(a.get("_id", "")) == str(alarm_id))
        ]
        if len(self.fallback_data["alarms"]) < initial_len:
            self._save_fallback()
            return True
        return True

    # --- HISTORY LOGS COLLECTION METHODS ---

    def get_user_history(self, user_id: str) -> List[Dict[str, Any]]:
        if self.is_connected:
            try:
                cursor = self.db.history_logs.find({"user_id": user_id}).sort("created_at", -1)
                logs = []
                for doc in cursor:
                    doc["_id"] = str(doc["_id"])
                    logs.append(doc)
                return logs
            except Exception as e:
                print(f"[MongoDB Error] {e}")

        return [l for l in self.fallback_data.get("history_logs", []) if l.get("user_id") == user_id]

    def insert_history_log(self, log_doc: Dict[str, Any]) -> Dict[str, Any]:
        log_doc["created_at"] = datetime.datetime.utcnow().isoformat()
        if self.is_connected:
            try:
                res = self.db.history_logs.insert_one(log_doc.copy())
                log_doc["_id"] = str(res.inserted_id)
                return log_doc
            except Exception as e:
                print(f"[MongoDB Error] {e}")

        self.fallback_data.setdefault("history_logs", []).insert(0, log_doc)
        self._save_fallback()
        return log_doc

    def clear_user_history(self, user_id: str) -> bool:
        if self.is_connected:
            try:
                self.db.history_logs.delete_many({"user_id": user_id})
                return True
            except Exception as e:
                print(f"[MongoDB Error] {e}")

        self.fallback_data["history_logs"] = [l for l in self.fallback_data.get("history_logs", []) if l.get("user_id") != user_id]
        self._save_fallback()
        return True

# Global MongoDB Singleton Manager
mongo_db = MongoDBManager()
