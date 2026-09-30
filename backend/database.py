import os
from dotenv import load_dotenv

# Load environment variables
dotenv_path = os.path.join(os.path.dirname(__file__), ".env")
if os.path.exists(dotenv_path):
    load_dotenv(dotenv_path)

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "cognitive_alarm_db")
SECRET_KEY = os.getenv("SECRET_KEY", "cognitive_alarm_fastapi_secret_key_2026_super_secret_env")
ALGORITHM = os.getenv("ALGORITHM", "HS256")

# Supabase PostgreSQL Configuration
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://lnsgcroyrxlwdeyeommn.supabase.co")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxuc2djcm95cnhsd2RleWVvbW1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk1MzEzNzgsImV4cCI6MjEwNTEwNzM3OH0.dPI7TPVmwAvpzimyTwzWnI1kz6nos-r5rTtjV76_O-o")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
DATABASE_ENGINE = os.getenv("DATABASE_ENGINE", "supabase")

