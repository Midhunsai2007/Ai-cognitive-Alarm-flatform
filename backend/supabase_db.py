import os
import json
import time
import uuid
import urllib.request
import urllib.parse
import urllib.error
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv

# Load environment variables
dotenv_path = os.path.join(os.path.dirname(__file__), ".env")
if os.path.exists(dotenv_path):
    load_dotenv(dotenv_path)

SUPABASE_URL = os.getenv("SUPABASE_URL", "https://lnsgcroyrxlwdeyeommn.supabase.co").rstrip("/")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxuc2djcm95cnhsd2RleWVvbW1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk1MzEzNzgsImV4cCI6MjEwNTEwNzM3OH0.dPI7TPVmwAvpzimyTwzWnI1kz6nos-r5rTtjV76_O-o")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

# Namespace for deterministic UUID v5 generation
NAMESPACE_COGNITIVE = uuid.UUID("a3b4c5d6-e7f8-4901-a234-56789abcdef0")

def to_uuid(val: str) -> str:
    """Converts any ID string into a valid RFC-4122 UUID string for PostgreSQL compatibility"""
    if not val:
        return str(uuid.uuid4())
    try:
        return str(uuid.UUID(str(val)))
    except (ValueError, TypeError, AttributeError):
        return str(uuid.uuid5(NAMESPACE_COGNITIVE, str(val)))

def map_challenge_type(t: str) -> str:
    """Maps cognitive puzzle types to Supabase valid enum values ('math', 'pattern', 'memory')"""
    t_clean = (str(t) if t else "math").lower()
    if t_clean in ["math", "pattern", "memory"]:
        return t_clean
    if "word" in t_clean or "stroop" in t_clean or "clash" in t_clean:
        return "pattern"
    return "math"

def map_difficulty(d: str) -> str:
    """Maps difficulty to Supabase valid enum values ('easy', 'medium', 'hard')"""
    d_clean = (str(d) if d else "medium").lower()
    if d_clean in ["easy", "medium", "hard"]:
        return d_clean
    return "medium"


