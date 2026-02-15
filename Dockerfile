# ===========================
# STAGE 1 — BUILD FRONTEND
# ===========================
FROM node:18 AS frontend-builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

# Copiamos todo el proyecto
COPY . .

# Aseguramos variables para build
RUN cp .env.build .env

RUN npm run build

# ===========================
# STAGE 2 — BACKEND (PROD)
# ===========================
FROM python:3.10

WORKDIR /app

RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY src/ ./src/
COPY migrations ./migrations

# Copiamos el frontend ya compilado
COPY --from=frontend-builder /app/public /app/public

ENV FLASK_ENV=production
ENV FLASK_APP=src/app.py

EXPOSE 5000

CMD ["gunicorn", "-w", "3", "-b", "0.0.0.0:5000", "src.app:app"]

