# Use official lightweight Python image
FROM python:3.11-slim

# Prevent Python from writing bytecode and enable immediate log streaming
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install system dependencies (curl for container healthcheck, libgomp1 for XGBoost OpenMP runtime)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source code
COPY . .

# Ensure ai_data folder exists for model persistence
RUN mkdir -p ai_data

# Expose backend port
EXPOSE 8000

# Healthcheck to verify service availability
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/docs || exit 1

# Start FastAPI application with dynamic PORT support for Render and Cloud providers
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]