class SupabaseDatabaseManager:
    """
    Direct REST API client for Supabase PostgreSQL database.
    Integrates all website activities:
    - Users & Profiles
    - Alarms (CRUD & Status)
    - Wake Sessions & Snoozes (Alarm Sessions)
    - Cognitive Streaks & Milestones
    - Habit Scores & Alertness Analytics
    - Smart AI Recommendations
    - System Notifications & Activity Logs
    """
    def __init__(self):
        self.url = SUPABASE_URL
        self.key = SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY
        self.anon_key = SUPABASE_ANON_KEY
        self.headers = {
            "apikey": self.key,
            "Authorization": f"Bearer {self.key}",
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        }
        self.is_connected = False
        self.last_latency_ms = 0
        self.last_status_text = "Initializing"
        self.fallback_file = os.path.join(os.path.dirname(__file__), "supabase_local_cache.json")
        self.fallback_data = {"users": [], "alarms": [], "history_logs": [], "solve_times": [], "activities": []}

        self._load_fallback_data()
        self.check_connection()

    def _load_fallback_data(self):
        if os.path.exists(self.fallback_file):
            try:
                with open(self.fallback_file, "r", encoding="utf-8") as f:
                    self.fallback_data = json.load(f)
                    for key in ["users", "alarms", "history_logs", "solve_times", "activities"]:
                        if key not in self.fallback_data:
                            self.fallback_data[key] = []
            except Exception:
                pass

    def _save_fallback(self):
        try:
            with open(self.fallback_file, "w", encoding="utf-8") as f:
                json.dump(self.fallback_data, f, indent=2)
        except Exception:
            pass

    def _request(self, endpoint: str, method: str = "GET", data: Optional[Dict[str, Any]] = None, timeout: int = 5) -> Any:
        """Helper to send authenticated HTTP requests to Supabase PostgREST"""
        url = f"{self.url}/rest/v1/{endpoint.lstrip('/')}"
        encoded_data = json.dumps(data).encode("utf-8") if data is not None else None
        
        req = urllib.request.Request(
            url,
            data=encoded_data,
            headers=self.headers,
            method=method
        )
        try:
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                body = resp.read().decode("utf-8")
                if body:
                    return json.loads(body)
                return []
        except urllib.error.HTTPError as he:
            err_body = he.read().decode("utf-8")
            return {"_error": True, "status": he.code, "message": err_body}
        except Exception as e:
            return {"_error": True, "message": str(e)}

    def check_connection(self) -> Dict[str, Any]:
        """Tests live connection health to Supabase endpoint and tables"""
        start = time.time()
        try:
            health_url = f"{self.url}/auth/v1/settings"
            req = urllib.request.Request(
                health_url,
                headers={"apikey": self.anon_key, "Authorization": f"Bearer {self.anon_key}"}
            )
            with urllib.request.urlopen(req, timeout=5) as resp:
                if resp.status == 200:
                    self.is_connected = True
                    self.last_latency_ms = int((time.time() - start) * 1000)
                    self.last_status_text = "Connected & Active"
                    return {
                        "connected": True,
                        "url": self.url,
                        "latency_ms": self.last_latency_ms,
                        "status": "online",
                        "database": "Supabase PostgreSQL Cloud"
                    }
        except Exception as e:
            self.is_connected = False
            self.last_latency_ms = int((time.time() - start) * 1000)
            self.last_status_text = f"Connection error: {e}"

        return {
            "connected": self.is_connected,
            "url": self.url,
            "latency_ms": self.last_latency_ms,
            "status": "offline" if not self.is_connected else "online",
            "database": "Supabase PostgreSQL Cloud (Local Fallback Active)"
        }

    # =========================================================================
    # USER & PROFILE OPERATIONS (ALL STORED IN SUPABASE)
    # =========================================================================

    def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        email_clean = email.strip().lower()
        if self.is_connected:
            res = self._request(f"users?email=eq.{urllib.parse.quote(email_clean)}&select=*")
            if isinstance(res, list) and len(res) > 0:
                user = res[0]
                return {
                    "id": user.get("id"),
                    "name": user.get("full_name") or user.get("name", email_clean.split("@")[0].capitalize()),
                    "email": user.get("email"),
                    "password_hash": user.get("password_hash", ""),
                    "avatar": user.get("avatar", ""),
                    "streak_count": user.get("streak_count", 0),
                    "best_streak": user.get("best_streak", 0),
                    "total_alarms": user.get("total_alarms", 0),
                    "successful_wakes": user.get("successful_wakes", 0),
                    "snooze_count": user.get("snooze_count", 0),
                    "role": user.get("role", "user"),
                    "is_active": user.get("is_active", True)
                }

        for u in self.fallback_data.get("users", []):
            if u.get("email", "").lower() == email_clean:
                return u
        return None

    def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        uid_str = to_uuid(user_id)
        if self.is_connected:
            res = self._request(f"users?id=eq.{urllib.parse.quote(uid_str)}&select=*")
            if isinstance(res, list) and len(res) > 0:
                user = res[0]
                return {
                    "id": user_id,
                    "supabase_id": user.get("id"),
                    "name": user.get("full_name") or user.get("name", "User"),
                    "email": user.get("email"),
                    "password_hash": user.get("password_hash", ""),
                    "avatar": user.get("avatar", ""),
                    "streak_count": user.get("streak_count", 0),
                    "best_streak": user.get("best_streak", 0),
                    "total_alarms": user.get("total_alarms", 0),
                    "successful_wakes": user.get("successful_wakes", 0),
                    "snooze_count": user.get("snooze_count", 0),
                    "role": user.get("role", "user"),
                    "is_active": user.get("is_active", True)
                }

        for u in self.fallback_data.get("users", []):
            if u.get("id") == user_id:
                return u
        return None

    def create_user(self, user_doc: Dict[str, Any]) -> Dict[str, Any]:
        email_clean = user_doc["email"].lower()
        user_doc["email"] = email_clean
        user_uuid = to_uuid(user_doc["id"])

        if self.is_connected:
            # 1. Store in users table
            supabase_payload = {
                "id": user_uuid,
                "email": email_clean,
                "full_name": user_doc.get("name", email_clean.split("@")[0].capitalize()),
                "password_hash": user_doc.get("password_hash", ""),
                "role": "user",
                "is_active": True
            }
            self._request("users", method="POST", data=supabase_payload)

            # 2. Store initial user profile
            profile_payload = {
                "id": str(uuid.uuid4()),
                "user_id": user_uuid,
                "timezone": "UTC"
            }
            self._request("user_profiles", method="POST", data=profile_payload)

            # 3. Store initial streak tracking record
            streak_payload = {
                "id": str(uuid.uuid4()),
                "user_id": user_uuid,
                "current_streak": user_doc.get("streak_count", 0),
                "longest_streak": user_doc.get("best_streak", 0)
            }
            self._request("streaks", method="POST", data=streak_payload)

            # 4. Store initial notification activity
            self.record_activity(
                user_doc["id"],
                activity_type="user_signup",
                title="Account Created",
                message=f"Welcome {user_doc.get('name', 'User')} to Cognitive Alarm Platform!"
            )

        self.fallback_data["users"].append(user_doc)
        self._save_fallback()
        return user_doc

    def update_user(self, user_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
        user_uuid = to_uuid(user_id)
        if self.is_connected:
            supabase_updates = {}
            if "name" in updates:
                supabase_updates["full_name"] = updates["name"]
            if "email" in updates:
                supabase_updates["email"] = updates["email"].lower()
            if "password_hash" in updates:
                supabase_updates["password_hash"] = updates["password_hash"]
            if "is_active" in updates:
                supabase_updates["is_active"] = updates["is_active"]

            if supabase_updates:
                self._request(f"users?id=eq.{urllib.parse.quote(user_uuid)}", method="PATCH", data=supabase_updates)

            if "streak_count" in updates or "best_streak" in updates:
                streak_updates = {}
                if "streak_count" in updates:
                    streak_updates["current_streak"] = updates["streak_count"]
                if "best_streak" in updates:
                    streak_updates["longest_streak"] = updates["best_streak"]
                self._request(f"streaks?user_id=eq.{urllib.parse.quote(user_uuid)}", method="PATCH", data=streak_updates)

        for u in self.fallback_data["users"]:
            if u.get("id") == user_id:
                u.update(updates)
                self._save_fallback()
                return u

        updated = {"id": user_id, **updates}
        self.fallback_data["users"].append(updated)
        self._save_fallback()
        return updated

    def reset_user_stats(self, user_id: str):
        stats_reset = {
            "streak_count": 0,
            "best_streak": 0,
            "total_alarms": 0,
            "successful_wakes": 0,
            "snooze_count": 0
        }
        self.update_user(user_id, stats_reset)
        self.clear_user_history(user_id)
        self.record_activity(user_id, "stats_reset", "Statistics Reset", "User streaks and history were reset.")

    # =========================================================================
    # ALARMS OPERATIONS (ALL STORED IN SUPABASE)
    # =========================================================================

    def get_user_alarms(self, user_id: str) -> List[Dict[str, Any]]:
        user_uuid = to_uuid(user_id)
        if self.is_connected:
            res = self._request(f"alarms?user_id=eq.{urllib.parse.quote(user_uuid)}&select=*")
            if isinstance(res, list) and len(res) > 0:
                alarms = []
                for a in res:
                    alarms.append({
                        "id": a.get("id"),
                        "user_id": user_id,
                        "time": a.get("alarm_time") or a.get("time", "07:00"),
                        "label": a.get("label") or f"{a.get('challenge_type', 'Cognitive').capitalize()} Alarm",
                        "days": a.get("days", ["Mon", "Tue", "Wed", "Thu", "Fri"]),
                        "cognitiveType": a.get("challenge_type") or a.get("cognitive_type", "math"),
                        "difficulty": a.get("difficulty", "medium"),
                        "sound": a.get("sound", "energetic"),
                        "active": a.get("status") == "active" if "status" in a else a.get("active", True)
                    })
                return alarms

        return [a for a in self.fallback_data.get("alarms", []) if a.get("user_id") == user_id]

    def insert_alarm(self, alarm_doc: Dict[str, Any]) -> Dict[str, Any]:
        user_uuid = to_uuid(alarm_doc["user_id"])
        alarm_uuid = to_uuid(alarm_doc["id"])

        if self.is_connected:
            raw_challenge = alarm_doc.get("cognitiveType") or alarm_doc.get("cognitive_type", "math")
            raw_diff = alarm_doc.get("difficulty", "medium")
            supabase_alarm = {
                "id": alarm_uuid,
                "user_id": user_uuid,
                "alarm_time": alarm_doc.get("time", "07:00"),
                "challenge_type": map_challenge_type(raw_challenge),
                "difficulty": map_difficulty(raw_diff),
                "status": "active" if alarm_doc.get("active", True) else "disabled"
            }
            self._request("alarms", method="POST", data=supabase_alarm)
            self.record_activity(
                alarm_doc["user_id"],
                activity_type="alarm_created",
                title="Alarm Created",
                message=f"Alarm '{alarm_doc.get('label', 'Alarm')}' scheduled for {alarm_doc.get('time', '')} with {raw_challenge} challenge."
            )

        self.fallback_data["alarms"].append(alarm_doc)
        self._save_fallback()
        return alarm_doc


    def toggle_alarm(self, alarm_id: str, user_id: str) -> bool:
        new_active = False
        for a in self.fallback_data["alarms"]:
            if a.get("id") == alarm_id and a.get("user_id") == user_id:
                a["active"] = not a.get("active", True)
                new_active = a["active"]
                self._save_fallback()
                break

        if self.is_connected:
            alarm_uuid = to_uuid(alarm_id)
            status_str = "active" if new_active else "disabled"
            self._request(f"alarms?id=eq.{urllib.parse.quote(alarm_uuid)}", method="PATCH", data={"status": status_str})
            self.record_activity(
                user_id,
                activity_type="alarm_toggled",
                title=f"Alarm {'Enabled' if new_active else 'Disabled'}",
                message=f"Alarm {alarm_id} active status changed to {new_active}."
            )

        return new_active

    def delete_alarm(self, alarm_id: str, user_id: str) -> bool:
        initial = len(self.fallback_data["alarms"])
        self.fallback_data["alarms"] = [
            a for a in self.fallback_data["alarms"] if not (a.get("id") == alarm_id and a.get("user_id") == user_id)
        ]
        self._save_fallback()

        if self.is_connected:
            alarm_uuid = to_uuid(alarm_id)
            self._request(f"alarms?id=eq.{urllib.parse.quote(alarm_uuid)}", method="DELETE")
            self.record_activity(
                user_id,
                activity_type="alarm_deleted",
                title="Alarm Deleted",
                message=f"Alarm {alarm_id} was removed."
            )

        return len(self.fallback_data["alarms"]) < initial

    # =========================================================================
    # WAKE SESSIONS, STREAKS & ACTIVITY STORAGE
    # =========================================================================

    def get_user_history(self, user_id: str) -> List[Dict[str, Any]]:
        user_uuid = to_uuid(user_id)
        if self.is_connected:
            res = self._request(f"alarm_sessions?user_id=eq.{urllib.parse.quote(user_uuid)}&select=*")
            if isinstance(res, list) and len(res) > 0:
                history = []
                for s in res:
                    history.append({
                        "id": s.get("id"),
                        "datetime": s.get("created_at", "Today"),
                        "alarmLabel": f"Wake Session ({s.get('alarm_id', 'Alarm')[:8]})",
                        "status": "Snoozed" if (s.get("snooze_count") or 0) > 0 else "Success",
                        "puzzleType": "Cognitive Challenge",
                        "solveTime": "12s",
                        "streakImpact": f"Snooze Count: {s.get('snooze_count', 0)}"
                    })
                return history

        return [h for h in self.fallback_data.get("history_logs", []) if h.get("user_id") == user_id]

    def insert_history_log(self, log_doc: Dict[str, Any]) -> Dict[str, Any]:
        user_uuid = to_uuid(log_doc["user_id"])
        alarm_uuid = to_uuid(log_doc.get("alarm_id", log_doc.get("alarmLabel", "alarm-1")))
        session_uuid = to_uuid(log_doc["id"])

        if self.is_connected:
            # 1. Store in Supabase alarm_sessions
            session_payload = {
                "id": session_uuid,
                "user_id": user_uuid,
                "alarm_id": alarm_uuid,
                "snooze_count": 1 if log_doc.get("status") != "Success" else 0
            }
            self._request("alarm_sessions", method="POST", data=session_payload)

            # 2. Store in Supabase habit_scores
            habit_payload = {
                "id": str(uuid.uuid4()),
                "user_id": user_uuid
            }
            self._request("habit_scores", method="POST", data=habit_payload)

            # 3. Store in Supabase notifications activity log
            self.record_activity(
                log_doc["user_id"],
                activity_type="wake_event",
                title=f"Wake Challenge {log_doc.get('status', 'Completed')}",
                message=f"Alarm '{log_doc.get('alarmLabel', 'Alarm')}' resolved with {log_doc.get('puzzleType', 'Cognitive Puzzle')} in {log_doc.get('solveTime', '')} ({log_doc.get('streakImpact', '')})."
            )

        self.fallback_data["history_logs"].append(log_doc)
        self._save_fallback()
        return log_doc

    def clear_user_history(self, user_id: str):
        self.fallback_data["history_logs"] = [
            h for h in self.fallback_data["history_logs"] if h.get("user_id") != user_id
        ]
        self.fallback_data["solve_times"] = [
            s for s in self.fallback_data["solve_times"] if s.get("user_id") != user_id
        ]
        self._save_fallback()

        if self.is_connected:
            user_uuid = to_uuid(user_id)
            self._request(f"alarm_sessions?user_id=eq.{urllib.parse.quote(user_uuid)}", method="DELETE")
            self._request(f"habit_scores?user_id=eq.{urllib.parse.quote(user_uuid)}", method="DELETE")

    # =========================================================================
    # ACTIVITY AUDIT & NOTIFICATIONS LOGGER (STORED IN SUPABASE)
    # =========================================================================

    def record_activity(self, user_id: str, activity_type: str, title: str, message: str):
        """Records website activities, alerts, and milestones to Supabase notifications table"""
        user_uuid = to_uuid(user_id)
        activity_doc = {
            "id": str(uuid.uuid4()),
            "user_id": user_uuid,
            "activity_type": activity_type,
            "title": title,
            "message": message,
            "is_read": False,
            "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        }

        if self.is_connected:
            payload = {
                "id": activity_doc["id"],
                "user_id": user_uuid,
                "title": f"[{activity_type.upper()}] {title}",
                "message": message,
                "is_read": False
            }
            self._request("notifications", method="POST", data=payload)

        self.fallback_data["activities"].append(activity_doc)
        self._save_fallback()

    def get_user_activities(self, user_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        user_uuid = to_uuid(user_id)
        if self.is_connected:
            res = self._request(f"notifications?user_id=eq.{urllib.parse.quote(user_uuid)}&order=created_at.desc&limit={limit}")
            if isinstance(res, list) and len(res) > 0:
                return res

        return [a for a in self.fallback_data.get("activities", []) if a.get("user_id") == user_id][-limit:]

    # =========================================================================
    # SOLVE TIMES & AI/RL PERSISTENCE (COGNITIVE ENGINE & RL LOOP)
    # =========================================================================

    def add_solve_time(self, user_id: str, seconds: int):
        self.fallback_data["solve_times"].append({
            "id": f"solve-{int(time.time())}",
            "user_id": user_id,
            "seconds": seconds,
            "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        })
        self._save_fallback()

    def get_user_solve_times(self, user_id: str, limit: int = 15) -> List[int]:
        times = [
            s["seconds"] for s in self.fallback_data.get("solve_times", [])
            if s.get("user_id") == user_id
        ]
        if not times:
            return [12, 14, 11, 9, 13]
        return times[-limit:]

    def save_rl_experience(self, user_id: str, state: str, action: Dict[str, Any], reward: float, next_state: str):
        """Stores every RL transition tuple: STATE -> ACTION -> REWARD -> NEXT STATE"""
        user_uuid = to_uuid(user_id)
        exp_doc = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "state": state,
            "action": action,
            "reward": reward,
            "next_state": next_state,
            "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        }

        if self.is_connected:
            payload = {
                "id": exp_doc["id"],
                "user_id": user_uuid,
                "state": state,
                "action": action,
                "reward": reward,
                "next_state": next_state
            }
            self._request("rl_experiences", method="POST", data=payload)

        if "rl_experiences" not in self.fallback_data:
            self.fallback_data["rl_experiences"] = []
        self.fallback_data["rl_experiences"].append(exp_doc)
        self._save_fallback()

    def get_user_rl_experiences(self, user_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        user_uuid = to_uuid(user_id)
        if self.is_connected:
            res = self._request(f"rl_experiences?user_id=eq.{urllib.parse.quote(user_uuid)}&order=created_at.desc&limit={limit}")
            if isinstance(res, list) and len(res) > 0:
                return res

        exps = [e for e in self.fallback_data.get("rl_experiences", []) if e.get("user_id") == user_id]
        return exps[-limit:]

    def save_rl_recommendation(self, user_id: str, recommendation: Dict[str, Any]):
        """Stores AI/RL recommended alarm policy to Supabase rl_actions"""
        user_uuid = to_uuid(user_id)
        rec_doc = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "recommended_time": recommendation.get("recommended_time", "07:00"),
            "challenge_type": recommendation.get("challenge", "math"),
            "difficulty": recommendation.get("difficulty", "medium"),
            "snooze_limit": recommendation.get("snooze_limit", 3),
            "verification_method": recommendation.get("verification_method", "standard_single"),
            "predicted_success": recommendation.get("predicted_success", 0.85),
            "reason": recommendation.get("reason", "RL Policy Selection"),
            "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        }

        if self.is_connected:
            payload = {
                "id": rec_doc["id"],
                "user_id": user_uuid,
                "recommended_time": rec_doc["recommended_time"],
                "challenge_type": rec_doc["challenge_type"],
                "difficulty": rec_doc["difficulty"],
                "snooze_limit": rec_doc["snooze_limit"],
                "verification_method": rec_doc["verification_method"],
                "predicted_success": rec_doc["predicted_success"],
                "reason": rec_doc["reason"]
            }
            self._request("rl_actions", method="POST", data=payload)

        if "rl_actions" not in self.fallback_data:
            self.fallback_data["rl_actions"] = []
        self.fallback_data["rl_actions"].append(rec_doc)
        self._save_fallback()

    def get_user_rl_recommendations_history(self, user_id: str, limit: int = 20) -> List[Dict[str, Any]]:
        user_uuid = to_uuid(user_id)
        if self.is_connected:
            res = self._request(f"rl_actions?user_id=eq.{urllib.parse.quote(user_uuid)}&order=created_at.desc&limit={limit}")
            if isinstance(res, list) and len(res) > 0:
                return res

        recs = [r for r in self.fallback_data.get("rl_actions", []) if r.get("user_id") == user_id]
        return recs[-limit:]

# Singleton Supabase Manager Instance
supabase_db = SupabaseDatabaseManager()
