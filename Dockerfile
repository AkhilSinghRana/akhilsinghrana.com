# ── Build stage ──────────────────────────────────────────────────────────────
FROM python:3.12-slim-bookworm AS builder

WORKDIR /app

RUN apt-get update && \
    apt-get install -y --no-install-recommends build-essential libssl-dev libffi-dev && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

ENV UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy

COPY pyproject.toml uv.lock ./

# Install production deps only (no dev group)
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-dev --no-install-project

# ── Runtime stage ─────────────────────────────────────────────────────────────
FROM python:3.12-slim-bookworm AS runtime

WORKDIR /app

# Copy venv from builder
COPY --from=builder /app/.venv /app/.venv

# Copy backend package (includes db/faiss_db, bot_cache.json, content/)
COPY akhilsinghrana/backend ./akhilsinghrana/backend
COPY akhilsinghrana/__init__.py ./akhilsinghrana/__init__.py

# Copy blog HTML files (served by /api/blog/{slug} endpoint)
COPY akhilsinghrana/frontend/public/blogs ./akhilsinghrana/backend/blogs

ENV PATH="/app/.venv/bin:$PATH" \
    PYTHONPATH="/app" \
    PAGES_DIR="/app/akhilsinghrana/backend/blogs"

EXPOSE 8080

LABEL maintainer="Akhil Singh Rana <akhilsinghrana@gmail.com>"

CMD ["uvicorn", "akhilsinghrana.backend.main:app", "--host", "0.0.0.0", "--port", "8080"]
