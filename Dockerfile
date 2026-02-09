# BASE IMAGE
FROM python:3.10-slim-bullseye as builder

# ENV VARS
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# WORKDIR
WORKDIR /app

# DEPENDENCIES
RUN apt-get update && \
    apt-get install -y --no-install-recommends gcc libpq-dev && \
    rm -rf /var/lib/apt/lists/*

# INSTALL PYTHON DEPS
COPY requirements.txt .
RUN pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt

# RUNNER STAGE
FROM python:3.10-slim-bullseye

WORKDIR /app

# RUNTIME DEPS
RUN apt-get update && \
    apt-get install -y --no-install-recommends libpq5 netcat-openbsd && \
    rm -rf /var/lib/apt/lists/*

# COPY INSTALLED DEPS FROM BUILDER
COPY --from=builder /usr/local/lib/python3.10/site-packages /usr/local/lib/python3.10/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# COPY APP CODE
COPY . .

# ENTRYPOINT
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

ENTRYPOINT ["/app/entrypoint.sh"]
